/**
 * shared/data/mockData.js — the mock content catalogue.
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Every prototype needs the same building blocks: scene types, style presets,
 *   character templates, output formats. AGENTS.md says prototypes should reuse
 *   mock data, so this is the ONE place that data lives. Prototypes 02 and 03
 *   will import from here unchanged.
 *
 * IMAGE SLOTS — WHERE TO PUT REAL ARTWORK
 * ---------------------------------------------------------------------------
 *   This prototype ships with CSS-gradient placeholders instead of images so
 *   the deliverable stays a single, self-contained HTML file with no external
 *   requests (an AGENTS.md requirement).
 *
 *   TO USE REAL IMAGES:
 *     1. Put your file in `src/prototypes/01-code-flow/assets/` (create it).
 *     2. Import it at the top of this file, e.g.
 *          import urbanShot from '../prototypes/01-code-flow/assets/urban.jpg'
 *        (Vite turns the import into a base64 data-URI at build time because
 *        `build.assetsInlineLimit` is set very high in vite.config.js.)
 *     3. Set `imageUrl` on the relevant entry below, e.g.
 *          imageUrl: urbanShot
 *   <SceneCard>, <TemplateCard> and <CharacterCard> automatically render an
 *   <img> when `imageUrl` is set and fall back to the gradient when it is null.
 *   The generated scenes created by mockAi.js also accept an `imageUrl`.
 * ---------------------------------------------------------------------------
 */

/* ========================================================================== */
/* 1. Scene generation parameters (assignment "Scene Generation" module)      */
/* ========================================================================== */

/**
 * Scene types the user can choose from.
 * `palette` = two hex colours used to build the placeholder gradient.
 * `glyph` = a text glyph shown on the placeholder (avoids icon-font deps).
 * @type {{id: string, label: string, glyph: string, palette: [string, string]}[]}
 */
export const SCENE_TYPES = [
  { id: 'urban', label: 'Urban', glyph: '🏙', palette: ['#4f5bd5', '#8b5cf6'] },
  { id: 'nature', label: 'Nature', glyph: '🌿', palette: ['#0f9d76', '#7bd389'] },
  { id: 'sci-fi', label: 'Sci-Fi', glyph: '🛰', palette: ['#5b21b6', '#06b6d4'] },
  { id: 'fantasy', label: 'Fantasy', glyph: '🪄', palette: ['#9333ea', '#f59e0b'] },
  { id: 'abstract', label: 'Abstract', glyph: '🎨', palette: ['#f43f5e', '#fbbf24'] },
]

/** Mood presets. `id` is stored on the Scene; `label` is shown to the user. */
export const MOODS = [
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'playful', label: 'Playful' },
  { id: 'calm', label: 'Calm' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'dreamy', label: 'Dreamy' },
  { id: 'energetic', label: 'Energetic' },
]

/** Camera angle presets. */
export const CAMERAS = [
  { id: 'wide', label: 'Wide' },
  { id: 'medium', label: 'Medium' },
  { id: 'close-up', label: 'Close-up' },
  { id: 'aerial', label: 'Aerial' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'pov', label: 'POV' },
]

/** Visual style presets (assignment: realistic, cartoon, 3D render, etc.). */
export const STYLES = [
  { id: 'realistic', label: 'Realistic' },
  { id: 'cartoon', label: 'Cartoon' },
  { id: '3d', label: '3D Render' },
  { id: 'anime', label: 'Anime' },
  { id: 'watercolor', label: 'Watercolour' },
]

/** Lighting presets. */
export const LIGHTING = [
  { id: 'neon', label: 'Neon' },
  { id: 'golden-hour', label: 'Golden Hour' },
  { id: 'overcast', label: 'Overcast' },
  { id: 'studio', label: 'Studio' },
  { id: 'moonlight', label: 'Moonlight' },
  { id: 'high-key', label: 'High Key' },
]

/** Transitions between scenes. */
export const TRANSITIONS = [
  { id: 'cut', label: 'Cut' },
  { id: 'fade', label: 'Fade' },
  { id: 'dissolve', label: 'Dissolve' },
  { id: 'slide', label: 'Slide' },
  { id: 'zoom', label: 'Zoom' },
]

/* -------------------------------------------------------------------------- */
/* Small lookup helpers — used by the mock AI and by the UI for labels.        */
/* -------------------------------------------------------------------------- */

/**
 * Find a catalogue entry by id, returning a safe fallback when not found.
 * @param {{id: string, label: string}[]} list
 * @param {string} id
 * @returns {{id: string, label: string}}
 */
export function byId(list, id) {
  return list.find((entry) => entry.id === id) || list[0]
}

/**
 * Human label for a catalogue id, e.g. labelOf(MOODS, 'calm') → 'Calm'.
 * @param {{id: string, label: string}[]} list
 * @param {string} id
 * @returns {string}
 */
export function labelOf(list, id) {
  return byId(list, id).label
}

/**
 * Build a deterministic CSS gradient used as placeholder artwork.
 * Rotating the angle by `variant` makes consecutive cards look distinct
 * without needing any image files.
 *
 * @param {string} typeId - A SCENE_TYPES id.
 * @param {number} [variant=0] - Any integer; changes the gradient angle.
 * @returns {string} A CSS `linear-gradient(...)` value.
 */
export function gradientFor(typeId, variant = 0) {
  const [from, to] = byId(SCENE_TYPES, typeId).palette
  const angles = [135, 200, 60, 300, 160, 25]
  return `linear-gradient(${angles[variant % angles.length]}deg, ${from} 0%, ${to} 100%)`
}

/* ========================================================================== */
/* 2. Word banks used by the mock AI to compose believable scenes             */
/*    Keyed by scene type so a "nature" idea produces nature-sounding text.   */
/* ========================================================================== */

/** Short, evocative scene titles, keyed by scene type id. */
export const SCENE_TITLE_BANK = {
  urban: ['Neon Crossing', 'Rooftop Rush', 'Last Train Home', 'Rainy Boulevard', 'Corner Café'],
  nature: ['First Light', 'Hidden Waterfall', 'Pine Ridge', 'River Bend', 'Wildflower Field'],
  'sci-fi': ['Orbital Docking', 'Signal Received', 'Cold Storage', 'Ion Drift', 'Deep Scan'],
  fantasy: ['The Old Gate', 'Ember Path', 'Skyward Ruins', 'Whispering Woods', 'Crown of Thorns'],
  abstract: ['Liquid Motion', 'Soft Collapse', 'Chromatic Drift', 'Fractured Light', 'Slow Bloom'],
}

/** Descriptive prompt fragments, keyed by scene type id. */
export const SCENE_PROMPT_BANK = {
  urban: [
    'a rain-slicked city street glowing with neon signage',
    'a rooftop view over a busy downtown skyline at dusk',
    'an empty subway platform lit by flickering fluorescent lights',
    'a late-night diner seen through a fogged window',
  ],
  nature: [
    'sunlight breaking through a misty forest canopy',
    'a slow aerial pass over a winding mountain river',
    'dew on tall grass in an open meadow at sunrise',
    'waves rolling onto a quiet pebble beach',
  ],
  'sci-fi': [
    'a lone station drifting past a ringed planet',
    'corridor lights powering up one panel at a time',
    'a holographic map rotating above a control desk',
    'frost crystals forming on a viewport window',
  ],
  fantasy: [
    'a stone archway overgrown with glowing moss',
    'floating lanterns rising above an ancient ruin',
    'a knight silhouetted against a burning horizon',
    'a library of floating, whispering books',
  ],
  abstract: [
    'ink blooming slowly through clear water',
    'ribbons of colour folding into impossible shapes',
    'soft geometry drifting across a pastel plane',
    'shards of light reassembling into a whole',
  ],
}

/** Sentence starters used to build a one-line "logline" for the video. */
export const LOGLINE_TEMPLATES = [
  'A short, punchy piece that opens with %s and builds to a satisfying finish.',
  'A calm, atmospheric journey — from %s through to a quiet final shot.',
  'A fast, energetic edit that leads with %s and never slows down.',
  'A moody cinematic short, starting with %s and closing on a wide vista.',
]

/** Five-second "quick start" idea suggestions shown on the Idea step. */
export const IDEA_SUGGESTIONS = [
  'A cyberpunk city at night with neon lights',
  'A calm morning in a mountain village',
  'A space station drifting past a ringed planet',
  'A baker opening the shop before sunrise',
  'An underwater city rediscovered by divers',
]

/** Music beds the mock composer can attach to a video. */
export const AUDIO_TRACKS = [
  'Lo-fi Sunrise (warm, calm)',
  'Neon Pulse (energetic synth)',
  'Paper Planes (playful acoustic)',
  'Deep Space (ambient drone)',
  'City Motion (driving beat)',
]

/* ========================================================================== */
/* 3. "Start from Template" content (Idea step → template route)              */
/* ========================================================================== */

/**
 * Ready-made starting points for users who don't want to write a prompt.
 * Selecting one seeds the idea text AND jumps straight into the guided flow.
 *
 * @type {{id: string, title: string, description: string, prompt: string,
 *         type: string, glyph: string, sceneCount: number, duration: number}[]}
 */
export const VIDEO_TEMPLATES = [
  {
    id: 'neon-city',
    title: 'Neon City Nights',
    description: 'Moody cyberpunk streets, rain, reflections and neon signs.',
    prompt: 'A cyberpunk city at night with neon lights and rain-slicked streets',
    type: 'urban',
    glyph: '🌃',
    sceneCount: 5,
    duration: 30,
  },
  {
    id: 'wild-escape',
    title: 'Wild Escape',
    description: 'Calm nature b-roll that breathes slowly.',
    prompt: 'A quiet escape into misty forests and mountain rivers',
    type: 'nature',
    glyph: '🏞',
    sceneCount: 4,
    duration: 25,
  },
  {
    id: 'orbit-log',
    title: 'Orbit Log',
    description: 'Clean sci-fi station footage with drifting planets.',
    prompt: 'A space station drifting past a ringed planet at slow speed',
    type: 'sci-fi',
    glyph: '🚀',
    sceneCount: 5,
    duration: 30,
  },
  {
    id: 'cozy-morning',
    title: 'Cozy Morning',
    description: 'Warm, friendly slice-of-life for vlogs.',
    prompt: 'A warm morning routine in a small sunlit apartment',
    type: 'nature',
    glyph: '☕️',
    sceneCount: 4,
    duration: 20,
  },
  {
    id: 'mythic-path',
    title: 'Mythic Path',
    description: 'Fantasy ruins, lanterns and glowing moss.',
    prompt: 'A hero walking through ancient overgrown ruins at dusk',
    type: 'fantasy',
    glyph: '🗝',
    sceneCount: 5,
    duration: 35,
  },
  {
    id: 'colour-study',
    title: 'Colour Study',
    description: 'Abstract motion graphics for ads and idents.',
    prompt: 'Abstract ribbons of colour folding through empty space',
    type: 'abstract',
    glyph: '🎨',
    sceneCount: 3,
    duration: 15,
  },
]

/* ========================================================================== */
/* 4. Character templates (assignment "Character Generator" module)           */
/* ========================================================================== */

/**
 * AI-suggested character archetypes. Picking one fills the editor fields.
 *
 * @type {{id: string, archetype: string, name: string, description: string,
 *         outfit: string, expression: string, pose: string,
 *         glyph: string, palette: [string, string]}[]}
 */
export const CHARACTER_TEMPLATES = [
  {
    id: 'futuristic-detective',
    archetype: 'Futuristic Detective',
    name: 'Detective Vale',
    description: 'A sharp-eyed investigator working the neon underbelly.',
    outfit: 'Raincoat and visor',
    expression: 'Narrowed, focused',
    pose: 'Scanning the scene',
    glyph: '🕵️',
    palette: ['#4f46e5', '#0ea5e9'],
  },
  {
    id: 'fantasy-warrior',
    archetype: 'Fantasy Warrior',
    name: 'Kael',
    description: 'A seasoned fighter carrying an old, heavy promise.',
    outfit: 'Weathered leather armour',
    expression: 'Determined',
    pose: 'Ready for battle',
    glyph: '⚔️',
    palette: ['#b45309', '#ef4444'],
  },
  {
    id: 'casual-vlogger',
    archetype: 'Casual Vlogger',
    name: 'Mia',
    description: 'A friendly host who makes any topic feel approachable.',
    outfit: 'Oversized hoodie',
    expression: 'Warm smile',
    pose: 'Talking to camera',
    glyph: '🎙',
    palette: ['#f97316', '#ec4899'],
  },
  {
    id: 'space-scientist',
    archetype: 'Space Scientist',
    name: 'Dr. Okafor',
    description: 'A calm researcher logging discoveries far from home.',
    outfit: 'Utility flight suit',
    expression: 'Curious',
    pose: 'Reviewing a hologram',
    glyph: '🔬',
    palette: ['#0891b2', '#8b5cf6'],
  },
  {
    id: 'street-musician',
    archetype: 'Street Musician',
    name: 'Rui',
    description: 'A busker whose songs stop commuters mid-step.',
    outfit: 'Denim jacket and beanie',
    expression: 'Eyes closed, singing',
    pose: 'Playing guitar',
    glyph: '🎸',
    palette: ['#7c3aed', '#f59e0b'],
  },
]

/** Outfit / expression / pose option lists used by the character editor. */
export const CHARACTER_OUTFITS = [
  'Everyday casual',
  'Raincoat and visor',
  'Weathered leather armour',
  'Utility flight suit',
  'Denim jacket and beanie',
  'Sharp business suit',
]

export const CHARACTER_EXPRESSIONS = [
  'Warm smile',
  'Determined',
  'Narrowed, focused',
  'Curious',
  'Surprised',
  'Calm and thoughtful',
]

export const CHARACTER_POSES = [
  'Standing',
  'Talking to camera',
  'Walking forward',
  'Ready for battle',
  'Reviewing a hologram',
  'Playing guitar',
]

/* ========================================================================== */
/* 5. Export / publish options (assignment "Video Composition" module)        */
/* ========================================================================== */

/**
 * Platform presets. Choosing one updates the export settings automatically,
 * which is exactly the "platform optimization" the assignment asks for.
 *
 * @type {{id: string, label: string, resolution: string, aspectRatio: string,
 *         format: string, fps: number, note: string}[]}
 */
export const EXPORT_PLATFORMS = [
  {
    id: 'tiktok',
    label: 'TikTok',
    resolution: '1080 × 1920',
    aspectRatio: '9:16',
    format: 'MP4 (H.264)',
    fps: 30,
    note: 'Vertical — hook viewers in the first 2 seconds.',
  },
  {
    id: 'reels',
    label: 'Instagram Reels',
    resolution: '1080 × 1920',
    aspectRatio: '9:16',
    format: 'MP4 (H.264)',
    fps: 30,
    note: 'Vertical — keep text away from the edges.',
  },
  {
    id: 'shorts',
    label: 'YouTube Shorts',
    resolution: '1080 × 1920',
    aspectRatio: '9:16',
    format: 'MP4 (H.264)',
    fps: 60,
    note: 'Vertical — up to 60 seconds.',
  },
  {
    id: 'feed',
    label: 'Instagram Feed',
    resolution: '1080 × 1080',
    aspectRatio: '1:1',
    format: 'MP4 (H.264)',
    fps: 30,
    note: 'Square crop — keep the subject centred.',
  },
  {
    id: 'youtube',
    label: 'YouTube (landscape)',
    resolution: '1920 × 1080',
    aspectRatio: '16:9',
    format: 'MP4 (H.264)',
    fps: 30,
    note: 'Widescreen — good for embedded playback.',
  },
]

/** Standalone resolution choices (used by the export settings panel). */
export const RESOLUTIONS = ['1080 × 1920', '1080 × 1080', '1920 × 1080', '720 × 1280']

/** Container / codec choices. */
export const FORMATS = ['MP4 (H.264)', 'MP4 (HEVC)', 'WebM (VP9)', 'MOV (ProRes)']

/** Frame-rate choices. */
export const FPS_OPTIONS = [24, 30, 60]

/* ========================================================================== */
/* 6. Sample projects shown on the "Projects" tab                             */
/* ========================================================================== */

/**
 * Mock library of previously-saved projects. Purely presentational — the
 * prototype stores nothing; this simply gives the Projects screen realistic
 * content to browse so the screen can be evaluated.
 *
 * @type {{id: string, title: string, scenes: number, updated: string,
 *         type: string, progress: number}[]}
 */
export const SAMPLE_PROJECTS = [
  { id: 'p-1', title: 'Neon City Nights', scenes: 5, updated: 'Edited 2 hours ago', type: 'urban', progress: 100 },
  { id: 'p-2', title: 'Morning Routine Vlog', scenes: 4, updated: 'Edited yesterday', type: 'nature', progress: 60 },
  { id: 'p-3', title: 'Orbit Log — Ep. 3', scenes: 6, updated: 'Edited 3 days ago', type: 'sci-fi', progress: 100 },
  { id: 'p-4', title: 'Festival Promo', scenes: 5, updated: 'Edited last week', type: 'abstract', progress: 30 },
]

