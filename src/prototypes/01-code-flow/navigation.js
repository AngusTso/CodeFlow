/**
 * 01-code-flow/navigation.js — the global navigation model.
 * ---------------------------------------------------------------------------
 * DESIGN_PROTOTYPE1 §2 defines TWO navigation layers:
 *   1. GLOBAL navigation  → Home, Projects, Create, Profile  (this file)
 *   2. CONTEXTUAL creation flow → Idea → Storyboard → Scenes → Character → Video
 *
 * This file describes layer 1 in one place, so the mobile bottom bar and the
 * desktop side rail stay perfectly in sync (they render the same data).
 */

/**
 * @typedef {object} NavItem
 * @property {string} id          Stable id (also used as a Vue key).
 * @property {string} label       Visible text.
 * @property {string} path        Hash route to navigate to.
 * @property {string} icon        AppIcon name.
 * @property {string} description Longer description for the desktop rail.
 */

/**
 * The four global destinations.
 *
 * NOTE: "Create" points at `/flow/idea`. Tapping it opens the guided creation
 * flow at its first step, which is itself the "start creating" chooser
 * (template vs. describe your idea) — see DESIGN_PROTOTYPE1 §1.
 *
 * @type {NavItem[]}
 */
export const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: 'home',
    description: 'Your dashboard and recent work',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: 'projects',
    description: 'Browse and reopen saved videos',
  },
  {
    id: 'create',
    label: 'Create',
    path: '/flow/idea',
    icon: 'create',
    description: 'Start a new video with AI',
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: 'profile',
    description: 'Your account and preferences',
  },
]

/**
 * Decide whether a nav item is the active one for the current route.
 *
 * @param {NavItem} item
 * @param {{name: string, params: Record<string,string>}} route
 * @returns {boolean}
 */
export function isNavItemActive(item, route) {
  if (item.path === '/') return route.name === 'home'
  if (item.id === 'create') return route.name === 'flow'
  return item.path === `/${route.name}`
}
