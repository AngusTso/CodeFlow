/**
 * shared/utils/async.js — simulated network / AI latency helpers.
 * ---------------------------------------------------------------------------
 * WHY?
 *   The prototypes fake an AI backend. A real generation call takes time, and
 *   that delay is a genuine part of the UX (loading spinner, "✨ AI is doing its
 *   magic…", disabled buttons). Without a delay the UI would flash the result
 *   instantly and the loading state could never be seen or demoed.
 *
 *   These helpers are SHARED by all three prototypes so every prototype feels
 *   equally "real", even though their loading visuals differ wildly.
 */

/**
 * Resolve after `ms` milliseconds.
 *
 * NOTE ON ACCESSIBILITY: the delay is intentionally short (≈1 second) so it
 * never feels like a hang, and every loading state is also announced to screen
 * readers through an `aria-live` region (see <GenerationState>).
 *
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Await a value after a simulated processing delay.
 *
 * @template T
 * @param {T} value - The value to "generate".
 * @param {number} [ms=1100] - Simulated latency in milliseconds.
 * @returns {Promise<T>}
 */
export function simulate(value, ms = 1100) {
  return delay(ms).then(() => value)
}

/**
 * Simulate latency proportional to how much work was "done".
 * Bigger results (more scenes) take slightly longer — a small touch that makes
 * the simulation feel believable without ever being slow.
 *
 * @template T
 * @param {T} value
 * @param {number} units - e.g. number of scenes generated.
 * @param {number} [baseMs=700] - Minimum duration.
 * @param {number} [perUnitMs=180] - Extra duration per unit.
 * @returns {Promise<T>}
 */
export function simulateScaled(value, units, baseMs = 700, perUnitMs = 180) {
  return simulate(value, baseMs + units * perUnitMs)
}
