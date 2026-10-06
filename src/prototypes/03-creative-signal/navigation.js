/**
 * 03-creative-signal/navigation.js - the terminal navigation model.
 * ---------------------------------------------------------------------------
 * Prototype 3 does NOT use Prototype 01's consumer navigation (Home / Projects
 * / Create / Profile) and does NOT use Prototype 02's docked project sidebar.
 *
 * The brief asks for a retro-futurist OPERATING SYSTEM feel (section 6):
 *
 *     > SIGNAL
 *       UNIVERSE
 *       LAB
 *       ARCHIVE
 *       EXPORT
 *
 * Two rules keep that from becoming a gimmick (sections 79 and 80):
 *   1. The terminal aesthetic is a METAPHOR. Users click real buttons with real
 *      labels; nobody has to learn obscure commands.
 *   2. Keyboard shortcuts are OPTIONAL accelerators, never the only route. Each
 *      one duplicates a visible, labelled control.
 */

/**
 * The five conceptual areas (brief section 7). `path` is the hash route, so a
 * section can be bookmarked and the browser back button works from `file://`.
 *
 * @type {{id: string, label: string, path: string, hint: string, key: string}[]}
 */
export const TERMINAL_NAV = [
  { id: 'signal', label: 'SIGNAL', path: '/signal', hint: 'Give the machine something to start from', key: '1' },
  { id: 'universe', label: 'UNIVERSE', path: '/universe', hint: 'Explore and branch visual possibilities', key: '2' },
  { id: 'lab', label: 'LAB', path: '/lab', hint: 'Push one possibility further', key: '3' },
  { id: 'archive', label: 'ARCHIVE', path: '/archive', hint: 'Memory of the creative journey', key: '4' },
  { id: 'export', label: 'EXPORT', path: '/export', hint: 'Simulated delivery of the sequence', key: '5' },
]

/** The storyboard route exists but is reached via TURN INTO VIDEO, not the nav. */
export const STORYBOARD_ROUTE = { id: 'storyboard', label: 'STORYBOARD', path: '/storyboard' }

/** Flat route table consumed by main.js. */
export const ROUTES = TERMINAL_NAV.map((item) => ({ path: item.path, name: item.id }))

/** The app opens on SIGNAL - the entry point (brief section 5). */
export const DEFAULT_PATH = '/signal'

/** Look-up by id, for resolving the active nav item from a route name. */
export const NAV_BY_ID = Object.fromEntries(TERMINAL_NAV.map((item) => [item.id, item]))

/* ========================================================================== */
/* Suggested signals (brief section 8.2)                                        */
/* --------------------------------------------------------------------------- */
/* These are deliberately ODD and open-ended rather than production-ready        */
/* prompts, because the whole point of Prototype 3 is that the user does not     */
/* need to know exactly what they are making.                                   */
/* ========================================================================== */

export const SUGGESTED_SIGNALS = [
  'What if this city was actually alive, but nobody knew?',
  'A detective who lives inside a machine that is still running.',
  'Something futuristic, but homesick for a decade that never happened.',
  'A forest that grew underneath a city and is now pushing back.',
]

/* ========================================================================== */
/* Node actions (brief section 25)                                             */
/* --------------------------------------------------------------------------- */
/* PRIMARY / SECONDARY / TERTIARY hierarchy from section 80. The Universe panel  */
/* groups these so the primary creative actions stay visually dominant and the   */
/* terminal decoration does not compete with them (section 79).                   */
/* ========================================================================== */

/** Primary actions - explore, combine, generate. */
export const PRIMARY_NODE_ACTIONS = [
  { id: 'alternatives', label: 'GENERATE 3 ALTERNATIVES' },
  { id: 'combine', label: 'COMBINE' },
]

/** Secondary actions - branch, inspect, stabilise. */
export const SECONDARY_NODE_ACTIONS = [
  { id: 'branch', label: 'BRANCH' },
  { id: 'lab', label: 'INSPECT IN LAB' },
  { id: 'stabilize', label: 'STABILISE' },
]

/** Tertiary actions - reversible or non-creative. */
export const TERTIARY_NODE_ACTIONS = [
  { id: 'focus', label: 'CENTER HERE' },
  { id: 'delete', label: 'DELETE' },
]

/* ========================================================================== */
/* Lab controls (brief section 27)                                             */
/* --------------------------------------------------------------------------- */
/* Deliberately LIGHTWEIGHT. The Lab answers "what happens if I push this?",     */
/* not "let me set every production parameter" - that is Prototype 2's job.       */
/* ========================================================================== */

/**
 * @type {{id: string, label: string, options: string[]}[]}
 */
export const LAB_CONTROLS = [
  { id: 'mood', label: 'VISUAL MOOD', options: ['Tense', 'Awed', 'Tender', 'Detached'] },
  { id: 'colour', label: 'COLOR DIRECTION', options: ['Neon', 'Ash', 'Sickly Green', 'Monochrome'] },
  { id: 'style', label: 'STYLE DIRECTION', options: ['Photoreal', 'Illustrated', '3D Render', 'Analog'] },
  { id: 'environment', label: 'ENVIRONMENT', options: ['Interior', 'Exterior', 'Underground', 'Aerial'] },
  { id: 'presence', label: 'CHARACTER PRESENCE', options: ['None', 'Silhouette', 'Featured'] },
  { id: 'intensity', label: 'INTENSITY', options: ['Quiet', 'Building', 'Climactic'] },
  { id: 'cinema', label: 'CINEMATIC DIRECTION', options: ['Locked', 'Handheld', 'Slow Push', 'Drifting'] },
]

/* ========================================================================== */
/* Voice transcript script (brief sections 9.1 and 10)                          */
/* --------------------------------------------------------------------------- */
/* Shown while "listening". It is a SIMULATED transcript - the prototype never   */
/* claims a real recogniser produced it, and the text alternative beside the      */
/* waveform always offers the same signal by typing (brief section 45).          */
/* ========================================================================== */

export const VOICE_SCRIPT = [
  'What if this city was actually alive,',
  'but nobody knew?',
]