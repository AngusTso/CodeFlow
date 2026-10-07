<script setup>
/**
 * SigIcon.vue — the only icon source in Prototype 03.
 * ---------------------------------------------------------------------------
 * Inline SVG paths rather than an icon font or CDN set, so the single-file
 * build makes no external requests (AGENTS.md) and so every icon is a real,
 * themeable `<path>` instead of a glyph that might be missing.
 *
 * Icons are ALWAYS decorative in this prototype: the accessible name comes from
 * the surrounding button's visible text or its `aria-label`. That is why every
 * icon here is marked `aria-hidden` in the template (brief section 47).
 */

const props = defineProps({
  /** Name from the registry below. */
  name: { type: String, required: true },
  /** Rendered size in pixels. */
  size: { type: Number, default: 16 },
  /** Stroke width. Slightly heavier on small icons keeps them legible. */
  stroke: { type: Number, default: 1.7 },
})

/**
 * Path data keyed by icon name. All are drawn on a 24x24 grid with round caps
 * and joins so the set looks like one family.
 */
const PATHS = {
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3',
  user: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM4 21c0-3.9 3.6-6.5 8-6.5s8 2.6 8 6.5',
  pencil: 'M4 20h4L20 8l-4-4L4 16v4ZM14 6l4 4',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6',
  spark: 'M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4',
  merge: 'M7 4v6a5 5 0 0 0 5 5h0a5 5 0 0 0 5-5V4M12 15v5M9 17l3 3 3-3',
  branch: 'M6 3v12a3 3 0 0 0 3 3h6M6 8h6a3 3 0 0 1 3 3v0M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  lock: 'M6 10V7a6 6 0 1 1 12 0v3M5 10h14v10H5zM12 14v3',
  target: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z',
  trash: 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6',
  flask: 'M9 3h6M10 3v6L5 19a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3M7 15h10',
  play: 'M7 4l12 8-12 8z',
  pause: 'M8 4v16M16 4v16',
  close: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  reset: 'M4 12a8 8 0 1 1 2.5 5.8M4 18v-5h5',
  check: 'M4 12l5 5L20 6',
  warn: 'M12 3l9 17H3zM12 9v5M12 17v.5',
  archive: 'M3 6h18v4H3zM5 10v10h14V10M9 14h6',
  export: 'M12 3v12M8 7l4-4 4 4M4 15v5h16v-5',
  arrowRight: 'M4 12h16M14 6l6 6-6 6',
  arrowLeft: 'M20 12H4M10 6l-6 6 6 6',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  layers: 'M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17l9 5 9-5',
  film: 'M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4',
  undo: 'M9 14L4 9l5-5M4 9h9a7 7 0 0 1 0 14h-3',
  download: 'M12 3v12M7 11l5 5 5-5M4 20h16',
}
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="props.stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="PATHS[props.name] || PATHS.spark" />
  </svg>
</template>