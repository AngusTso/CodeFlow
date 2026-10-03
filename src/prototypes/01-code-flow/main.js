/**
 * main.js — application entry point for Prototype 01 ("Code Flow").
 * ---------------------------------------------------------------------------
 * Responsibility: create the router + store, make them available via
 * provide/inject, and mount the root component. Everything else lives in
 * components and the shared modules.
 *
 * Route table (hash routes, so the built file works from `file://`):
 *   #/                 → Home
 *   #/projects         → Projects
 *   #/profile          → Profile
 *   #/flow/:step       → the guided creation workflow (idea → storyboard →
 *                        scenes → character → video)
 *
 * NOTE: there is no separate "#/create" screen. The "Create" tab in the bottom
 * navigation jumps straight into #/flow/idea, because the first step of the
 * flow IS the "start creating" chooser (template vs. describe-your-idea).
 */

import { createApp } from 'vue'
import App from './App.vue'
import './theme.css'

import { createHashRouter } from '../../shared/router/hashRouter.js'
import { createCreationStore } from '../../shared/store/creationStore.js'
import { usePrefersReducedMotion } from '../../shared/a11y/usePrefersReducedMotion.js'
import { REDUCED_MOTION_KEY, ROUTER_KEY, STORE_KEY } from './composables.js'

/** The application's route table. */
const routes = [
  { path: '/', name: 'home' },
  { path: '/projects', name: 'projects' },
  { path: '/profile', name: 'profile' },
  { path: '/flow/:step', name: 'flow' },
]

// Create the shared singletons for this app instance.
const router = createHashRouter(routes, { fallback: '/' })
const store = createCreationStore()
const prefersReducedMotion = usePrefersReducedMotion()

// If the page is loaded without a hash, normalise it so the first render
// already has a route (avoids a flash of "nothing matched").
if (!window.location.hash) {
  window.history.replaceState(null, '', '#/')
}

const app = createApp(App)

// Provide the shared dependencies to every component in the tree.
app.provide(ROUTER_KEY, router)
app.provide(STORE_KEY, store)
app.provide(REDUCED_MOTION_KEY, prefersReducedMotion)

app.mount('#app')
