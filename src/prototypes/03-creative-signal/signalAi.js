/**
 * 03-creative-signal/signalAi.js - Prototype 03's simulated creative AI.
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS (brief sections 21, 56, 74.3)
 *   The brief asks for a mock service layer that is SEPARATE from the UI:
 *
 *       UI -> Creative Exploration State -> Mock AI Service -> Results -> UI
 *
 *   So no button in this prototype hard-codes generated text. Every possibility,
 *   synthesis, branch and recommendation is produced here, deterministically.
 *
 * REUSE (brief section 74.1)
 *   The VIDEO half of the pipeline is genuinely shared. `generateStoryboard`
 *   delegates to shared/ai/mockAi.js and returns real shared Scene objects, so
 *   Prototype 03's storyboard is built by the same generator Prototype 01 and
 *   02 use. Only the EXPLORATORY half - signals, universe, synthesis, branches
 *   - is new, because only Prototype 03 has one.
 *
 * DETERMINISM (brief section 21)
 *   Everything is seeded from shared/utils/random.js, so the same signal always
 *   produces the same universe. The demo path in section 71 therefore replays
 *   identically every time.
 *
 * HONESTY (brief section 82)
 *   Nothing here claims a model is thinking. `reason` fields are short, factual
 *   statements about the COMBINATION that was made ("Strong contrast between X
 *   and Y"), never fabricated chain-of-thought. AI_MESSAGES are plain stage
 *   labels, not percentages.
 */

import { createRng, pick, intBetween, shuffle } from '../../shared/utils/random.js'
import { delay, simulate } from '../../shared/utils/async.js'
// Aliased on import: this file also EXPORTS a function of the same name (the
// brief's section 74.3 API), so the shared generator needs an unambiguous
// local name. `sharedGenerateStoryboard` is still the SAME shared function
// Prototype 01 and 02 use - only the local identifier differs.
import { generateStoryboard as sharedGenerateStoryboard } from '../../shared/ai/mockAi.js'
import {
  createNode,
  createStabilizedConcept,
  createSynthesis,
} from './signalModels.js'

/* ========================================================================== */
/* 1. Synthesis modes (brief section 20)                                       */
/* --------------------------------------------------------------------------- */
/* A SMALL number, as the brief insists: "the user should not need to configure */
/* dozens of parameters". Each mode re-weights the title grammar below.         */
/* ========================================================================== */

/**
 * @type {{id: string, label: string, hint: string}[]}
 */
export const SYNTHESIS_MODES = [
  { id: 'unexpected', label: 'Unexpected', hint: 'Joins the signals at their strangest angle' },
  { id: 'cinematic', label: 'Cinematic', hint: 'Frames the idea as a shot you could cut to' },
  { id: 'dreamlike', label: 'Dreamlike', hint: 'Softens the logic into something felt' },
  { id: 'dark', label: 'Dark', hint: 'Pushes the consequence instead of the surface' },
  { id: 'chaotic', label: 'Chaotic', hint: 'Maximum collision, least explanation' },
  { id: 'minimal', label: 'Minimal', hint: 'Strips to one clean idea' },
  { id: 'surreal', label: 'Surreal', hint: 'Keeps the logic, loses the world' },
]

/* ========================================================================== */
/* 2. Creative vocabulary                                                      */
/* --------------------------------------------------------------------------- */
/* Keyword extraction is deliberately simple and readable. It is NOT an NLU    */
/* system - it exists so the output visibly reacts to the user's words.         */
/* ========================================================================== */

/**
 * Signal keywords grouped by theme. Each group seeds a different family of
 * concept words, which is what makes "forest" produce different possibilities
 * from "city" (brief section 21).
 * @type {{id: string, label: string, words: string[]}[]}
 */
export const SIGNAL_LEXICON = [
  {
    id: 'place',
    label: 'PLACE',
    words: ['city', 'street', 'building', 'tower', 'district', 'rooftop', 'skyline', 'downtown'],
  },
  {
    id: 'nature',
    label: 'NATURE',
    words: ['forest', 'tree', 'garden', 'river', 'mountain', 'wild', 'bloom', 'root', 'moss'],
  },
  {
    id: 'alive',
    label: 'ALIVE',
    words: ['alive', 'living', 'breathing', 'growing', 'organ', 'pulse', 'bloom', 'creature'],
  },
  {
    id: 'machine',
    label: 'MACHINE',
    words: ['machine', 'robot', 'engine', 'circuit', 'system', 'protocol', 'drone', 'factory'],
  },
  {
    id: 'memory',
    label: 'MEMORY',
    words: ['memory', 'remember', 'past', 'ghost', 'echo', 'archive', 'forgotten', 'old'],
  },
  {
    id: 'neon',
    label: 'NEON',
    words: ['neon', 'light', 'glow', 'screen', 'sign', 'colour', 'color', 'electric'],
  },
  {
    id: 'mystery',
    label: 'MYSTERY',
    words: ['secret', 'hidden', 'nobody', 'unknown', 'case', 'suspect', 'strange', 'lost'],
  },
  {
    id: 'dusk',
    label: 'DUSK',
    words: ['night', 'rain', 'dark', 'shadow', 'fog', 'midnight', 'storm', 'dim'],
  },
]

/** Palettes the generated artwork draws from. Kept close to the §34 palette. */
const PALETTES = [
  ['#00e5ff', '#8b5cff'],
  ['#ff2bd6', '#8b5cff'],
  ['#39ff88', '#00e5ff'],
  ['#ffe66d', '#ff2bd6'],
  ['#8b5cff', '#10151c'],
  ['#00e5ff', '#1e2733'],
]

/* ========================================================================== */
/* 3. Helpers                                                                  */
/* ========================================================================== */

/**
 * Build a deterministic gradient for a generated possibility.
 * @param {string} seedText
 * @param {number} variant
 * @returns {string} A CSS `linear-gradient(...)` value.
 */
function gradientForSeed(seedText, variant = 0) {
  const rng = createRng(`gradient:${seedText}:${variant}`)
  const [from, to] = pick(rng, PALETTES)
  const angles = [135, 200, 60, 300, 160, 25, 45]
  return `linear-gradient(${angles[variant % angles.length]}deg, ${from} 0%, ${to} 100%)`
}

/**
 * Extract creative signal chips from free text (brief section 9.1).
 *
 * Returns the lexicon labels whose keywords appear, most-relevant first, then
 * backfills from the seed so a nonsense sentence still produces a usable set.
 * The result is ALWAYS non-empty - the UI must never show an empty universe.
 *
 * @param {string} text - Raw user input.
 * @returns {string[]} Uppercase chip labels, e.g. ['CITY','LIFE','NEON'].
 */
export function extractSignalChips(text = '') {
  const haystack = String(text).toLowerCase()
  const matched = SIGNAL_LEXICON.filter((group) =>
    group.words.some((word) => haystack.includes(word)),
  )

  const ordered = matched.map((group) => group.label)
  const rng = createRng(`chips:${haystack}`)
  const filler = shuffle(
    rng,
    SIGNAL_LEXICON.filter((group) => !matched.includes(group)),
  ).map((group) => group.label)

  return [...ordered, ...filler].slice(0, 5)
}

/* ========================================================================== */
/* 4. Concept grammar                                                         */
/* --------------------------------------------------------------------------- */
/* Possibility titles are assembled from templates, not hand-written per input. */
/* The templates are what let "NEON CITY + FOREST" read as "THE FOREST UNDER   */
/* THE CITY" (brief section 22) rather than as two unrelated nouns.             */
/* ========================================================================== */

/** Title templates, keyed by how many source signals were combined. */
const PAIR_TEMPLATES = [
  'THE {B} UNDER THE {A}',
  '{A} THAT GREW OUT OF {B}',
  'THE {B} BENEATH {A}',
  'WHERE {B} MEETS {A}',
  'A {A} EATEN BY {B}',
]

/** Templates used when a single node is expanded into alternatives (s.25). */
const NOUN_TEMPLATES = [
  'THE {A} THAT DREAMS',
  'THE {A} THAT HUNTS',
  'THE {A} THAT REMEMBERS',
  'THE {A} THAT LISTENS',
  'THE LAST {A}',
  '{A} WITHOUT SUNLIGHT',
]

/** Titles used when a node first branches into directions (section 24). */
const BRANCH_DIRECTIONS = [
  'NOIR',
  'HORROR',
  'WONDER',
  'RUST',
  'SILENCE',
  'BLOOM',
  'DRIFT',
  'ASCENT',
]

/**
 * Turn a concept phrase into an ALL-CAPS display title.
 * @param {string} value
 * @returns {string}
 */
function titleCase(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

/**
 * Words that describe a concept rather than name it. They are stripped before
 * a node's "kernel" noun is taken, so "ABANDONED FOREST" yields FOREST rather
 * than ABANDONED (which reads as nonsense inside "THE {B} UNDER THE {A}").
 * @type {Set<string>}
 */
const MODIFIER_WORDS = new Set([
  'NEON', 'ABANDONED', 'OLD', 'NEW', 'FIRST', 'LAST', 'LOST', 'FORGOTTEN',
  'HIDDEN', 'SECRET', 'LIVING', 'DEAD', 'HUMAN', 'QUIET', 'WILD', 'GREAT',
  'LITTLE', 'BIG', 'SMALL', 'DARK', 'BRIGHT', 'EMPTY', 'FINAL', 'SILENT',
  'LOW', 'HIGH', 'REAL', 'FAKE', 'SUNLIGHT', 'NATURAL', 'PERFECT', 'BROKEN',
  'MACHINE', 'ELECTRIC', 'ENDLESS',
])

/**
 * Words that carry no meaning in a title template.
 * @type {Set<string>}
 */
const FILLER_WORDS = new Set([
  'THE', 'A', 'AN', 'THAT', 'UNDER', 'BENEATH', 'WHERE', 'OF', 'WITHOUT',
  'OUT', 'WITH', 'INTO', 'OVER', 'EATEN', 'IS', 'ARE', 'WAS',
])

/**
 * Reduce a node title to the single noun that names it, which is what the
 * title grammar substitutes into "{A}".
 *
 * English compounds put the head noun LAST, so we strip filler words and
 * descriptive modifiers and keep the final survivor. That is why
 * "THE LAST HUMAN STREET" yields STREET rather than HUMAN.
 *
 * @param {string} title
 * @returns {string}
 */
function kernelOf(title) {
  const words = titleCase(title)
    .split(' ')
    .filter((word) => word && !FILLER_WORDS.has(word) && !MODIFIER_WORDS.has(word))
  return words[words.length - 1] || 'SIGNAL'
}

/* ========================================================================== */
/* 5. Stage labels (brief section 61)                                          */
/* --------------------------------------------------------------------------- */
/* Stage-based feedback ONLY. The brief forbids fake percentages unless they   */
/* represent a real simulation, so the UI advances through named stages.        */
/* ========================================================================== */

/** @type {Record<string, string[]>} */
export const AI_MESSAGES = {
  universe: [
    'CAPTURING SIGNAL',
    'INTERPRETING SIGNAL',
    'CONNECTING CONCEPTS',
    'BUILDING UNIVERSE',
  ],
  synthesis: ['LOCKING SOURCES', 'CONNECTING SIGNALS', 'SYNTHESIZING POSSIBILITY', 'RESULT READY'],
  branches: ['READING NODE', 'GENERATING DIRECTIONS', 'MAPPING BRANCH'],
  stabilize: ['EVALUATING COHERENCE', 'CHECKING VISUAL POTENTIAL', 'CONCEPT STABILIZED'],
  storyboard: ['SEQUENCE INITIALIZED', 'BUILDING FRAMES', 'ASSIGNING TRANSITIONS'],
  preview: ['ASSEMBLING PREVIEW', 'APPLYING TRANSITIONS'],
}

/* ========================================================================== */
/* 6. generateInitialUniverse(signal)  -  brief section 74.3                  */
/* ========================================================================== */

/**
 * Turn one signal into the opening Creative Universe.
 *
 * Produces a root node plus four satellites arranged in a ring, which is the
 * layout the demo path in section 71 expects (select NEON CITY, select
 * ABANDONED FOREST, combine them).
 *
 * @param {import('./signalModels.js').Signal} signal
 * @returns {Promise<import('./signalModels.js').CreativeNode[]>}
 */
export async function generateInitialUniverse(signal) {
  await delay(900)
  return buildInitialUniverse(signal)
}

/**
 * Synchronous twin of {@link generateInitialUniverse}, so the store can compute
 * node positions without an extra round trip through a timer.
 *
 * @param {import('./signalModels.js').Signal} signal
 * @returns {import('./signalModels.js').CreativeNode[]}
 */
export function buildInitialUniverse(signal) {
  const seed = `universe:${signal.content}`
  const rng = createRng(seed)
  const kernel = kernelOf(signal.label || signal.content)

  // The four satellites are the directions the raw signal could become. They
  // reuse the brief's own example concepts so the demo reads as intended.
  const satelliteTitles = shuffle(rng, [
    `NEON ${kernel === 'SIGNAL' ? 'CITY' : kernel}`,
    `ABANDONED ${pick(rng, ['FOREST', 'STATION', 'GARDEN'])}`,
    'THE LAST HUMAN STREET',
    'CITY WITHOUT SUNLIGHT',
  ]).slice(0, 4)

  // Ring layout: radius 300px around the root, 4 evenly spaced slots.
  const RADIUS = 300
  const satellites = satelliteTitles.map((title, index) => {
    const angle = (Math.PI * 2 * index) / satelliteTitles.length - Math.PI / 4
    return createNode({
      title: titleCase(title),
      description: `A direction suggested by “${signal.label || signal.content}”.`,
      gradient: gradientForSeed(`${seed}:${index}`, index),
      alt: `Generated visual placeholder for the possibility ${titleCase(title)}`,
      signals: [signal.label || 'SIGNAL'],
      depth: 1,
      createdFrom: 'signal',
      position: {
        x: Math.round(Math.cos(angle) * RADIUS),
        y: Math.round(Math.sin(angle) * RADIUS),
      },
    })
  })

  // The root sits at the centre, so the universe always opens centred.
  const root = createNode({
    title: titleCase(signal.label || kernel),
    description: signal.content || 'The originating signal.',
    gradient: gradientForSeed(`${seed}:root`, 0),
    alt: `Origin signal: ${signal.label || signal.content}`,
    signals: [signal.label || 'SIGNAL'],
    depth: 0,
    createdFrom: 'signal',
    position: { x: 0, y: 0 },
  })

  return [root, ...satellites]
}

/* ========================================================================== */
/* 7. generateSynthesis(signals, mode)  -  brief sections 17, 18, 74.3        */
/* --------------------------------------------------------------------------- */
/* The centre of the product (section 4.2): "combination over prompting". Two  */
/* or more nodes collide and the AI proposes a NEW possibility.                 */
/* ========================================================================== */

/**
 * Combine two or more source nodes into one new possibility.
 *
 * The result title is generated by the grammar above, so the brief's own
 * example holds: NEON CITY + ABANDONED FOREST -> "THE FOREST UNDER THE CITY".
 *
 * @param {{id: string, title: string, signals?: string[]}[]} sources
 * @param {string} mode - A SYNTHESIS_MODES id.
 * @returns {Promise<{node: import('./signalModels.js').CreativeNode, reason: string}>}
 */
export async function generateSynthesis(sources, mode = 'unexpected') {
  await delay(1100)
  return buildSynthesis(sources, mode)
}

/**
 * Synchronous twin of {@link generateSynthesis}.
 *
 * @param {{id: string, title: string, signals?: string[]}[]} sources
 * @param {string} mode
 * @returns {{node: import('./signalModels.js').CreativeNode, reason: string}}
 */
export function buildSynthesis(sources, mode = 'unexpected') {
  const sourceTitles = sources.map((source) => source.title)
  const seed = `synthesis:${mode}:${sourceTitles.join('|')}`
  const rng = createRng(seed)

  const kernels = sourceTitles.map(kernelOf)
  const template = pick(rng, PAIR_TEMPLATES)
  const title = titleCase(
    template.replace('{A}', kernels[0] || 'SIGNAL').replace('{B}', kernels[1] || kernels[0] || 'VOID'),
  )

  // A factual one-line rationale about the COMBINATION - never a fabricated
  // account of how a model reached it (brief sections 44 and 82).
  const reason = `Combines ${kernels
    .slice(0, 3)
    .join(' and ')} in ${mode} mode, where two unrelated visual languages have to share one frame.`

  const node = createNode({
    title,
    description: reason,
    // Carried on the node itself, so an Inspector or Archive entry can show why
    // this possibility exists without needing the synthesis record.
    reason,
    gradient: gradientForSeed(seed, 3),
    alt: `Generated visual placeholder for the synthesised possibility ${title}`,
    signals: sourceTitles,
    depth: 1,
    createdFrom: 'synthesis',
    position: { x: 0, y: 0 },
  })

  return { node, reason }
}

/* ========================================================================== */
/* 8. generateAlternatives(node)  -  brief sections 25 and 74.3               */
/* --------------------------------------------------------------------------- */
/* "GENERATE 3 ALTERNATIVES" creates three nearby but distinct concepts.       */
/* ========================================================================== */

/**
 * Produce three nearby alternatives for a node, and mark one as recommended.
 *
 * The recommendation is advisory: the brief is explicit that it "should never
 * automatically overwrite the user's creative direction" (section 23), so the
 * flag travels with the node and the user still chooses.
 *
 * @param {import('./signalModels.js').CreativeNode} node
 * @returns {Promise<{nodes: import('./signalModels.js').CreativeNode[], reason: string}>}
 */
export async function generateAlternatives(node) {
  await delay(950)
  return buildAlternatives(node)
}

/**
 * Synchronous twin of {@link generateAlternatives}.
 *
 * @param {import('./signalModels.js').CreativeNode} node
 * @returns {{nodes: import('./signalModels.js').CreativeNode[], reason: string}}
 */
export function buildAlternatives(node) {
  const kernel = kernelOf(node.title)
  const seed = `alternatives:${node.id}:${node.title}`
  const rng = createRng(seed)

  const templates = shuffle(rng, NOUN_TEMPLATES).slice(0, 3)
  const recommendedIndex = intBetween(rng, 0, templates.length - 1)

  const nodes = templates.map((template, index) => {
    const title = titleCase(template.replace('{A}', kernel))
    return createNode({
      title,
      description: `An alternative reading of ${node.title}.`,
      gradient: gradientForSeed(`${seed}:${index}`, index + 1),
      alt: `Generated visual placeholder for the alternative ${title}`,
      signals: node.signals.length ? node.signals : [node.title],
      parentId: node.id,
      depth: node.depth + 1,
      createdFrom: 'alternative',
      recommended: index === recommendedIndex,
      reason:
        index === recommendedIndex
          ? `Keeps the strongest visual contrast already present in ${node.title}.`
          : '',
      // Fan out below the parent so alternatives never overlap the source.
      position: {
        x: Math.round((index - 1) * 190),
        y: 210,
      },
    })
  })

  const reason =
    nodes[recommendedIndex]?.reason ||
    'Each alternative keeps the original signal and changes only the direction of the idea.'

  return { nodes, reason }
}

/* ========================================================================== */
/* 9. generateBranches(node)  -  brief sections 24, 74.3                      */
/* ========================================================================== */

/**
 * Split a node into directional branches (section 24: NOIR / HORROR / WONDER).
 *
 * @param {import('./signalModels.js').CreativeNode} node
 * @returns {Promise<import('./signalModels.js').Branch[]>}
 */
export async function generateBranches(node) {
  await delay(800)
  return buildBranches(node)
}

/**
 * Synchronous twin of {@link generateBranches}.
 *
 * @param {import('./signalModels.js').CreativeNode} node
 * @returns {import('./signalModels.js').Branch[]}
 */
export function buildBranches(node) {
  const rng = createRng(`branches:${node.id}`)
  const directions = shuffle(rng, BRANCH_DIRECTIONS).slice(0, 3)

  return directions.map((direction) => ({
    id: `branch-${node.id}-${direction}`,
    parentNodeId: node.id,
    direction,
    label: `BRANCH // ${direction}`,
    snapshotIds: [],
  }))
}

/**
 * The node a branch direction produces, placed below its parent.
 * @param {import('./signalModels.js').CreativeNode} node
 * @param {import('./signalModels.js').Branch} branch
 * @param {number} index
 * @returns {import('./signalModels.js').CreativeNode}
 */
export function buildBranchNode(node, branch, index) {
  const seed = `branchnode:${branch.id}`
  const title = titleCase(`${node.title} // ${branch.direction}`)

  return createNode({
    title,
    description: `${branch.direction} interpretation of ${node.title}.`,
    gradient: gradientForSeed(`${seed}:${index}`, index + 2),
    alt: `Generated visual placeholder for the branch ${title}`,
    signals: node.signals.length ? node.signals : [node.title],
    parentId: node.id,
    depth: node.depth + 1,
    createdFrom: 'branch',
    // Fan out horizontally beneath the parent.
    position: { x: Math.round((index - 1) * 210), y: 200 },
  })
}

/* ========================================================================== */
/* 10. stabilizeConcept(node)  -  brief sections 28, 74.3                     */
/* --------------------------------------------------------------------------- */
/* The handoff from exploration to production. Metrics are DERIVED from the      */
/* node's real state (how many branches it has, how deep it is), not invented,  */
/* so the terminal modal always tells the truth about what happened.            */
/* ========================================================================== */

/**
 * Evaluate a node and build the stabilised concept around it.
 *
 * @param {import('./signalModels.js').CreativeNode} node
 * @param {import('./signalModels.js').CreativeNode[]} allNodes
 * @returns {Promise<import('./signalModels.js').StabilizedConcept>}
 */
export async function stabilizeConcept(node, allNodes = []) {
  await delay(850)
  return buildStabilizedConcept(node, allNodes)
}

/**
 * Synchronous twin of {@link stabilizeConcept}.
 *
 * @param {import('./signalModels.js').CreativeNode} node
 * @param {import('./signalModels.js').CreativeNode[]} allNodes
 * @returns {import('./signalModels.js').StabilizedConcept}
 */
export function buildStabilizedConcept(node, allNodes = []) {
  const descendants = allNodes.filter((candidate) => candidate.parentId === node.id)
  const depth = String(allNodes.filter((n) => n.parentId === node.id).length).padStart(2, '0')

  return createStabilizedConcept({
    nodeId: node.id,
    title: node.title,
    summary:
      descendants.length > 0
        ? `${node.title} carries ${descendants.length} explored ${descendants.length === 1 ? 'direction' : 'directions'} and is ready to become a cinematic sequence.`
        : `${node.title} is a clean single concept, ready to become a cinematic sequence.`,
    metrics: {
      coherence: descendants.length >= 2 ? 'HIGH' : 'MEDIUM',
      potential: node.depth >= 2 || descendants.length >= 2 ? 'HIGH' : 'MEDIUM',
      depth,
    },
  })
}

/* ========================================================================== */
/* 11. generateStoryboard(node)  -  brief sections 30, 55, 74.3               */
/* --------------------------------------------------------------------------- */
/* THIS IS WHERE PROTOTYPE 3 RECONNECTS TO THE PLATFORM'S VIDEO WORKFLOW.      */
/*                                                                            */
/* The implementation is intentionally thin: it builds a text brief from the    */
/* chosen node and calls the SHARED mock AI (shared/ai/mockAi.js), which        */
/* returns real shared `Scene` objects in a shared `Storyboard`.                */
/*                                                                            */
/* That means Prototype 03's frames are produced by exactly the same generator  */
/* Prototypes 01 and 02 use - the AI workflow is shared even though the         */
/* interaction model is not (brief section 55).                                */
/* ========================================================================== */

/**
 * Convert a stabilised possibility into a cinematic storyboard.
 *
 * @param {import('./signalModels.js').StabilizedConcept} concept
 * @returns {Promise<import('../../shared/domain/models.js').Storyboard>}
 */
export async function generateStoryboard(concept) {
  await delay(1000)
  return buildStoryboard(concept)
}

/**
 * Synchronous twin of {@link generateStoryboard}.
 *
 * NOTE: the shared generator is itself asynchronous (it simulates latency), so
 * this "synchronous" helper returns the same Promise. The store awaits it and
 * adds its own staged feedback on top - the two delays are intentionally kept
 * small so the combined wait stays well under a second and a half.
 *
 * @param {import('./signalModels.js').StabilizedConcept} concept
 * @returns {Promise<import('../../shared/domain/models.js').Storyboard>}
 */
export function buildStoryboard(concept) {
  // The brief text is assembled from the concept and the signals behind it, so
  // the shared keyword inference in mockAi.js picks fitting scene types.
  // `count: 4` keeps the sequence short and cinematic (brief section 30).
  const brief = `${concept.title}. ${concept.summary} A short cinematic sequence in the spirit of ${concept.title}.`
  return sharedGenerateStoryboard(brief, { count: 4 })
}

/* ========================================================================== */
/* 12. generatePreview(storyboard)  -  brief sections 31, 74.3                 */
/* --------------------------------------------------------------------------- */
/* The preview is a SIMULATION. No video is encoded, nothing is fetched. The    */
/* store advances a playhead through the storyboard's own scene durations and    */
/* plays a CSS transition between frames (brief section 31).                     */
/* ========================================================================== */

/**
 * Resolve the frames the cinematic preview will play, in order.
 *
 * @param {import('../../shared/domain/models.js').Storyboard|null} storyboard
 * @returns {{frames: import('../../shared/domain/models.js').Scene[], duration: number}}
 */
export function buildPreview(storyboard) {
  if (!storyboard?.scenes?.length) return { frames: [], duration: 0 }
  return {
    frames: storyboard.scenes,
    duration: storyboard.scenes.reduce((sum, scene) => sum + (scene.duration || 0), 0),
  }
}

/* ========================================================================== */
/* 13. Export (brief section 81)                                               */
/* --------------------------------------------------------------------------- */
/* Simulated, and honest about it. The shared exporter returns the same         */
/* simulated result Prototypes 01 and 02 show, so the claim stays truthful.     */
/* ========================================================================== */

/**
 * Run the simulated export.
 * @param {{resolution: string, format: string, platform: string}} settings
 * @returns {Promise<object>}
 */
export function simulateExport(settings) {
  return simulate({ filename: 'creative-signal-sequence.mp4', settings }, 1200)
}