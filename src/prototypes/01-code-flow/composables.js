/**
 * 01-code-flow/composables.js — dependency-injection helpers for Prototype 01.
 * ---------------------------------------------------------------------------
 * WHY?
 *   `provide()`/`inject()` needs a shared key. Using plain strings ("store")
 *   risks collisions; using Symbols defined here keeps the contract explicit.
 *
 *   These tiny wrappers also give a clear error if a component is ever used
 *   outside the app, instead of failing later with "cannot read property of
 *   undefined".
 *
 * The keys are defined in this leaf module (not in main.js) to avoid a circular
 * import: main.js → App.vue → components → main.js.
 */

import { inject } from 'vue'

/** Injection keys. Symbols guarantee uniqueness across the app. */
export const STORE_KEY = Symbol('creationStore')
export const ROUTER_KEY = Symbol('hashRouter')
export const REDUCED_MOTION_KEY = Symbol('prefersReducedMotion')

/**
 * Access the shared creation store (see shared/store/creationStore.js).
 * @returns {object} The store API.
 */
export function useStore() {
  const store = inject(STORE_KEY)
  if (!store) throw new Error('useStore() must be called inside the app root (missing provider).')
  return store
}

/**
 * Access the hash router (see shared/router/hashRouter.js).
 * @returns {object} The router API.
 */
export function useRouter() {
  const router = inject(ROUTER_KEY)
  if (!router) throw new Error('useRouter() must be called inside the app root (missing provider).')
  return router
}

/**
 * Access the shared reduced-motion flag so interactions can branch on it.
 * @returns {import('vue').Ref<boolean>}
 */
export function useReducedMotion() {
  const flag = inject(REDUCED_MOTION_KEY)
  if (!flag) throw new Error('useReducedMotion() must be called inside the app root.')
  return flag
}
