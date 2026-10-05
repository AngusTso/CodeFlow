/**
 * 02-professional-workspace/composables.js - dependency-injection helpers.
 * ---------------------------------------------------------------------------
 * Same provide/inject contract as Prototype 01 (so the two prototypes remain
 * easy to compare), but keyed with its OWN Symbols. Prototype 02 must never
 * inject Prototype 01's store by accident.
 *
 * The keys live in this leaf module - not in main.js - to avoid a circular
 * import: main.js -> App.vue -> components -> main.js.
 */

import { inject } from 'vue'

/** Injection keys. Symbols guarantee uniqueness across both prototypes. */
export const STORE_KEY = Symbol('pro-workspace-store')
export const ROUTER_KEY = Symbol('pro-hash-router')
export const REDUCED_MOTION_KEY = Symbol('pro-prefers-reduced-motion')

/**
 * Access the workspace store (workspaceStore.js).
 * @returns {object} The store API.
 */
export function useStore() {
  const store = inject(STORE_KEY)
  if (!store) throw new Error('useStore() must be called inside the Prototype 02 app root.')
  return store
}

/**
 * Access the hash router (shared/router/hashRouter.js).
 * @returns {object} The router API.
 */
export function useRouter() {
  const router = inject(ROUTER_KEY)
  if (!router) throw new Error('useRouter() must be called inside the Prototype 02 app root.')
  return router
}

/**
 * The shared reduced-motion flag. Every cinematic/interactive transition in
 * theme.css is neutralised by CSS; components use this when the behaviour is
 * JavaScript-driven (for example scrubbing the preview).
 * @returns {import('vue').Ref<boolean>}
 */
export function useReducedMotion() {
  const flag = inject(REDUCED_MOTION_KEY)
  if (!flag) throw new Error('useReducedMotion() must be called inside the Prototype 02 app root.')
  return flag
}

/* ========================================================================== */
/* Contextual AI actions (brief section 18)                                   */
/* -------------------------------------------------------------------------- */
/* The Inspector and the AI Action Bar both render the SAME action labels for  */
/* the current selection, so the label -> outcome mapping lives here, in one   */
/* place. That guarantees "Generate Variation" does the same thing wherever it */
/* is clicked - a small detail that makes a tool feel trustworthy.            */
/* ========================================================================== */

/** Actions that map onto a concrete store command rather than the Copilot. */
const VARIATION_ACTIONS = [
  'Generate Variation',
  'Generate Alternative',
  'Generate 3 Variations',
]

/**
 * Run a contextual AI action.
 *
 * Nothing here mutates the project silently:
 *   - variation actions produce an alternate that the user must review and
 *     apply by hand (brief section 15);
 *   - trim actions reuse the same store command as the timeline's own controls;
 *   - everything else opens the Copilot with the label pre-filled, so a
 *     proposal is read and approved first (brief section 10).
 *
 * @returns {{runAction: (action: string) => void}} The dispatcher.
 */
export function useAiActions() {
  const store = useStore()

  /** Trim the selected clip; a no-op when nothing is selected. */
  function trimBy(seconds) {
    const selected = store.state.selectedClip
    if (selected) store.resizeClip(selected.trackId, selected.clipId, seconds)
  }

  function runAction(action) {
    if (VARIATION_ACTIONS.includes(action)) {
      store.requestVariation()
      return
    }

    if (action === 'Extend') {
      trimBy(2)
      return
    }

    if (action === 'Shorten') {
      trimBy(-2)
      return
    }

    store.state.copilot.instruction = action
    store.openCopilot()
  }

  return { runAction }
}
