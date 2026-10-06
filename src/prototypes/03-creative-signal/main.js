/**
 * main.js — application entry point for Prototype 03 ("Creative Signal").
 * ---------------------------------------------------------------------------
 * The route table is DERIVED from navigation.js, so the hash routes and the
 * terminal navigation can never drift apart.
 *
 * Route table (hash routes, so the built file works from `file://`):
 *   #/signal   #/universe   #/lab   #/archive   #/export
 *
 * Prototype 03 reuses the SHARED infrastructure (brief section 74.1): the hash
 * router, the reduced-motion helper, the shared domain models, the shared mock
 * AI for the video phase, and the shared deterministic PRNG. It deliberately
 * does NOT reuse Prototype 01's creation store or Prototype 02's workspace
 * store - the exploration model is its own (brief section 74.2).
 */

import { createApp } from 'vue'
import App from './App.vue'
import './theme.css'

import { createHashRouter } from '../../shared/router/hashRouter.js'
import { usePrefersReducedMotion } from '../../shared/a11y/usePrefersReducedMotion.js'
import { createUniverseStore } from './universeStore.js'
import { DEFAULT_PATH, ROUTES, STORYBOARD_ROUTE } from './navigation.js'
import { REDUCED_MOTION_KEY, ROUTER_KEY, STORE_KEY } from './composables.js'

// Set the hash BEFORE the router reads it, so the first render has a route and
// there is no flash of "nothing matched".
if (!window.location.hash) {
  window.history.replaceState(null, '', `#${DEFAULT_PATH}`)
}

const router = createHashRouter([...ROUTES, { path: STORYBOARD_ROUTE.path, name: STORYBOARD_ROUTE.id }], { fallback: DEFAULT_PATH })
const store = createUniverseStore()
const prefersReducedMotion = usePrefersReducedMotion()

const app = createApp(App)
app.provide(ROUTER_KEY, router)
app.provide(STORE_KEY, store)
app.provide(REDUCED_MOTION_KEY, prefersReducedMotion)
app.mount('#app')