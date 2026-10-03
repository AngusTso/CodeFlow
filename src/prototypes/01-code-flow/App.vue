<script setup>
/**
 * App.vue — the root component of Prototype 01.
 * ---------------------------------------------------------------------------
 * It chooses between the app's two top-level "chromes":
 *
 *   1. AppShell  → Home / Projects / Profile, with the global navigation.
 *   2. FlowShell → the guided creation workflow (Idea → … → Video), which has
 *                  its own contextual progress navigation instead.
 *
 * This mirrors DESIGN_PROTOTYPE1 §2: global navigation and the creation flow
 * are separate layers, and entering creation mode makes the flow primary.
 *
 * ROUTING
 *   The hash route is the source of truth for which screen is shown. The two
 *   watchers below keep the URL and `store.state.currentStep` consistent:
 *     • URL → store : handles deep links, back/forward, and guards locked steps.
 *     • store → URL : when an action (e.g. generateStoryboard) advances the
 *                     step, the address bar follows so history stays correct.
 */

import { computed, watch } from 'vue'
import { useRouter, useStore } from './composables.js'
import AppShell from './components/layout/AppShell.vue'
import FlowShell from './components/layout/FlowShell.vue'
import HomeView from './views/HomeView.vue'
import ProjectsView from './views/ProjectsView.vue'
import ProfileView from './views/ProfileView.vue'

const router = useRouter()
const store = useStore()

/** Current resolved route (name + params). */
const route = computed(() => router.route.value)

/** True when the guided creation flow is active. */
const isFlow = computed(() => route.value.name === 'flow')

/** Route name → view component, for the global screens. */
const GLOBAL_VIEWS = {
  home: HomeView,
  projects: ProjectsView,
  profile: ProfileView,
}
const globalView = computed(() => GLOBAL_VIEWS[route.value.name] || HomeView)

/* ---------------------------------------------------------------------- */
/* URL → store                                                            */
/* ---------------------------------------------------------------------- */
watch(
  route,
  (current) => {
    if (current.name !== 'flow') return

    const step = current.params.step

    if (store.canVisit(step)) {
      store.state.currentStep = step
    } else {
      // Guard: the user deep-linked (or edited the URL) into a step that has
      // not been unlocked yet. Send them to where they actually are.
      router.navigate(`/flow/${store.state.currentStep}`, { replace: true })
    }
  },
  { immediate: true }, // run once on first render so deep links work
)

/* ---------------------------------------------------------------------- */
/* store → URL                                                            */
/* ---------------------------------------------------------------------- */
watch(
  () => store.state.currentStep,
  (step) => {
    if (route.value.name !== 'flow') return
    if (route.value.params.step !== step) {
      // `replace` avoids stacking a history entry for each generation step.
      router.navigate(`/flow/${step}`, { replace: true })
    }
  },
)

/* ---------------------------------------------------------------------- */
/* Scroll to top whenever the screen changes (expected mobile behaviour).  */
/* ---------------------------------------------------------------------- */
watch(
  () => `${route.value.name}:${route.value.params.step || ''}`,
  () => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  },
)
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <!-- `<Transition mode="out-in">` fades between the two chromes so entering
         or leaving the creation flow reads as a change of context, not a jump.
         The animation is disabled automatically under reduced motion. -->
    <Transition name="fade-page" mode="out-in">
      <FlowShell v-if="isFlow" key="flow" />
      <AppShell v-else :key="`shell-${route.name}`">
        <Transition name="fade-page" mode="out-in">
          <component :is="globalView" :key="route.name" />
        </Transition>
      </AppShell>
    </Transition>
  </div>
</template>
