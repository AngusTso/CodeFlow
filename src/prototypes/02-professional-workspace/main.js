/**
 * main.js — application entry point for Prototype 02 ("Code Flow Pro").
 * ---------------------------------------------------------------------------
 * Mirror of Prototype 01's bootstrap, but the route table is DERIVED from
 * PROJECT_NAV rather than hand-written. That guarantees the hash routes and the
 * left navigation can never drift apart — edit navigation.js and both update.
 *
 * Route table (hash routes so the built file works from `file://`):
 *   #/storyboard  #/scenes  #/assets  #/characters
 *   #/library/media  #/library/styles  #/library/audio
 *
 * Prototype 02 does NOT reuse Prototype 01's store: P01 is a guided wizard, P02
 * is a workspace. It DOES reuse the shared modules (models, mock data, mock AI,
 * hash router, reduced-motion), which is the AGENTS.md "reuse the core" rule.
 */

import { createApp } from 'vue'
import App from './App.vue'
import './theme.css'

import { createHashRouter } from '../../shared/router/hashRouter.js'
import { usePrefersReducedMotion } from '../../shared/a11y/usePrefersReducedMotion.js'
import { createWorkspaceStore } from './workspaceStore.js'
import { PROJECT_NAV } from './navigation.js'
import { REDUCED_MOTION_KEY, ROUTER_KEY, STORE_KEY } from './composables.js'

/** Flat route table generated from the left navigation model. */
const routes = PROJECT_NAV.flatMap((group) =>
  group.items.map((item) => ({ path: item.path, name: item.id })),
)

/** The workspace opens on Storyboard (the brief lives there). */
const defaultPath = PROJECT_NAV[0].items[0].path

// Set the hash BEFORE the router reads it, so the first render has a route and
// there is no flash of "nothing matched".
if (!window.location.hash) {
  window.history.replaceState(null, '', `#${defaultPath}`)
}

const router = createHashRouter(routes, { fallback: defaultPath })
const store = createWorkspaceStore()
const prefersReducedMotion = usePrefersReducedMotion()

const app = createApp(App)
app.provide(ROUTER_KEY, router)
app.provide(STORE_KEY, store)
app.provide(REDUCED_MOTION_KEY, prefersReducedMotion)
app.mount('#app')
