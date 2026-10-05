/**
 * 02-professional-workspace/navigation.js - the workspace navigation model.
 * ---------------------------------------------------------------------------
 * Prototype 2 does NOT use Prototype 01's consumer-style global navigation
 * (Home / Projects / Create / Profile). The project IS the workspace.
 *
 * There are two levels instead:
 *   1. Left project navigation (this file) - preserves production context.
 *      It is a compact production-oriented list, deliberately NOT a file
 *      manager: "Its purpose is to preserve production context."
 *   2. Top-bar contextual navigation - quick switches for the three panels a
 *      user jumps between most (Scenes / Assets / Characters).
 *
 * Every entry maps to a hash route, so browser back/forward works and a
 * section can be bookmarked - which is how a professional tool behaves.
 */

/**
 * The left navigation, grouped exactly as the brief specifies.
 * Route paths must match the table registered in main.js.
 * @type {{group: string, items: {id: string, label: string, path: string, note: string}[]}[]}
 */
export const PROJECT_NAV = [
  {
    group: 'Project',
    items: [
      {
        id: 'storyboard',
        label: 'Storyboard',
        path: '/storyboard',
        note: 'Prompt, storyboard and the whole sequence',
      },
      {
        id: 'scenes',
        label: 'Scenes',
        path: '/scenes',
        note: 'Inspect and regenerate individual scenes',
      },
      {
        id: 'assets',
        label: 'Assets',
        path: '/assets',
        note: 'Reusable elements referenced by scenes',
      },
      {
        id: 'characters',
        label: 'Characters',
        path: '/characters',
        note: 'Cast, poses and consistency',
      },
    ],
  },
  {
    group: 'Library',
    items: [
      { id: 'media', label: 'Media', path: '/library/media', note: 'Source footage and stills' },
      { id: 'styles', label: 'Styles', path: '/library/styles', note: 'Look and grade presets' },
      { id: 'audio', label: 'Audio', path: '/library/audio', note: 'Music, dialogue and effects' },
    ],
  },
]

/** Flat list of every nav item, for lookups by id. */
export const NAV_BY_ID = Object.fromEntries(
  PROJECT_NAV.flatMap((group) => group.items).map((item) => [item.id, item]),
)

/**
 * The subset of destinations shown as quick switches in the top bar
 * (brief section 4: "Scenes  Assets  Characters").
 */
export const TOP_NAV_IDS = ['scenes', 'assets', 'characters']

/**
 * Which left-nav section a hash route resolves to.
 * @param {string} name - The matched route name, or null.
 * @returns {string} A PROJECT_NAV item id (defaults to 'storyboard').
 */
export function sectionFromRoute(name) {
  return NAV_BY_ID[name] ? name : 'storyboard'
}

/* ========================================================================== */
/* AI feedback                                                                */
/* -------------------------------------------------------------------------- */
/* Stage-based only. The brief is explicit: "do NOT use fake percentage        */
/* progress" and "never expose fabricated model reasoning". These are UX      */
/* states, not claims about model internals.                                    */
/* ========================================================================== */

/** Stages shown while a single scene variation is being generated (sec. 11). */
export const VARIATION_STAGES = [
  'Preparing scene',
  'Generating visual variation',
  'Applying creative direction',
  'Preparing preview',
]

/** Stages shown while the storyboard is being built from the brief. */
export const STORYBOARD_STAGES = [
  'Interpreting brief',
  'Building scene structure',
  'Generating visual variation',
  'Assembling composition',
]

/** Stages shown while the timeline composition is being assembled. */
export const COMPOSE_STAGES = ['Assembling composition', 'Applying creative direction', 'Preparing preview']

/** Maps a generation task to its stage list. */
export function stagesFor(task) {
  if (task === 'storyboard') return STORYBOARD_STAGES
  if (task === 'compose') return COMPOSE_STAGES
  return VARIATION_STAGES
}

/* ========================================================================== */
/* Contextual AI actions (brief section 18)                                    */
/* -------------------------------------------------------------------------- */
/* The AI must feel context-aware: which actions appear depends entirely on     */
/* what the user has selected. These are plain strings so the UI stays data-   */
/* driven and easy to audit.                                                    */
/* ========================================================================== */

/** @type {Record<string, string[]>} */
export const AI_ACTIONS = {
  scene: [
    'Generate Variation',
    'Extend Shot',
    'Rewrite Prompt',
    'Enhance Cinematic Look',
    'Match Previous Scene',
  ],
  clip: ['Generate Alternative', 'Extend', 'Shorten', 'Create Transition', 'Match Adjacent Shot'],
  character: ['Generate Pose', 'Change Expression', 'Improve Consistency', 'Create Variation'],
  marketing: [
    'Generate Alternate Hook',
    'Create Shorter Version',
    'Adapt for Social',
    'Create CTA Variation',
    'Generate 3 Variations',
  ],
}

/**
 * Resolve the action set for the current selection.
 *
 * Marketing actions replace scene actions when the selected scene has a
 * marketing role (hook / product / benefit / cta). Marketers and filmmakers
 * share one workspace - there is no separate "Marketing Mode" (brief s.19).
 *
 * @param {{kind: string, role?: string}} selection
 * @returns {string[]}
 */
export function actionsFor(selection) {
  if (!selection || !selection.kind) return AI_ACTIONS.scene
  const marketingRoles = ['hook', 'product', 'benefit', 'cta']
  if (selection.kind === 'scene' && marketingRoles.includes(selection.role)) {
    return AI_ACTIONS.marketing
  }
  return AI_ACTIONS[selection.kind] || AI_ACTIONS.scene
}