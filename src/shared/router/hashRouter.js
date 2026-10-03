/**
 * shared/router/hashRouter.js — a tiny, dependency-free hash router.
 * ---------------------------------------------------------------------------
 * WHY A HAND-WRITTEN ROUTER?
 *   The deliverable is a single HTML file opened from `file://`. Real history
 *   routing (`<path>`) breaks on `file://` because there is no server, but HASH
 *   routing (`#/projects`) works everywhere — including double-clicked files.
 *
 *   We avoid `vue-router` on purpose (AGENTS.md: minimal dependencies): we only
 *   need ~50 lines, and hand-written code is easier to read and audit.
 *
 * ROUTE MATCHING
 *   Routes are plain objects: `{ path: '/flow/:step', name: 'flow' }`.
 *   `:step` captures a segment into `route.params.step`.
 */

import { computed, ref } from 'vue'

/**
 * Turn a raw `window.location.hash` into a normalised path.
 *   ''            → '/'
 *   '#/projects'  → '/projects'
 *   '#flow/scenes'→ '/flow/scenes'
 *
 * @param {string} rawHash
 * @returns {string}
 */
export function normaliseHash(rawHash) {
  const cleaned = String(rawHash || '')
    .replace(/^#/, '')
    .trim()
  if (!cleaned || cleaned === '/') return '/'
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`
}

/**
 * Match a normalised path against the route table.
 *
 * @param {{path: string, name: string, meta?: object}[]} routes
 * @param {string} path
 * @returns {{name: string, path: string, params: Record<string,string>, meta: object} | null}
 */
export function matchRoute(routes, path) {
  const segments = path.split('/').filter(Boolean)

  for (const route of routes) {
    const patternSegments = route.path.split('/').filter(Boolean)
    if (patternSegments.length !== segments.length) continue

    /** @type {Record<string, string>} */
    const params = {}
    let matched = true

    for (let i = 0; i < patternSegments.length; i += 1) {
      const pattern = patternSegments[i]
      if (pattern.startsWith(':')) {
        // Dynamic segment, e.g. ':step' → params.step
        params[pattern.slice(1)] = decodeURIComponent(segments[i])
      } else if (pattern !== segments[i]) {
        matched = false
        break
      }
    }

    if (matched) {
      return { name: route.name, path: route.path, params, meta: route.meta || {} }
    }
  }

  return null
}

/**
 * Create the router instance.
 *
 * @param {{path: string, name: string, meta?: object}[]} routes
 * @param {{fallback?: string}} [options] - `fallback` is the path used when
 *   nothing matches (defaults to the first route's path).
 * @returns {{path: import('vue').Ref<string>, route: import('vue').ComputedRef<object>,
 *            navigate: (to: string, opts?: {replace?: boolean}) => void,
 *            back: () => void, dispose: () => void}}
 */
export function createHashRouter(routes, options = {}) {
  const fallback = options.fallback || routes[0].path

  // Reactive copy of the current path, kept in sync with the URL hash.
  const path = ref(normaliseHash(window.location.hash))

  /** @param {HashChangeEvent} [event] */
  const syncFromHash = () => {
    path.value = normaliseHash(window.location.hash)
  }

  window.addEventListener('hashchange', syncFromHash)

  // The resolved route: falls back to the fallback route for unknown paths.
  const route = computed(
    () => matchRoute(routes, path.value) || matchRoute(routes, fallback) || routes[0],
  )

  /**
   * Navigate to a path. Uses `location.hash` so the browser back button works
   * and so the URL is shareable/bookmarkable even as a local file.
   *
   * @param {string} to
   * @param {{replace?: boolean}} [opts] - `replace: true` avoids adding a
   *   history entry (used for redirects/guards).
   */
  const navigate = (to, opts = {}) => {
    const target = normaliseHash(to)
    if (opts.replace) {
      window.history.replaceState(null, '', `#${target}`)
      path.value = target
    } else if (target === path.value) {
      // Same route: no event fires, but listeners may still want to know.
      syncFromHash()
    } else {
      window.location.hash = target
    }
  }

  /** Go back in history (used by the flow's back button when sensible). */
  const back = () => {
    window.history.back()
  }

  /** Remove the listener (used when tearing the app down in tests). */
  const dispose = () => {
    window.removeEventListener('hashchange', syncFromHash)
  }

  return { path, route, navigate, back, dispose }
}
