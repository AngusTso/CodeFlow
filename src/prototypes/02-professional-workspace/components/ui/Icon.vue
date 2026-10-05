<script setup>
/**
 * Icon.vue - Prototype 02's inline SVG icon set.
 * ---------------------------------------------------------------------------
 * WHY INLINE SVG
 *   An icon font or a CDN sprite would be an external request, which breaks
 *   the "one self-contained HTML file" requirement. Every icon here is bundled.
 *
 * WHY `stroke="currentColor"`
 *   Icons inherit the surrounding text colour, so a single icon file works on
 *   the dark studio palette without variants, and stays legible when a parent
 *   switches to the accent colour.
 *
 * ACCESSIBILITY
 *   Decorative by default (`aria-hidden`), because the control around an icon
 *   always carries the real accessible name. Pass `title` only when an icon
 *   stands alone and needs its own label.
 */

const props = defineProps({
  /** Key from the ICONS map below. */
  name: { type: String, required: true },
  /** Rendered size in px. */
  size: { type: [Number, String], default: 16 },
  /** Optional accessible name; when set the icon is no longer decorative. */
  title: { type: String, default: '' },
})

/**
 * Icon geometry on a 24x24 grid. Each entry is an array of SVG path `d`
 * strings; one <svg> renders them all.
 * @type {Record<string, string[]>}
 */
const ICONS = {
  /* Playback / preview */
  play: ['M8.5 5.2 18.5 12l-10 6.8z'],
  pause: ['M9.5 6v12', 'M14.5 6v12'],
  stop: ['M7 7h10v10H7z'],
  fullscreen: ['M4 9V4h5', 'M20 9V4h-5', 'M4 15v5h5', 'M20 15v5h-5'],
  compare: ['M4 5h16v14H4z', 'M12 5v14'],

  /* History */
  undo: ['M4.5 10.5h8a5 5 0 0 1 0 10H9', 'M4.5 10.5l4-4', 'M4.5 10.5l4 4'],
  redo: ['M19.5 10.5h-8a5 5 0 0 0 0 10H15', 'M19.5 10.5l-4-4', 'M19.5 10.5l-4 4'],

  /* Actions */
  download: ['M12 4v10', 'M7.5 11 12 15.5 16.5 11', 'M4.5 19.5h15'],
  send: ['M5 12h13', 'M13 7l5 5-5 5'],
  plus: ['M12 5.5v13', 'M5.5 12h13'],
  minus: ['M5.5 12h13'],
  close: ['M6.5 6.5l11 11', 'M17.5 6.5l-11 11'],
  check: ['M5.5 12.5l4.2 4.2L18.5 7.5'],
  copy: ['M9.5 9.5h10v10h-10z', 'M5 14.5v-9h9'],
  trash: ['M4.5 7h15', 'M9.5 7V4.8h5V7', 'M6.5 7l1 12.5h9l1-12.5'],
  search: ['M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M15.5 15.5 20 20'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v5.5', 'M12 7.9h.01'],
  sliders: ['M4 8h9', 'M17 8h3', 'M4 16h4', 'M12 16h8', 'M15.5 5.5v5', 'M9.5 13.5v5'],

  /* AI */
  spark: [
    'M11 3l1.6 4.7L17 9.4l-4.4 1.4L11 15.5 9.4 10.8 5 9.4l4.4-1.7z',
    'M18 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  ],

  /* Chevrons / disclosure */
  chevronDown: ['M6 9.5l6 6 6-6'],
  chevronUp: ['M6 14.5l6-6 6 6'],
  chevronRight: ['M9.5 6l6 6-6 6'],
  chevronLeft: ['M14.5 6l-6 6 6 6'],

  /* Reordering */
  up: ['M12 19V5.5', 'M6.5 11 12 5.5 17.5 11'],
  down: ['M12 5v13.5', 'M6.5 13 12 18.5 17.5 13'],
  grip: ['M9.5 6.5h.01', 'M9.5 12h.01', 'M9.5 17.5h.01', 'M14.5 6.5h.01', 'M14.5 12h.01', 'M14.5 17.5h.01'],

  /* Objects */
  person: ['M12 5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z', 'M4.5 20a7.5 7.5 0 0 1 15 0'],
  film: ['M3.5 6.5h17v11h-17z', 'M7.5 6.5v11', 'M16.5 6.5v11', 'M3.5 12h17'],
  wave: ['M4 12h1.2', 'M7.5 8.5v7', 'M11 6v12', 'M14.5 9.5v5', 'M18 11v2', 'M21 11.2h-.01'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  grid: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
  layout: ['M4 5h16v14H4z', 'M10 5v14'],
  eye: ['M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z', 'M12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z'],
  refresh: ['M19.5 12a7.5 7.5 0 1 1-2.2-5.3', 'M19.5 4.5v5h-5'],
  camera: ['M4 8.5h2.6L8.2 6h7.6l1.6 2.5H20v10H4z', 'M12 16.6a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2z'],
  sun: ['M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z', 'M12 2.5v2', 'M12 19.5v2', 'M2.5 12h2', 'M19.5 12h2', 'M5.2 5.2l1.4 1.4', 'M17.4 17.4l1.4 1.4', 'M5.2 18.8l1.4-1.4', 'M17.4 6.6l1.4-1.4'],
  wand: ['M4.5 19.5 15 9', 'M14 4.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4L10.7 7.8l2.4-.9z', 'M19 13.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z'],
  clock: ['M12 7.2v5l3.2 2', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z'],
  palette: ['M12 3.5a8.5 8.5 0 0 0 0 17h1.5a2 2 0 0 0 0-4H13a2 2 0 0 1 0-4h3a4 4 0 0 0 0-8z', 'M8 10h.01', 'M12 8h.01', 'M16 10h.01'],
  layers: ['M12 3.5 20 8l-8 4.5L4 8z', 'M4 12.5 12 17l8-4.5', 'M4 16.5 12 21l8-4.5'],
}
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    :aria-hidden="props.title ? undefined : 'true'"
    :role="props.title ? 'img' : undefined"
    :aria-label="props.title || undefined"
    focusable="false"
    class="shrink-0"
  >
    <path v-for="(d, index) in ICONS[props.name] || []" :key="index" :d="d" />
  </svg>
</template>