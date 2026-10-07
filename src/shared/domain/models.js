/**
 * shared/domain/models.js — the product's data shapes.
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   AGENTS.md requires the three prototypes to share "domain models". This file
 *   is the single source of truth for what a Project, Storyboard, Scene,
 *   Character and VideoComposition LOOK like. Prototypes 02 and 03 will reuse
 *   these exact shapes and only change how they are rendered.
 *
 * DESIGN RULE
 *   These are plain, serialisable objects — no classes, no methods. All
 *   behaviour lives in the store / mock-AI layers. That keeps presentation and
 *   logic separate (an explicit AGENTS.md requirement) and makes the models
 *   trivial to inspect in the Vue devtools.
 *
 * The `@typedef` blocks below double as the documentation for each field.
 */

import { uid } from '../utils/random.js'

/**
 * Who produced a given value. This is what the AI-aware timeline badges and
 * the origin indicator communicate (Prototype 02 brief, sections 13 and 17):
 * "AI participates in production while the human remains in control."
 * @typedef {'ai-generated' | 'human-edited' | 'ai-variation'} SceneOrigin
 */

/**
 * A retained alternative take for a scene (Prototype 02 brief, section 15).
 * Variations are NEVER silently applied - the original stays recoverable.
 * @typedef {object} Variation
 * @property {string} id
 * @property {string} sceneId
 * @property {string} label          e.g. "Variation 02".
 * @property {string} summary        Human-readable description of the change.
 * @property {string[]} changes      Changed areas, e.g. ["Lighting", "Mood"].
 * @property {Scene} value           Full scene snapshot for this variation.
 * @property {boolean} isOriginal    True for the untouched baseline.
 */

/**
 * One lane of the four-track timeline (Prototype 02 brief, section 12).
 * @typedef {object} TimelineTrack
 * @property {string} id
 * @property {'video'|'dialogue'|'audio'|'effects'} kind
 * @property {string} label
 * @property {TimelineClip[]} clips
 */

/**
 * A clip sitting on a timeline track.
 * @typedef {object} TimelineClip
 * @property {string} id
 * @property {string} trackId
 * @property {string} label
 * @property {number} start        Seconds from the head of the sequence.
 * @property {number} duration     Seconds.
 * @property {SceneOrigin} origin  Rendered as a badge on the clip.
 * @property {string|null} sceneId Link to the scene for VIDEO clips.
 * @property {string} gradient     Fallback background for the clip thumbnail.
 * @property {string|null} imageUrl Local scene artwork, when present.
 * @property {string} alt           Accessible description of the artwork.
 */

/**
 * A proposal produced by the AI Copilot (Prototype 02 brief, section 10).
 * It lists CREATIVE changes only - never model internals or reasoning.
 * @typedef {object} CopilotProposal
 * @property {string} id
 * @property {string} instruction   The user's original instruction.
 * @property {string} summary       One line describing the proposed direction.
 * @property {string[]} changes     e.g. ["Lighting", "Colour palette", "Mood"].
 * @property {object} patch         Concrete field changes, applied on approval.
 * @property {'pending'|'applied'|'dismissed'} status
 */

/**
 * Lifecycle of a generated item. The UI shows different feedback per status.
 * @typedef {'queued' | 'generating' | 'ready'} GenerationStatus
 */

/**
 * One shot in the video.
 * @typedef {object} Scene
 * @property {string} id            Unique id (used as a Vue list key).
 * @property {number} order         1-based position in the storyboard.
 * @property {string} title         Short human label, e.g. "Neon Crossing".
 * @property {string} prompt        The descriptive AI prompt for this shot.
 * @property {string} type          Scene type id (urban, nature, sci-fi…).
 * @property {string} typeLabel     Human-readable scene type, e.g. "Sci-Fi".
 * @property {string} mood          Mood id (see MOCK catalogues).
 * @property {string} camera        Camera angle id.
 * @property {string} style         Visual style id (realistic, cartoon, 3D…).
 * @property {string} lighting      Lighting id.
 * @property {number} duration      Length in seconds.
 * @property {string} transition    Transition into the NEXT scene.
 * @property {string} gradient      CSS background used as placeholder artwork.
 * @property {string|null} imageUrl Real artwork (null → render the gradient).
 * @property {string} alt           Accessible description for the artwork.
 * @property {GenerationStatus} status
 */

/**
 * A reusable character the user can drop into scenes.
 * @typedef {object} Character
 * @property {string} id
 * @property {string} name
 * @property {string} templateId    Which AI template it came from.
 * @property {string} archetype     Human label, e.g. "Futuristic Detective".
 * @property {string} description   Short AI-written backstory.
 * @property {string} outfit
 * @property {string} expression
 * @property {string} pose
 * @property {string} gradient      Placeholder avatar artwork.
 * @property {string|null} imageUrl Real artwork (null → render the gradient).
 * @property {string} alt
 * @property {GenerationStatus} status
 */

/**
 * The ordered set of scenes plus lightweight summary info.
 * @typedef {object} Storyboard
 * @property {Scene[]} scenes
 * @property {string} logline   One-sentence summary of the whole video.
 */

/**
 * The finished composition previewed in the Video step.
 * @typedef {object} VideoComposition
 * @property {boolean} ready
 * @property {number} totalDuration
 * @property {string} resolution    e.g. "1080 × 1920".
 * @property {string} aspectRatio   e.g. "9:16".
 * @property {string} format        e.g. "MP4 (H.264)".
 * @property {string} platform      Target platform id (tiktok, reels, shorts).
 * @property {string} audioTrack    Mock music track name.
 * @property {string[]} transitions Applied between scenes.
 * @property {GenerationStatus} status
 */

/**
 * Where the user intends to publish, and the export settings derived from it.
 * @typedef {object} ExportSettings
 * @property {string} platform
 * @property {string} resolution
 * @property {string} format
 * @property {number} fps
 */

/**
 * The root aggregate: everything a single video project owns.
 * @typedef {object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} idea            The raw concept text.
 * @property {'idea' | 'template' | 'blank'} source  How creation started.
 * @property {string|null} templateId
 * @property {string} createdAt       ISO timestamp.
 * @property {Storyboard} storyboard
 * @property {Character[]} characters
 * @property {VideoComposition} video
 * @property {ExportSettings} export
 * @property {string[]} completedSteps Ids of flow steps that finished generating.
 */

/* ------------------------------------------------------------------------ */
/* Factory functions                                                        */
/* Always create a valid object with sane defaults, so the UI never has to   */
/* guard against undefined fields.                                          */
/* ------------------------------------------------------------------------ */

/**
 * Create a Scene, merging in any overrides.
 * @param {Partial<Scene>} [overrides]
 * @returns {Scene}
 */
export function createScene(overrides = {}) {
  return {
    id: uid('scene'),
    order: 1,
    title: 'Untitled scene',
    prompt: '',
    type: 'urban',
    typeLabel: 'Urban',
    mood: 'cinematic',
    camera: 'wide',
    style: '3d',
    lighting: 'neon',
    duration: 6,
    transition: 'cut',
    gradient: 'linear-gradient(135deg, #6d7cff 0%, #a78bfa 100%)',
    imageUrl: null,
    alt: 'AI-generated scene placeholder artwork',
    /* Prototype 02 additions (brief section 28): extend ADDITIVELY. Prototype 01 never reads these, so Prototype 01 is unaffected. */
    lens: '35mm',
    movement: 'Static',
    framing: 'Medium',
    lightingIntensity: 70,
    lightingContrast: 'Medium',
    origin: 'ai-generated',
    role: null,
    status: 'ready',
    ...overrides,
  }
}

/**
 * Create a Character, merging in any overrides.
 * @param {Partial<Character>} [overrides]
 * @returns {Character}
 */
export function createCharacter(overrides = {}) {
  return {
    id: uid('char'),
    name: 'New character',
    templateId: 'casual-vlogger',
    archetype: 'Casual Vlogger',
    description: 'A friendly on-camera host, ready for any scene.',
    outfit: 'Everyday casual',
    expression: 'Friendly smile',
    pose: 'Standing',
    gradient: 'linear-gradient(135deg, #ffb27a 0%, #ff7a9c 100%)',
    imageUrl: null,
    alt: 'AI-generated character placeholder artwork',
    status: 'ready',
    ...overrides,
  }
}

/**
 * Normalise the `order` field so it always matches array position (1-based).
 * Called after every reorder/delete so `order` and reality never drift apart.
 * @param {Scene[]} scenes
 * @returns {Scene[]} A shallow-copied array with corrected `order` values.
 */
export function reorderScenes(scenes) {
  return scenes.map((scene, index) => ({ ...scene, order: index + 1 }))
}

/**
 * Build a storyboard from an array of scenes.
 * @param {Scene[]} [scenes]
 * @param {string} [logline]
 * @returns {Storyboard}
 */
export function createStoryboard(scenes = [], logline = '') {
  return { scenes: reorderScenes(scenes), logline }
}

/**
 * Create the (empty) video composition for a fresh project.
 * @param {Partial<VideoComposition>} [overrides]
 * @returns {VideoComposition}
 */
export function createVideoComposition(overrides = {}) {
  return {
    ready: false,
    totalDuration: 0,
    resolution: '1080 × 1920',
    aspectRatio: '9:16',
    format: 'MP4 (H.264)',
    platform: 'tiktok',
    audioTrack: 'No audio selected',
    transitions: [],
    status: 'queued',
    ...overrides,
  }
}

/**
 * Create default export settings for a platform.
 * @param {Partial<ExportSettings>} [overrides]
 * @returns {ExportSettings}
 */
export function createExportSettings(overrides = {}) {
  return {
    platform: 'tiktok',
    resolution: '1080 × 1920',
    format: 'MP4 (H.264)',
    fps: 30,
    ...overrides,
  }
}

/**
 * Create a brand-new empty project.
 * @param {Partial<Project>} [overrides]
 * @returns {Project}
 */
export function createProject(overrides = {}) {
  return {
    id: uid('project'),
    title: 'Untitled video',
    idea: '',
    source: 'blank',
    templateId: null,
    createdAt: new Date().toISOString(),
    storyboard: createStoryboard(),
    characters: [],
    video: createVideoComposition(),
    export: createExportSettings(),
    /* Prototype 02 additions (brief section 28). */
    aspectRatio: '9:16',
    tracks: [],
    variations: [],
    completedSteps: [],
    ...overrides,
  }
}

/* ========================================================================== */
/* Prototype 02 factories (Prototype 02 brief, section 28).                    */
/* --------------------------------------------------------------------------- */
/* These are additive: Prototype 01 does not import them, so the already-built  */
/* Prototype 01 is unaffected. They exist so both prototypes keep ONE set of    */
/* data shapes instead of drifting into duplicate models.                        */
/* ========================================================================== */

/**
 * The four timeline lanes (brief section 12: VIDEO / DIALOGUE / AUDIO / EFFECTS).
 * @type {{kind: 'video'|'dialogue'|'audio'|'effects', label: string}[]}
 */
export const TRACK_KINDS = [
  { kind: 'video', label: 'VIDEO' },
  { kind: 'dialogue', label: 'DIALOGUE' },
  { kind: 'audio', label: 'AUDIO' },
  { kind: 'effects', label: 'EFFECTS' },
]

/**
 * Create one lane of the timeline.
 * @param {{kind: string, label: string}} def - An entry from TRACK_KINDS.
 * @param {Partial<TimelineTrack>} [overrides]
 * @returns {TimelineTrack}
 */
export function createTimelineTrack(def, overrides = {}) {
  return { id: uid('track'), kind: def.kind, label: def.label, clips: [], ...overrides }
}

/**
 * Create a clip that sits on a timeline track.
 * @param {Partial<TimelineClip>} [overrides]
 * @returns {TimelineClip}
 */
export function createTimelineClip(overrides = {}) {
  return {
    id: uid('clip'),
    trackId: '',
    label: 'Clip',
    start: 0,
    duration: 4,
    origin: 'ai-generated',
    sceneId: null,
    gradient: 'linear-gradient(135deg, #2a3442 0%, #1f2833 100%)',
    imageUrl: null,
    alt: '',
    ...overrides,
  }
}

/**
 * Create a variation of a scene. The baseline is stored separately and is
 * never overwritten - brief section 15: "the original must remain recoverable".
 *
 * @param {Scene} scene - The scene this variation derives from.
 * @param {object} [overrides]
 * @returns {Variation}
 */
export function createVariation(scene, overrides = {}) {
  return {
    id: uid('variation'),
    sceneId: scene.id,
    label: 'Variation 01',
    summary: '',
    changes: [],
    value: { ...scene, origin: 'ai-variation' },
    isOriginal: false,
    ...overrides,
  }
}

/**
 * Create a Copilot proposal (brief section 10). It describes CREATIVE changes
 * only - never model internals or fabricated reasoning.
 * @param {Partial<CopilotProposal>} [overrides]
 * @returns {CopilotProposal}
 */
export function createCopilotProposal(overrides = {}) {
  return {
    id: uid('proposal'),
    instruction: '',
    summary: '',
    changes: [],
    patch: {},
    status: 'pending',
    ...overrides,
  }
}