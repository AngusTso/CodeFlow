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
    completedSteps: [],
    ...overrides,
  }
}
