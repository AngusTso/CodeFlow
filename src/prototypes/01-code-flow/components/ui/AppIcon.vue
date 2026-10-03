<script setup>
/**
 * AppIcon.vue — the prototype's icon set.
 * ---------------------------------------------------------------------------
 * WHY INLINE SVG?
 *   An icon font or a CDN sprite would be an external request, which breaks the
 *   "one self-contained HTML file" requirement. Rendering inline <svg> paths
 *   means every icon is bundled into the built file and works offline.
 *
 * ACCESSIBILITY
 *   Icons are decorative by default (`aria-hidden="true"`), because the control
 *   around them (a <button>) always carries the real accessible name. Pass a
 *   `title` only when an icon stands alone and needs its own label.
 */

const props = defineProps({
  /** Key from the ICONS map below. */
  name: { type: String, required: true },
  /** Rendered size in px. Defaults to 20 (comfortable inside 44px targets). */
  size: { type: [Number, String], default: 20 },
  /** Optional accessible name; when set the icon stops being decorative. */
  title: { type: String, default: '' },
})

/**
 * Icon geometry on a 24×24 grid. Each entry is a list of SVG path `d` strings,
 * kept as data so a single <svg> element can render them all.
 * @type {Record<string, string[]>}
 */
const ICONS = {
  home: ['M3.5 11 12 4l8.5 7', 'M5.5 10.2V20h13v-9.8'],
  projects: ['M3 7.5A1.5 1.5 0 0 1 4.5 6h4l1.8 2H19.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z'],
  create: ['M12 3.2l1.5 4.4L18 9l-4.5 1.4L12 14.8l-1.5-4.4L6 9l4.5-1.4z', 'M18 15.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z'],
  profile: ['M12 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z', 'M4.5 20a7.5 7.5 0 0 1 15 0'],
  back: ['M14.5 6 8.5 12l6 6'],
  close: ['M6.5 6.5l11 11', 'M17.5 6.5l-11 11'],
  plus: ['M12 5.5v13', 'M5.5 12h13'],
  trash: ['M4.5 7h15', 'M9.5 7V4.8h5V7', 'M6.5 7l1 12.5h9l1-12.5'],
  refresh: ['M19.5 12a7.5 7.5 0 1 1-2.2-5.3', 'M19.5 4.5v5h-5'],
  up: ['M12 19V5.5', 'M6.5 11 12 5.5 17.5 11'],
  down: ['M12 5v13.5', 'M6.5 13 12 18.5 17.5 13'],
  play: ['M8.5 5.2 18.5 12l-10 6.8z'],
  pause: ['M9.5 6v12', 'M14.5 6v12'],
  chevronRight: ['M10 6l6 6-6 6'],
  check: ['M5.5 12.5l4.2 4.2L18.5 7.5'],
  image: ['M3.5 5.5h17v13h-17z', 'M3.5 15.5l4.8-4.8 3.6 3.6 2.9-2.9 5.7 5.7'],
  clock: ['M12 7.2v5l3.2 2', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z'],
  download: ['M12 4.5v10.5', 'M7.5 11 12 15.5 16.5 11', 'M4.5 19.5h15'],
  grip: ['M9.5 6.5h.01', 'M9.5 12h.01', 'M9.5 17.5h.01', 'M14.5 6.5h.01', 'M14.5 12h.01', 'M14.5 17.5h.01'],
  sliders: ['M4 8h9', 'M17 8h3', 'M4 16h4', 'M12 16h8', 'M15.5 5.5v5', 'M9.5 13.5v5'],
  camera: ['M4 8.5h2.6L8.2 6h7.6l1.6 2.5H20v10H4z', 'M12 16.6a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2z'],
  sun: ['M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z', 'M12 2.5v2', 'M12 19.5v2', 'M2.5 12h2', 'M19.5 12h2', 'M5.2 5.2l1.4 1.4', 'M17.4 17.4l1.4 1.4', 'M5.2 18.8l1.4-1.4', 'M17.4 6.6l1.4-1.4'],
  music: ['M9 18V6.5l9-2v11', 'M9 18a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0z', 'M18 15.5a2.2 2.2 0 1 1-4.4 0 2.2 2.2 0 0 1 4.4 0z'],
  layers: ['M12 3.5 20 8l-8 4.5L4 8z', 'M4 12.5 12 17l8-4.5', 'M4 16.5 12 21l8-4.5'],
  wand: ['M4.5 19.5 15 9', 'M14 4.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4L10.7 7.8l2.4-.9z', 'M19 13.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z'],
  share: ['M12 15.5V4.5', 'M8 8.5 12 4.5l4 4', 'M5 19.5h14'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v5.5', 'M12 7.8h.01'],
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
