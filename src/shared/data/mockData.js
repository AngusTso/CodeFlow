/**
 * shared/data/mockData.js — the mock content catalogue.
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Every prototype needs the same building blocks: scene types, style presets,
 *   character templates, output formats. AGENTS.md says prototypes should reuse
 *   mock data, so this is the ONE place that data lives. Prototypes 02 and 03
 *   will import from here unchanged.
 *
 * LOCAL ARTWORK
 * ---------------------------------------------------------------------------
 *   Vite imports the local WebP catalogue and inlines it into each standalone
 *   HTML deliverable. Artwork stays available offline and never uses a remote
 *   image service.
 * ---------------------------------------------------------------------------
 */

const PICTURE_URLS = {
  'abstract/Boxes_scene.webp': new URL('../picture/abstract/Boxes_scene.webp', import.meta.url).href,
  'abstract/Glassy_scene.webp': new URL('../picture/abstract/Glassy_scene.webp', import.meta.url).href,
  'abstract/Vanilla_scene.webp': new URL('../picture/abstract/Vanilla_scene.webp', import.meta.url).href,
  'character/CartoonAdventurer.webp': new URL('../picture/character/CartoonAdventurer.webp', import.meta.url).href,
  'character/CartoonBusinessMan.webp': new URL('../picture/character/CartoonBusinessMan.webp', import.meta.url).href,
  'character/CartoonMan.webp': new URL('../picture/character/CartoonMan.webp', import.meta.url).href,
  'character/IllustrationFemaleMechanic.webp': new URL('../picture/character/IllustrationFemaleMechanic.webp', import.meta.url).href,
  'character/RealisticArmy.webp': new URL('../picture/character/RealisticArmy.webp', import.meta.url).href,
  'fantasy/Assasain_scene.webp': new URL('../picture/fantasy/Assasain_scene.webp', import.meta.url).href,
  'fantasy/ElfHouse_scene.webp': new URL('../picture/fantasy/ElfHouse_scene.webp', import.meta.url).href,
  'fantasy/FortuneTeller_scene.webp': new URL('../picture/fantasy/FortuneTeller_scene.webp', import.meta.url).href,
  'fantasy/Princess_scene.webp': new URL('../picture/fantasy/Princess_scene.webp', import.meta.url).href,
  'fantasy/Witcher_scene.webp': new URL('../picture/fantasy/Witcher_scene.webp', import.meta.url).href,
  'nature/FlowerField_scene.webp': new URL('../picture/nature/FlowerField_scene.webp', import.meta.url).href,
  'nature/Lake_scene.webp': new URL('../picture/nature/Lake_scene.webp', import.meta.url).href,
  'nature/Mountain_scene.webp': new URL('../picture/nature/Mountain_scene.webp', import.meta.url).href,
  'nature/Mushroom_scene.webp': new URL('../picture/nature/Mushroom_scene.webp', import.meta.url).href,
  'nature/Volcano_scene.webp': new URL('../picture/nature/Volcano_scene.webp', import.meta.url).href,
  'profile/Boy_profile.webp': new URL('../picture/profile/Boy_profile.webp', import.meta.url).href,
  'profile/Girl_profile.webp': new URL('../picture/profile/Girl_profile.webp', import.meta.url).href,
  'sci-fi/AntAlienInvasion_scene.webp': new URL('../picture/sci-fi/AntAlienInvasion_scene.webp', import.meta.url).href,
  'sci-fi/CyberpunkNight_scene.webp': new URL('../picture/sci-fi/CyberpunkNight_scene.webp', import.meta.url).href,
  'sci-fi/Mars_scene.webp': new URL('../picture/sci-fi/Mars_scene.webp', import.meta.url).href,
  'sci-fi/SpaceStation_scene.webp': new URL('../picture/sci-fi/SpaceStation_scene.webp', import.meta.url).href,
  'sci-fi/Space_scene.webp': new URL('../picture/sci-fi/Space_scene.webp', import.meta.url).href,
  'urban/Carpark_scene.webp': new URL('../picture/urban/Carpark_scene.webp', import.meta.url).href,
  'urban/City_scene.webp': new URL('../picture/urban/City_scene.webp', import.meta.url).href,
  'urban/RIverside_scene.webp': new URL('../picture/urban/RIverside_scene.webp', import.meta.url).href,
  'urban/Town_scene.webp': new URL('../picture/urban/Town_scene.webp', import.meta.url).href,
  'urban/Underground_scene.webp': new URL('../picture/urban/Underground_scene.webp', import.meta.url).href,
}

function pictureUrl(category, filename) {
  const path = `${category}/${filename}`
  const url = PICTURE_URLS[path]
  if (!url) throw new Error(`Missing local mock artwork: ${path}`)
  return url
}

const SCENE_ARTWORK = {
  urban: [
    { file: 'City_scene.webp', alt: 'A paved city plaza framed by modern office buildings.', words: ['city', 'urban', 'neon', 'street', 'skyline'] },
    { file: 'Carpark_scene.webp', alt: 'A multi-level car park at night.', words: ['car', 'parking', 'garage'] },
    { file: 'RIverside_scene.webp', alt: 'A riverside walkway beside the city.', words: ['river', 'riverside', 'waterfront'] },
    { file: 'Town_scene.webp', alt: 'A quiet town street lined with buildings.', words: ['town', 'village', 'cafe', 'café', 'bakery'] },
    { file: 'Underground_scene.webp', alt: 'An underground urban passage.', words: ['underground', 'subway', 'tunnel', 'station'] },
  ],
  nature: [
    { file: 'FlowerField_scene.webp', alt: 'A field of flowers in soft daylight.', words: ['flower', 'field', 'wildflower', 'meadow', 'garden'] },
    { file: 'Lake_scene.webp', alt: 'A calm lake surrounded by nature.', words: ['lake', 'waterfall', 'river', 'shore', 'water'] },
    { file: 'Mountain_scene.webp', alt: 'A lone hiker looking across a mountain range at sunset.', words: ['mountain', 'ridge', 'peak', 'hiker'] },
    { file: 'Mushroom_scene.webp', alt: 'Mushrooms growing on a forest floor.', words: ['mushroom', 'forest', 'woods', 'moss'] },
    { file: 'Volcano_scene.webp', alt: 'A volcanic landscape.', words: ['volcano', 'lava', 'eruption'] },
  ],
  'sci-fi': [
    { file: 'AntAlienInvasion_scene.webp', alt: 'An alien invasion approaches a futuristic world.', words: ['alien', 'invasion', 'attack'] },
    { file: 'CyberpunkNight_scene.webp', alt: 'A neon-lit cyberpunk city at night.', words: ['cyberpunk', 'neon', 'rain', 'night', 'signal'] },
    { file: 'Mars_scene.webp', alt: 'A distant view across the surface of Mars.', words: ['mars', 'red planet', 'desert'] },
    { file: 'SpaceStation_scene.webp', alt: 'The interior of a bright futuristic space station.', words: ['station', 'orbital', 'corridor', 'control'] },
    { file: 'Space_scene.webp', alt: 'A spacecraft traveling through deep space.', words: ['space', 'planet', 'orbit', 'star', 'galaxy'] },
  ],
  fantasy: [
    { file: 'Assasain_scene.webp', alt: 'A fantasy assassin moves through a shadowy setting.', words: ['assassin', 'assasain', 'stealth', 'shadow'] },
    { file: 'ElfHouse_scene.webp', alt: 'A fantastical home among woodland surroundings.', words: ['elf', 'woodland', 'home', 'house'] },
    { file: 'FortuneTeller_scene.webp', alt: 'A fortune teller reads signs in a mystical setting.', words: ['fortune', 'oracle', 'prophecy', 'teller'] },
    { file: 'Princess_scene.webp', alt: 'A princess in a fantasy setting.', words: ['princess', 'queen', 'royal', 'castle'] },
    { file: 'Witcher_scene.webp', alt: 'A cloaked fantasy wanderer in a forest.', words: ['witcher', 'wandering', 'ruins', 'knight', 'hero'] },
  ],
  abstract: [
    { file: 'Boxes_scene.webp', alt: 'Geometric boxes arranged as an abstract composition.', words: ['box', 'geometry', 'shape'] },
    { file: 'Glassy_scene.webp', alt: 'A translucent glass-like abstract composition.', words: ['glass', 'crystal', 'transparent', 'light'] },
    { file: 'Vanilla_scene.webp', alt: 'A soft, minimal abstract composition in warm tones.', words: ['soft', 'minimal', 'warm', 'pastel'] },
  ],
}

const CHARACTER_ARTWORK = {
  'futuristic-mechanic': {
    imageUrl: pictureUrl('character', 'IllustrationFemaleMechanic.webp'),
    alt: 'An illustrated female mechanic in work clothes, standing with her hands on her hips.',
  },
  'fantasy-warrior': {
    imageUrl: pictureUrl('character', 'CartoonAdventurer.webp'),
    alt: 'A colorful illustrated fantasy adventurer standing ready for a journey.',
  },
  'casual-vlogger': {
    imageUrl: pictureUrl('character', 'CartoonMan.webp'),
    alt: 'A friendly cartoon man wearing a blue shirt and cap.',
  },
  'creative-producer': {
    imageUrl: pictureUrl('character', 'CartoonBusinessMan.webp'),
    alt: 'An illustrated business professional in smart attire.',
  },
  'frontier-scout': {
    imageUrl: pictureUrl('character', 'RealisticArmy.webp'),
    alt: 'A futuristic armored scout wearing a visor and utility gear.',
  },
}

/**
 * Select a local scene image that best fits its category and descriptive text.
 * The variant provides deterministic variety when no semantic keyword matches.
 */
export function sceneArtworkFor(typeId, subject = '', variant = 0) {
  const category = SCENE_ARTWORK[typeId] ? typeId : 'urban'
  const text = String(subject).toLowerCase()
  if (category === 'urban' && /\b(cyberpunk|neon|rain|rainy)\b/.test(text)) {
    const artwork = SCENE_ARTWORK['sci-fi'][1]
    return {
      imageUrl: pictureUrl('sci-fi', artwork.file),
      alt: artwork.alt,
    }
  }
  const bank = SCENE_ARTWORK[category]
  const scored = bank.map((artwork) => ({
    artwork,
    score: artwork.words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0),
  }))
  const bestScore = Math.max(...scored.map((entry) => entry.score))
  const candidates = bestScore
    ? scored.filter((entry) => entry.score === bestScore).map((entry) => entry.artwork)
    : bank
  const artwork = candidates[((variant % candidates.length) + candidates.length) % candidates.length]
  return {
    imageUrl: pictureUrl(category, artwork.file),
    alt: artwork.alt,
  }
}

/** Pick the scene category and image most relevant to a free-form idea. */
export function artworkForText(subject = '', variant = 0) {
  const text = String(subject).toLowerCase()
  const categoryWords = {
    urban: ['city', 'street', 'urban', 'town', 'neon', 'subway', 'carpark'],
    nature: ['forest', 'nature', 'flower', 'field', 'lake', 'mountain', 'river', 'volcano', 'mushroom'],
    'sci-fi': ['space', 'planet', 'sci-fi', 'sci fi', 'station', 'alien', 'mars', 'cyberpunk', 'orbital'],
    fantasy: ['fantasy', 'elf', 'assassin', 'witcher', 'princess', 'fortune', 'castle', 'knight'],
    abstract: ['abstract', 'colour', 'color', 'glass', 'geometry', 'shape'],
  }
  const category = Object.entries(categoryWords)
    .map(([id, words]) => ({ id, score: words.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0) }))
    .sort((left, right) => right.score - left.score)[0]
  return sceneArtworkFor(category?.score ? category.id : 'abstract', subject, variant)
}

/* ========================================================================== */
/* 1. Scene generation parameters (assignment "Scene Generation" module)      */
/* ========================================================================== */

/**
 * Scene types the user can choose from.
 * `palette` = two hex colours retained as a resilient image fallback.
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

export const PROFILE_ARTWORK = {
  imageUrl: pictureUrl('profile', 'Girl_profile.webp'),
  alt: 'Profile portrait of a smiling young woman with dark hair.',
}

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
    description: 'Rain-dark streets glow beneath the neon signs of a cyberpunk city.',
    prompt: 'A cyberpunk city at night with neon lights and rain-slicked streets',
    type: 'urban',
    ...sceneArtworkFor('sci-fi', 'cyberpunk city neon rain'),
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
    ...sceneArtworkFor('nature', 'misty forest mountain river'),
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
    ...sceneArtworkFor('sci-fi', 'space station planet orbit'),
    glyph: '🚀',
    sceneCount: 5,
    duration: 30,
  },
  {
    id: 'cozy-morning',
    title: 'Cozy Morning',
    description: 'A gentle morning stroll through a quiet, sunlit town.',
    prompt: 'A warm morning stroll through a quiet small town',
    type: 'nature',
    ...sceneArtworkFor('urban', 'quiet town morning'),
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
    ...sceneArtworkFor('fantasy', 'hero walking through forest ruins'),
    glyph: '🗝',
    sceneCount: 5,
    duration: 35,
  },
  {
    id: 'colour-study',
    title: 'Colour Study',
    description: 'Translucent glass forms fold and drift through soft light.',
    prompt: 'Abstract ribbons of colour folding through empty space',
    type: 'abstract',
    ...sceneArtworkFor('abstract', 'glassy soft light'),
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
 *         glyph: string, palette: [string, string], imageUrl: string, alt: string}[]}
 */
export const CHARACTER_TEMPLATES = [
  {
    id: 'futuristic-mechanic',
    archetype: 'Futuristic Mechanic',
    name: 'Mara',
    description: 'A resourceful mechanic who keeps a futuristic city running.',
    outfit: 'Workshop coveralls',
    expression: 'Confident and focused',
    pose: 'Ready to repair a machine',
    glyph: '⚙️',
    palette: ['#4f46e5', '#0ea5e9'],
    ...CHARACTER_ARTWORK['futuristic-mechanic'],
  },
  {
    id: 'fantasy-warrior',
    archetype: 'Fantasy Adventurer',
    name: 'Kael',
    description: 'A bright-eyed adventurer ready to set out on a new quest.',
    outfit: 'Weathered leather armour',
    expression: 'Determined',
    pose: 'Standing ready for a journey',
    glyph: '🧭',
    palette: ['#b45309', '#ef4444'],
    ...CHARACTER_ARTWORK['fantasy-warrior'],
  },
  {
    id: 'casual-vlogger',
    archetype: 'Casual Vlogger',
    name: 'Jordan',
    description: 'A relaxed on-camera host who makes any topic feel approachable.',
    outfit: 'Blue shirt and cap',
    expression: 'Warm smile',
    pose: 'Talking to camera',
    glyph: '🎙',
    palette: ['#f97316', '#ec4899'],
    ...CHARACTER_ARTWORK['casual-vlogger'],
  },
  {
    id: 'creative-producer',
    archetype: 'Creative Producer',
    name: 'Alex',
    description: 'A polished producer shaping ideas into clear, memorable stories.',
    outfit: 'Smart business attire',
    expression: 'Confident and focused',
    pose: 'Presenting a new idea',
    glyph: '🎬',
    palette: ['#0891b2', '#8b5cf6'],
    ...CHARACTER_ARTWORK['creative-producer'],
  },
  {
    id: 'frontier-scout',
    archetype: 'Frontier Scout',
    name: 'Vale',
    description: 'A field scout navigating dangerous terrain in protective gear.',
    outfit: 'Armored field uniform',
    expression: 'Alert and watchful',
    pose: 'Scanning the horizon',
    glyph: '🪖',
    palette: ['#7c3aed', '#f59e0b'],
    ...CHARACTER_ARTWORK['frontier-scout'],
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
  { id: 'p-1', title: 'Neon City Nights', scenes: 5, updated: 'Edited 2 hours ago', type: 'urban', progress: 100, ...sceneArtworkFor('sci-fi', 'cyberpunk neon city') },
  { id: 'p-2', title: 'Morning Routine Vlog', scenes: 4, updated: 'Edited yesterday', type: 'nature', progress: 60, ...sceneArtworkFor('urban', 'quiet town morning') },
  { id: 'p-3', title: 'Orbit Log — Ep. 3', scenes: 6, updated: 'Edited 3 days ago', type: 'sci-fi', progress: 100, ...sceneArtworkFor('sci-fi', 'space station planet orbit') },
  { id: 'p-4', title: 'Festival Promo', scenes: 5, updated: 'Edited last week', type: 'abstract', progress: 30, ...sceneArtworkFor('abstract', 'glassy abstract shapes') },
]


/* ========================================================================== */
/* Prototype 02: professional control vocabulary                                */
/* --------------------------------------------------------------------------- */
/* Prototype 02 brief section 8 - "Keep the control vocabulary intentionally     */
/* limited for the prototype." Section 13 - origin badges that make the timeline */
/* AI-aware. ADDITIVE: Prototype 01 never imports anything below this line.      */
/* ========================================================================== */

/** Camera lens values (brief section 8). */
export const LENSES = ['18mm', '24mm', '35mm', '50mm', '85mm']

/** Camera movement (brief section 8). */
export const MOVEMENTS = ['Static', 'Push-in', 'Tracking', 'Handheld', 'Crane']

/** Framing (brief section 8). */
export const FRAMINGS = ['Extreme Wide', 'Wide', 'Medium', 'Medium Close', 'Close', 'Extreme Close']

/** Lighting intensity is a continuous 0-100% value (brief section 8). */
export const LIGHTING_INTENSITY = { min: 0, max: 100, step: 1 }

/** Lighting contrast (brief section 8). */
export const LIGHTING_CONTRAST = ['Low', 'Medium', 'High']

/**
 * Origin badges (brief section 13). These tell the reviewer whether a clip was
 * produced by AI, edited by a person, or is an alternative AI take - which is
 * how the prototype says "AI participates, the human remains in control".
 *
 * `glyph` holds the badge character itself (see the U+ code points above).
 * @type {{id: string, label: string, glyph: string, title: string}[]}
 */
export const ORIGIN_BADGES = [
  {
    id: 'ai-generated',
    label: 'AI Generated',
    glyph: '✨',
    title: 'Produced by AI and untouched since',
  },
  {
    id: 'human-edited',
    label: 'Human Edited',
    glyph: '✎',
    title: 'Adjusted by a person',
  },
  {
    id: 'ai-variation',
    label: 'AI Variation',
    glyph: '↻',
    title: 'A generated alternative take',
  },
]

/** Marketing scene roles (brief section 19). */
export const MARKETING_ROLES = ['hook', 'product', 'benefit', 'cta']

/** Human labels for those roles. */
export const MARKETING_ROLE_LABELS = {
  hook: 'Hook',
  product: 'Product',
  benefit: 'Benefit',
  cta: 'CTA',
}

/**
 * Example Copilot instructions (brief section 10), offered as quick chips so a
 * reviewer can drive the proposal -> review -> apply flow without typing.
 * @type {string[]}
 */
export const COPILOT_SUGGESTIONS = [
  'Make this scene feel like a tense 1980s sci-fi thriller.',
  'Make this scene feel more tense and cinematic.',
  'Give the opening a stronger hook.',
  'Match the lighting of the previous scene.',
  'Shorten this for social.',
]