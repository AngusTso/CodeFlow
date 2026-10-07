/**
 * shared/ai/mockAi.js — deterministic "AI" generation (simulated).
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   AGENTS.md requires deterministic mock functions for generateStoryboard(),
 *   generateScene(), generateCharacter(), regenerateScene() and composeVideo().
 *   This file is the fake backend, shared by every prototype, so the AI
 *   WORKFLOW behaves identically even though each prototype looks different.
 *
 * HOW THE "AI" WORKS (and why it feels real without being real)
 *   1. The user's idea text is hashed into a seed (see utils/random.js).
 *   2. That seed drives a tiny PRNG, so the SAME idea always produces the SAME
 *      storyboard. Demos are reproducible; nothing is random noise.
 *   3. Keywords in the idea pick the scene types, so "space station" produces
 *      sci-fi scenes and "forest" produces nature scenes — the output looks
 *      like it understood the prompt.
 *   4. Every call resolves after a short delay so the loading state is visible.
 *
 * IMPORTANT (AGENTS.md): we deliberately DO NOT return fake "reasoning" or
 * chain-of-thought text. The user only ever sees simple, friendly messages.
 */

import { createRng, pick, intBetween } from '../utils/random.js'
import { simulate, simulateScaled } from '../utils/async.js'
import {
  createScene,
  createStoryboard,
  createCharacter,
  createVideoComposition,
  createVariation,
  createCopilotProposal,
} from '../domain/models.js'
import {
  SCENE_TYPES,
  MOODS,
  CAMERAS,
  STYLES,
  LIGHTING,
  TRANSITIONS,
  SCENE_TITLE_BANK,
  SCENE_PROMPT_BANK,
  LOGLINE_TEMPLATES,
  AUDIO_TRACKS,
  CHARACTER_TEMPLATES,
  CHARACTER_OUTFITS,
  CHARACTER_EXPRESSIONS,
  EXPORT_PLATFORMS,
  byId,
  labelOf,
  gradientFor,
  sceneArtworkFor,
  LENSES,
  MOVEMENTS,
  FRAMINGS,
  LIGHTING_CONTRAST,
} from '../data/mockData.js'

/* ========================================================================== */
/* 1. User-facing loading messages                                            */
/*    Casual, playful, and free of technical jargon (see DESIGN_PROTOTYPE1).  */
/* ========================================================================== */

/**
 * Pool of friendly messages. The store picks one per generation so repeated
 * actions don't feel robotic, while the copy stays persona-appropriate for a
 * casual creator.
 * @type {Record<string, string[]>}
 */
export const AI_MESSAGES = {
  storyboard: [
    '✨ Creating your storyboard...',
    '✨ AI is drawing your scenes...',
    '✨ Laying out your shot list...',
  ],
  scene: [
    '✨ AI is doing its magic...',
    '✨ Painting a fresh take on this scene...',
    '✨ Re-imagining this shot...',
  ],
  character: ['✨ Designing your character...', '✨ AI is sketching a new look...'],
  video: [
    '✨ Assembling your video...',
    '✨ Adding transitions and music...',
    '✨ Rendering a preview...',
  ],
  export: ['✨ Preparing your export...'],
}

/**
 * Pick a friendly loading message for a given task.
 * @param {keyof typeof AI_MESSAGES} task
 * @param {() => number} [rng] - Optional generator for deterministic tests.
 * @returns {string}
 */
export function messageFor(task, rng) {
  const pool = AI_MESSAGES[task] || AI_MESSAGES.scene
  return rng ? pick(rng, pool) : pool[Math.floor(Math.random() * pool.length)]
}

/* ========================================================================== */
/* 2. Prompt understanding (keyword → scene type inference)                   */
/* ========================================================================== */

/**
 * Keywords that hint at each scene type. Deliberately simple and readable —
 * this is a design prototype, not an NLU system.
 * @type {Record<string, string[]>}
 */
const TYPE_KEYWORDS = {
  urban: ['city', 'street', 'neon', 'urban', 'downtown', 'traffic', 'building', 'tokyo', 'rooftop', 'cafe'],
  nature: ['forest', 'mountain', 'river', 'nature', 'beach', 'meadow', 'tree', 'wild', 'garden', 'lake', 'sunrise'],
  'sci-fi': ['space', 'planet', 'station', 'robot', 'cyber', 'futuristic', 'galaxy', 'orbit', 'alien', 'spaceship', 'diver'],
  fantasy: ['dragon', 'magic', 'castle', 'knight', 'fantasy', 'ruins', 'wizard', 'spell', 'myth', 'lantern'],
  abstract: ['abstract', 'pattern', 'colour', 'color', 'shape', 'geometric', 'motion', 'gradient', 'texture'],
}

/**
 * Guess which scene types an idea refers to.
 *
 * Returns types ordered by how many keywords matched, so the strongest match
 * leads the storyboard. Falls back to a pleasant default mix when nothing
 * matches (a blank or very short idea).
 *
 * @param {string} idea - The user's raw concept text.
 * @returns {string[]} One or more SCENE_TYPES ids, most relevant first.
 */
export function inferSceneTypes(idea = '') {
  const text = String(idea).toLowerCase()
  const scored = Object.entries(TYPE_KEYWORDS)
    .map(([type, keywords]) => ({
      type,
      score: keywords.reduce((total, word) => (text.includes(word) ? total + 1 : total), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) return ['urban', 'nature', 'sci-fi'] // friendly default
  return scored.map((entry) => entry.type)
}

/* ========================================================================== */
/* 3. Internal scene builders (not exported)                                  */
/* ========================================================================== */

/**
 * Build ONE scene using the supplied PRNG.
 *
 * @param {() => number} rng - Seeded generator.
 * @param {number} index - Zero-based position (drives `order` + gradient).
 * @param {{type: string}} options
 * @returns {import('../domain/models.js').Scene}
 */
export function buildScene(rng, index, { type }) {
  // Guard against an unknown type so the banks below never return undefined.
  const safeType = SCENE_TITLE_BANK[type] ? type : 'urban'

  const title = pick(rng, SCENE_TITLE_BANK[safeType])
  const fragment = pick(rng, SCENE_PROMPT_BANK[safeType])
  const mood = pick(rng, MOODS).id
  const camera = pick(rng, CAMERAS).id
  const style = pick(rng, STYLES).id
  const lighting = pick(rng, LIGHTING).id
  const transition = pick(rng, TRANSITIONS).id
  const artwork = sceneArtworkFor(safeType, `${title} ${fragment}`, index)

  return createScene({
    order: index + 1,
    title,
    // Human-readable prompt assembled from the chosen parameters — i.e. what a
    // real text-to-video model would receive.
    prompt: `${fragment}, ${labelOf(MOODS, mood)} mood, ${labelOf(LIGHTING, lighting)} lighting, ${labelOf(STYLES, style)} style`,
    type: safeType,
    typeLabel: byId(SCENE_TYPES, safeType).label,
    mood,
    camera,
    style,
    lighting,
    duration: intBetween(rng, 4, 9),
    transition,
    gradient: gradientFor(safeType, index),
    ...artwork,
    alt: `${artwork.alt} Scene ${index + 1}: ${title}.`,
  })
}

/**
 * Compose a one-sentence logline from the first scene's title.
 * @param {() => number} rng
 * @param {import('../domain/models.js').Scene[]} scenes
 * @returns {string}
 */
function buildLogline(rng, scenes) {
  const template = pick(rng, LOGLINE_TEMPLATES)
  const first = scenes[0]?.title?.toLowerCase() || 'a single striking image'
  return template.replace('%s', first)
}

/* ========================================================================== */
/* 4. PUBLIC GENERATORS — the five functions required by AGENTS.md             */
/* ========================================================================== */

/**
 * generateStoryboard() — turn an idea into an ordered set of scenes.
 *
 * @param {string} idea - The user's concept text.
 * @param {object} [options]
 * @param {number} [options.count] - Force a specific number of scenes.
 * @param {string[]} [options.types] - Force the scene types to use.
 * @param {string} [options.templateId] - Included in the seed so templates are
 *   reproducible independently of free-text ideas.
 * @returns {Promise<import('../domain/models.js').Storyboard>}
 */
export function generateStoryboard(idea = '', options = {}) {
  const rng = createRng(`storyboard::${idea}::${options.templateId || ''}`)

  const typePool = options.types?.length ? options.types : inferSceneTypes(idea)
  const count = options.count ?? intBetween(rng, 4, 5)

  const scenes = Array.from({ length: count }, (_, index) =>
    buildScene(rng, index, { type: typePool[index % typePool.length] }),
  )

  const storyboard = createStoryboard(scenes, buildLogline(rng, scenes))

  // Longer storyboards take marginally longer to "generate".
  return simulateScaled(storyboard, count)
}

/**
 * generateScene() — create a single new scene (used by "Add scene").
 *
 * @param {string} seedText - Usually the project idea, so additions stay on-theme.
 * @param {object} [options]
 * @param {number} [options.variant=0] - Bump to get a different result.
 * @param {string} [options.type] - Force a scene type.
 * @param {number} [options.order=0] - Position, for `order` + gradient variety.
 * @returns {Promise<import('../domain/models.js').Scene>}
 */
export function generateScene(seedText = '', options = {}) {
  const rng = createRng(`scene::${seedText}::${options.variant ?? 0}`)
  const type = options.type || inferSceneTypes(seedText)[0]
  return simulate(buildScene(rng, options.order ?? 0, { type }), 900)
}

/**
 * regenerateScene() — produce a NEW variation of an existing scene.
 *
 * Deterministic per (scene id, variant): pressing "Regenerate" twice shows two
 * different results because the store increments `variant` each time.
 *
 * @param {import('../domain/models.js').Scene} scene
 * @param {number} [variant=1] - Regeneration counter for this scene.
 * @returns {Promise<import('../domain/models.js').Scene>}
 */
export function regenerateScene(scene, variant = 1) {
  const rng = createRng(`regen::${scene.id}::${scene.type}::${variant}`)
  const rebuilt = buildScene(rng, (scene.order || 1) - 1, { type: scene.type })

  // Preserve the user's deliberate choices; only the AI-made parts change.
  return simulate(
    {
      ...rebuilt,
      id: scene.id, // keep identity so Vue keys, selection and focus survive
      order: scene.order,
      duration: scene.duration,
      transition: scene.transition,
    },
    950,
  )
}

/**
 * generateCharacter() — create a character from an AI template plus options.
 *
 * @param {object} [options]
 * @param {string} [options.templateId] - A CHARACTER_TEMPLATES id.
 * @param {string} [options.outfit]
 * @param {string} [options.expression]
 * @param {string} [options.pose]
 * @param {number} [options.variant=0] - Bump for a different suggested look.
 * @returns {Promise<import('../domain/models.js').Character>}
 */
export function generateCharacter(options = {}) {
  const template =
    CHARACTER_TEMPLATES.find((entry) => entry.id === options.templateId) || CHARACTER_TEMPLATES[0]

  const rng = createRng(`character::${template.id}::${options.variant ?? 0}`)
  const [from, to] = template.palette

  const character = createCharacter({
    name: template.name,
    templateId: template.id,
    archetype: template.archetype,
    description: template.description,
    outfit: options.outfit || pick(rng, CHARACTER_OUTFITS),
    expression: options.expression || pick(rng, CHARACTER_EXPRESSIONS),
    pose: options.pose || template.pose,
    gradient: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    imageUrl: template.imageUrl,
    alt: `${template.alt} Character: ${template.archetype}, ${template.name}.`,
  })

  return simulate(character, 950)
}

/**
 * composeVideo() — stitch scenes (+ characters) into a finished composition.
 *
 * @param {import('../domain/models.js').Scene[]} scenes
 * @param {import('../domain/models.js').Character[]} [characters]
 * @param {object} [options]
 * @param {string} [options.platform='tiktok'] - An EXPORT_PLATFORMS id.
 * @returns {Promise<import('../domain/models.js').VideoComposition>}
 */
export function composeVideo(scenes, characters = [], options = {}) {
  const platformId = options.platform || 'tiktok'
  const platform = EXPORT_PLATFORMS.find((entry) => entry.id === platformId) || EXPORT_PLATFORMS[0]

  const rng = createRng(`compose::${scenes.map((scene) => scene.id).join('-')}::${platformId}`)

  const totalSeconds = scenes.reduce((sum, scene) => sum + (scene.duration || 0), 0)

  const composition = createVideoComposition({
    ready: true,
    totalDuration: totalSeconds,
    resolution: platform.resolution,
    aspectRatio: platform.aspectRatio,
    format: platform.format,
    platform: platform.id,
    audioTrack: pick(rng, AUDIO_TRACKS),
    // One transition between each pair of scenes.
    transitions: scenes.slice(0, -1).map((scene) => scene.transition),
    status: 'ready',
  })

  // Characters influence the real product; here we only record that they exist
  // so the composition can mention them. (Kept explicit rather than silent.)
  void characters

  return simulateScaled(composition, Math.max(1, scenes.length), 900, 150)
}

/**
 * simulateExport() — pretend to render and hand back a shareable result.
 * Used by the Video step's export panel.
 *
 * @param {{platform: string, resolution: string, format: string, fps: number}} settings
 * @returns {Promise<{ok: true, filename: string, size: string, settings: object}>}
 */
export function simulateExport(settings) {
  const filename = `code-flow-${settings.platform}-${settings.fps}fps.mp4`
  return simulate(
    {
      ok: true,
      filename,
      // Invented but plausible file size, scaled a little by frame rate.
      size: `${((settings.fps / 30) * 12).toFixed(1)} MB`,
      settings: { ...settings },
    },
    1400,
  )
}

/* ========================================================================== */
/* Prototype 02 generators (Prototype 02 brief, sections 10, 11, 15, 29).      */
/* --------------------------------------------------------------------------- */
/* Same contract as everything above: deterministic, short simulated delay,     */
/* and NEVER expose fake model reasoning or fake percentage progress.           */
/*                                                                             */
/* Brief section 29 is the rule these exist to satisfy:                        */
/*   "Avoid static AI magic buttons that do not produce meaningful UI state     */
/*    changes." Every proposal below therefore carries a concrete `patch` that  */
/*   visibly changes both the Inspector and the preview when applied.           */
/* ========================================================================== */

/**
 * Creative directions the Copilot can propose. Matching is keyword-based so
 * the result is deterministic for a given instruction (same idea as
 * `inferSceneTypes` above - this is a prototype, not an NLU system).
 * @type {{id: string, match: RegExp, summary: string, changes: string[], patch: object}[]}
 */
const COPILOT_DIRECTIONS = [
  {
    id: 'tense',
    match: /tense|thriller|dark|suspense|noir|tension/i,
    summary: 'Tightens framing and hardens contrast for a tense thriller read.',
    changes: ['Lighting', 'Colour palette', 'Camera movement', 'Mood'],
    patch: {
      lens: '85mm',
      framing: 'Medium Close',
      movement: 'Push-in',
      lightingIntensity: 78,
      lightingContrast: 'High',
      gradient: 'linear-gradient(135deg, #1b2740 0%, #2f4a63 100%)',
    },
  },
  {
    id: 'cinematic',
    match: /cinematic|film|movie|epic|shot/i,
    summary: 'Adds a slow push-in with cinematic contrast.',
    changes: ['Camera movement', 'Lighting', 'Framing'],
    patch: {
      lens: '50mm',
      framing: 'Medium Close',
      movement: 'Push-in',
      lightingContrast: 'High',
      gradient: 'linear-gradient(135deg, #1a2c40 0%, #2b4a66 100%)',
    },
  },
  {
    id: 'warm',
    match: /warm|bright|cheer|friendly|uplift|soft|happy/i,
    summary: 'Lifts the light and softens contrast for a warmer read.',
    changes: ['Lighting', 'Colour palette', 'Mood'],
    patch: {
      lightingIntensity: 84,
      lightingContrast: 'Low',
      movement: 'Tracking',
      gradient: 'linear-gradient(135deg, #2c3d47 0%, #4a6b7d 100%)',
    },
  },
  {
    id: 'scale',
    match: /wide|scale|grand|vast|establish|reveal/i,
    summary: 'Widens the lens and pulls back to reveal scale.',
    changes: ['Lens', 'Framing', 'Camera movement'],
    patch: { lens: '18mm', framing: 'Extreme Wide', movement: 'Crane' },
  },
  {
    id: 'urgent',
    match: /urgent|real|docu|chase|run|handheld|immediate/i,
    summary: 'Switches to handheld for a more immediate documentary feel.',
    changes: ['Camera movement', 'Framing'],
    patch: { movement: 'Handheld', framing: 'Close' },
  },
]

/** Used when no keyword matches, so a proposal always returns something useful. */
const COPILOT_FALLBACK = {
  id: 'refine',
  summary: 'Refines contrast and camera movement for a cleaner composition.',
  changes: ['Lighting', 'Camera movement'],
  patch: { movement: 'Push-in', lightingIntensity: 72, lightingContrast: 'Medium' },
}

/**
 * proposeChanges() - turn a free-text instruction into a reviewable proposal.
 *
 * This is one half of Prototype 02's core loop (brief section 30):
 *   DIRECT -> GENERATE -> COMPARE -> ACCEPT / UNDO
 *
 * Only creative changes are listed (brief section 10). The proposal lists
 * "Lighting" and "Camera movement", never anything resembling model internals.
 *
 * @param {string} instruction - The user's natural-language direction.
 * @param {Scene} [scene] - The scene the proposal targets.
 * @returns {Promise<CopilotProposal>}
 */
export function proposeChanges(instruction = '', scene = {}) {
  const direction =
    COPILOT_DIRECTIONS.find((entry) => entry.match.test(instruction)) || COPILOT_FALLBACK

  const proposal = createCopilotProposal({
    instruction,
    summary: direction.summary,
    changes: [...direction.changes],
    patch: { ...direction.patch },
    status: 'pending',
  })

  // Short, skippable latency so the review step is actually visible.
  return simulate(proposal, 780)
}
/**
 * Variation directions. One is chosen per `variant`, so pressing "Generate
 * Another" walks through them in a deterministic order rather than ever
 * repeating the same take twice by accident.
 * @type {{summary: string, changes: string[], gradient: string}[]}
 */
const VARIATION_DIRECTIONS = [
  {
    summary: 'Tighter framing and harder contrast for a tense read.',
    changes: ['Lighting', 'Camera movement', 'Framing'],
    gradient: 'linear-gradient(135deg, #1b2740 0%, #2f4a63 100%)',
  },
  {
    summary: 'Wider lens and crane movement to open up the space.',
    changes: ['Lens', 'Camera movement'],
    gradient: 'linear-gradient(135deg, #243447 0%, #3d5a75 100%)',
  },
  {
    summary: 'Softer, brighter grade with reduced contrast.',
    changes: ['Lighting', 'Colour palette'],
    gradient: 'linear-gradient(135deg, #2b3d4d 0%, #4a6b7d 100%)',
  },
  {
    summary: 'Handheld treatment for a more immediate feel.',
    changes: ['Camera movement', 'Framing'],
    gradient: 'linear-gradient(135deg, #1f2a36 0%, #37506b 100%)',
  },
  {
    summary: 'Medium framing with a slow push for a steadier beat.',
    changes: ['Lens', 'Camera movement'],
    gradient: 'linear-gradient(135deg, #1a2530 0%, #2e4356 100%)',
  },
]

/**
 * generateVariation() - produce a NEW variant of a scene (brief section 15).
 *
 * The baseline scene is never mutated. The caller stores the returned variation
 * alongside the original, so "Keep Original" and "Use Variation" both stay
 * available - "the original must remain recoverable".
 *
 * Deterministic per (scene id, variant), matching every other generator here.
 *
 * @param {Scene} scene - The scene to derive a variation from.
 * @param {number} [variant=1] - 1-based counter, bumped on each request.
 * @returns {Promise<Variation>}
 */
export function generateVariation(scene, variant = 1) {
  const rng = createRng(`variation::${scene.id}::${scene.type || ''}::${variant}`)

  // Walk the direction list deterministically so "Generate Another" always
  // yields something visibly different.
  const direction = VARIATION_DIRECTIONS[(Math.max(1, variant) - 1) % VARIATION_DIRECTIONS.length]

  const value = {
    ...scene,
    lens: pick(rng, LENSES),
    movement: pick(rng, MOVEMENTS),
    framing: pick(rng, FRAMINGS),
    lightingIntensity: intBetween(rng, 45, 92),
    lightingContrast: pick(rng, LIGHTING_CONTRAST),
    origin: 'ai-variation',
    gradient: direction.gradient,
    // Identity and position are preserved so Vue keys, selection and timeline
    // links keep working when a variation replaces the displayed frame.
    id: scene.id,
    order: scene.order,
  }

  const variation = createVariation(scene, {
    label: `Variation ${String(variant).padStart(2, '0')}`,
    summary: direction.summary,
    changes: [...direction.changes],
    value,
  })

  return simulate(variation, 1150)
}