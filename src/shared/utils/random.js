/**
 * shared/utils/random.js — deterministic pseudo-random helpers.
 * ---------------------------------------------------------------------------
 * WHY DETERMINISTIC RANDOMNESS?
 *   The mock AI must feel "smart" but behave predictably. If the same idea
 *   always produces the same storyboard, the prototype is easy to demo,
 *   easy to test, and never surprises the reviewer mid-presentation.
 *
 *   We therefore seed a tiny PRNG from a string (the user's idea). Same input
 *   string → same sequence of numbers → same generated content, every time.
 *
 *   This module is SHARED by all three prototypes (per AGENTS.md) because the
 *   simulated-AI behaviour must be identical across them; only the presentation
 *   differs.
 */

/**
 * Hash an arbitrary string into a 32-bit unsigned integer (FNV-1a).
 * Used as the seed for the PRNG so identical text yields identical output.
 *
 * @param {string} input - Any string (e.g. the user's video idea).
 * @returns {number} A 32-bit unsigned integer seed.
 */
export function hashString(input) {
  const text = String(input ?? '')
  let hash = 2166136261 // FNV offset basis
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    // FNV prime multiplication using shifts to stay in 32-bit integer range.
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/**
 * Create a seeded pseudo-random number generator.
 *
 * Algorithm: mulberry32 — a compact, fast, well-distributed 32-bit PRNG.
 * It is NOT cryptographically secure, which is perfectly fine for mock data.
 *
 * @param {number} seed - Integer seed (see {@link hashString}).
 * @returns {() => number} Function returning a float in [0, 1) on each call.
 */
export function mulberry32(seed) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Convenience wrapper: create a PRNG directly from a seed string.
 * @param {string} seedText
 * @returns {() => number}
 */
export function createRng(seedText) {
  return mulberry32(hashString(seedText))
}

/**
 * Pick one random item from an array.
 * @template T
 * @param {() => number} rng - A generator from {@link mulberry32}.
 * @param {T[]} items
 * @returns {T}
 */
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)]
}

/**
 * Pick `count` distinct items from an array (order not guaranteed).
 * If `count` exceeds the array length, returns a shuffled copy of everything.
 * @template T
 * @param {() => number} rng
 * @param {T[]} items
 * @param {number} count
 * @returns {T[]}
 */
export function pickMany(rng, items, count) {
  return shuffle(rng, items).slice(0, count)
}

/**
 * Random integer in the inclusive range [min, max].
 * @param {() => number} rng
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function intBetween(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

/**
 * Fisher–Yates shuffle. Returns a NEW array; the input is not mutated.
 * @template T
 * @param {() => number} rng
 * @param {T[]} items
 * @returns {T[]}
 */
export function shuffle(rng, items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Monotonic id generator, e.g. `uid('scene')` → `scene-1`, `scene-2`, ...
 * Ids only need to be unique within a session (they are used as Vue list keys
 * and for lookup by id), so a simple counter is sufficient and predictable.
 * @param {string} prefix
 * @returns {string}
 */
let idCounter = 0
export function uid(prefix = 'id') {
  idCounter += 1
  return `${prefix}-${idCounter}`
}
