/**
 * shared/utils/format.js — small display formatters.
 * ---------------------------------------------------------------------------
 * Kept in `shared/` because all three prototypes show the same underlying data
 * (scene durations, total video length) even though they style it differently.
 */

/**
 * Format a duration in seconds as a compact label, e.g. `6s`, `45s`, `1m 05s`.
 * @param {number} seconds
 * @returns {string}
 */
export function formatSceneDuration(seconds) {
  const total = Math.max(0, Math.round(seconds))
  if (total < 60) return `${total}s`
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}m ${String(rest).padStart(2, '0')}s`
}

/**
 * Format a duration as `m:ss`, the convention used by video players.
 * @param {number} seconds
 * @returns {string}
 */
export function formatClock(seconds) {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

/**
 * Sum the durations of an array of scenes.
 * @param {{duration: number}[]} scenes
 * @returns {number} Total seconds.
 */
export function totalDuration(scenes) {
  return scenes.reduce((sum, scene) => sum + (scene.duration || 0), 0)
}

/**
 * Turn a value into a slug suitable for ids/anchors, e.g. "Sci-Fi City!" →
 * "sci-fi-city".
 * @param {string} value
 * @returns {string}
 */
export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
