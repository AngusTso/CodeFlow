<script setup>
/**
 * App.vue — the Prototype 02 workspace shell.
 * ---------------------------------------------------------------------------
 * There is only ONE screen in this prototype: the project workspace itself
 * (brief section 4: "The project itself is the workspace"). Sections are
 * hash routes, but they all render inside this same shell.
 *
 * LAYOUT (brief section 3) is expressed as a named CSS grid, documented in the
 * scoped <style> at the bottom of this file:
 *
 *   TOP BAR          56px
 *   NAV | STAGE | INSPECTOR
 *   TIMELINE         auto (260-320px)
 *   AI ACTION BAR    64px
 *
 * RESPONSIVE (brief section 27):
 *   <768px    overlay panels only, reduced timeline  (mobile light)
 *   768-1439  nav docked, inspector collapsible overlay (adaptive)
 *   >=1440    everything docked, full workspace
 */

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion, useRouter, useStore } from './composables.js'
import { sectionFromRoute } from './navigation.js'

import TopBar from './components/shell/TopBar.vue'
import ProjectNav from './components/shell/ProjectNav.vue'
import InspectorPanel from './components/shell/InspectorPanel.vue'
import TimelineDock from './components/shell/TimelineDock.vue'
import AiActionBar from './components/shell/AiActionBar.vue'
import VideoPreview from './components/preview/VideoPreview.vue'
import SectionPanel from './components/sections/SectionPanel.vue'
import CopilotPanel from './components/ai/CopilotPanel.vue'
import ExportPanel from './components/ui/ExportPanel.vue'

const router = useRouter()
const store = useStore()
const reducedMotion = useReducedMotion()

const route = computed(() => router.route.value)

/** Which left-nav section is active (resolves unknown names to storyboard). */
const section = computed(() => sectionFromRoute(route.value?.name))

/* ------------------------------------------------------------------ */
/* Responsive mode                                                      */
/* ------------------------------------------------------------------ */

/** Live media queries so the shell can dock vs. overlay its panels. */
function useMedia(query) {
  const matches = ref(false)
  const mql = window.matchMedia(query)
  const update = (event) => {
    matches.value = event.matches
  }
  matches.value = mql.matches
  mql.addEventListener('change', update)
  onBeforeUnmount(() => mql.removeEventListener('change', update))
  return matches
}

const atLeast768 = useMedia('(min-width: 768px)')
const atLeast1440 = useMedia('(min-width: 1440px)')
const isNarrow = useMedia('(max-width: 767px)')

/** Nav is docked in the grid from 768px up; below that it is a slide-over. */
const navDocked = atLeast768
/** Inspector only occupies a grid column from 1440px up. */
const inspectorDocked = atLeast1440

/** Slide-over visibility (mobile / adaptive only). */
const navOpen = ref(false)
const inspectorOpen = ref(false)

// The store keeps its own `inspector.open` for the desktop toggle; the overlay
// flags are purely local to this shell.
watch(section, () => {
  navOpen.value = false
})

/* ------------------------------------------------------------------ */
/* Global keyboard shortcuts                                           */
/* ------------------------------------------------------------------ */

/** True when the keystroke originated inside a text input. */
function typingTarget(event) {
  const el = event.target
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

function onKeydown(event) {
  const mod = event.ctrlKey || event.metaKey

  // Undo / redo (brief section 17) - never while typing.
  if (mod && !typingTarget(event)) {
    if (event.key.toLowerCase() === 'z' && event.shiftKey) {
      event.preventDefault()
      store.redo()
      return
    }
    if (event.key.toLowerCase() === 'z') {
      event.preventDefault()
      store.undo()
      return
    }
  }

  if (event.key === 'Escape') {
    if (store.state.exportPanel.open) {
      store.closeExport()
      return
    }
    if (store.state.copilot.open) {
      store.closeCopilot()
      return
    }
    navOpen.value = false
    inspectorOpen.value = false
    return
  }

  if (typingTarget(event)) return

  // Space toggles playback (brief section 6).
  if (event.code === 'Space') {
    event.preventDefault()
    store.togglePlay()
    return
  }

  // Left/right nudge the playhead (brief section 6).
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    store.seek(Math.min(store.duration.value, store.state.playback.time + 0.5))
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    store.seek(Math.max(0, store.state.playback.time - 0.5))
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

// Clean up any playing interval / streaming when the app unmounts.
onBeforeUnmount(() => store.dispose())
</script>

<template>
  <div class="ws">
    <!-- Keyboard users jump straight past the navigation. -->
    <a class="skip-link" href="#stage">Skip to workspace</a>

    <!-- ================= TOP BAR (brief section 4) ================= -->
    <TopBar
      class="ws-top"
      :nav-docked="navDocked"
      :inspector-docked="inspectorDocked"
      @open-nav="navOpen = true"
      @open-inspector="inspectorOpen = true"
    />

    <!-- ============ LEFT PROJECT NAVIGATION (section 5) ============ -->
    <!-- One instance, two positions: docked in the grid from 768px, a
         slide-over below it. The wrapper handles the geometry so
         ProjectNav itself stays purely presentational. -->
    <aside
      class="ws-nav"
      :data-open="navDocked ? undefined : navOpen"
      :aria-hidden="!navDocked && !navOpen ? 'true' : undefined"
      :inert="!navDocked && !navOpen ? true : undefined"
    >
      <ProjectNav :section="section" @close="navOpen = false" />
    </aside>

    <div
      v-if="!navDocked && navOpen"
      class="ws-scrim"
      aria-hidden="true"
      @click="navOpen = false"
    />

    <!-- ==================== CENTRE: PREVIEW + SECTION ==================== -->
    <main id="stage" class="ws-stage">
      <!-- The preview is the visual focus of the workspace (brief section 6). -->
      <VideoPreview />
      <!-- Section content: storyboard / scenes / assets / characters / library. -->
      <SectionPanel :section="section" />
    </main>

    <!-- ============== PERSISTENT INSPECTOR (brief section 7) ============== -->
    <aside
      class="ws-inspector"
      :data-open="inspectorDocked ? undefined : inspectorOpen"
      :aria-hidden="!inspectorDocked && !inspectorOpen ? 'true' : undefined"
      :inert="!inspectorDocked && !inspectorOpen ? true : undefined"
    >
      <InspectorPanel @close="inspectorOpen = false" />
    </aside>

    <div
      v-if="!inspectorDocked && inspectorOpen"
      class="ws-scrim"
      aria-hidden="true"
      @click="inspectorOpen = false"
    />

    <!-- ============== TIMELINE + AI ACTION BAR (sections 11/12) ============== -->
    <TimelineDock class="ws-timeline" :reduced="isNarrow" />
    <AiActionBar class="ws-action" />

    <!-- ================ Floating layers ================ -->
    <CopilotPanel />
    <Transition name="pro-panel">
      <ExportPanel v-if="store.state.exportPanel.open" @close="store.closeExport()" />
    </Transition>
  </div>
</template>

<style scoped>
/* ==========================================================================
 * The workspace grid — brief section 3, and the responsive rules from 27.
 *
 *   <768px     single column, nav + inspector as slide-overs (mobile light)
 *   768..1439  nav docked, inspector still a slide-over (adaptive)
 *   >=1440     every pane docked (full professional workspace)
 * ========================================================================== */
.ws {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: 56px minmax(0, 1fr) auto 64px;
  grid-template-areas:
    'top'
    'stage'
    'timeline'
    'action';
  height: 100vh;
  height: 100dvh;
  background: var(--color-canvas);
}

.ws-top {
  grid-area: top;
}
.ws-stage {
  grid-area: stage;
  min-width: 0;
  overflow: auto;
}
.ws-timeline {
  grid-area: timeline;
  min-width: 0;
}
.ws-action {
  grid-area: action;
}

/* ---- Left navigation -------------------------------------------------- */
.ws-nav {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  width: 236px;
  transform: translateX(-100%);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  border-right: 1px solid var(--color-line);
  background: var(--color-surface);
}
.ws-nav[data-open='true'] {
  transform: translateX(0);
}

/* ---- Inspector -------------------------------------------------------- */
.ws-inspector {
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 40;
  width: min(92vw, 340px);
  transform: translateX(100%);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  border-left: 1px solid var(--color-line);
  background: var(--color-surface);
}
.ws-inspector[data-open='true'] {
  transform: translateX(0);
}

/* ---- Shared slide-over scrim ------------------------------------------ */
.ws-scrim {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgb(0 0 0 / 0.5);
}

/* ---- Adaptive: dock the nav from 768px -------------------------------- */
@media (min-width: 768px) {
  .ws {
    grid-template-columns: 236px minmax(0, 1fr);
    grid-template-areas:
      'top top'
      'nav stage'
      'timeline timeline'
      'action action';
  }
  .ws-nav {
    position: static;
    grid-area: nav;
    transform: none;
    width: auto;
    transition: none;
  }
}

/* ---- Full workspace from 1440px --------------------------------------- */
@media (min-width: 1440px) {
  .ws {
    grid-template-columns: 236px minmax(0, 1fr) 340px;
    grid-template-areas:
      'top top top'
      'nav stage inspector'
      'timeline timeline timeline'
      'action action action';
  }
  .ws-inspector {
    position: static;
    grid-area: inspector;
    transform: none;
    width: auto;
    transition: none;
  }
}

/* The scrim never shows once both panels are docked. */
@media (min-width: 1440px) {
  .ws-scrim {
    display: none;
  }
}
</style>

