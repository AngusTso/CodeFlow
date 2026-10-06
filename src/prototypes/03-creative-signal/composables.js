/**
 * 03-creative-signal/composables.js - dependency-injection helpers.
 * ---------------------------------------------------------------------------
 * Mirrors Prototype 01 / 02's provide/inject contract so all three prototypes
 * read the same way, but keyed with its OWN Symbols: Prototype 03 must never
 * accidentally inject another prototype's store.
 *
 * The keys live in this leaf module rather than main.js to avoid a circular
 * import (main.js -> App.vue -> components -> main.js).
 */

import { inject } from 'vue'

/** Injection keys. Symbols guarantee uniqueness across all three prototypes. */
export const STORE_KEY = Symbol('creative-signal-store')
export const ROUTER_KEY = Symbol('creative-signal-router')
export const REDUCED_MOTION_KEY = Symbol('creative-signal-reduced-motion')

/**
 * Access the Creative Universe store (universeStore.js).
 * @returns {object} The store API.
 */
export function useStore() {
  const store = inject(STORE_KEY)
  if (!store) throw new Error('useStore() must be called inside the Prototype 03 app root.')
  return store
}

/**
 * Access the hash router (shared/router/hashRouter.js).
 * @returns {object} The router API.
 */
export function useRouter() {
  const router = inject(ROUTER_KEY)
  if (!router) throw new Error('useRouter() must be called inside the Prototype 03 app root.')
  return router
}

/**
 * The shared reduced-motion flag.
 *
 * Most motion is neutralised in CSS, but Prototype 03 has JavaScript-driven
 * behaviour too - the universe's "explore / pause" glide, and the preview's
 * frame transitions. Those branch on this so a reduced-motion user gets instant,
 * legible state changes instead of movement (brief sections 40 and 83).
 *
 * @returns {import('vue').Ref<boolean>}
 */
export function useReducedMotion() {
  const flag = inject(REDUCED_MOTION_KEY)
  if (!flag) throw new Error('useReducedMotion() must be called inside the Prototype 03 app root.')
  return flag
}