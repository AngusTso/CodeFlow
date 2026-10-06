<script setup>
/**
 * UniverseView.vue — the Creative Universe screen (brief sections 13, 49, 51).
 * ---------------------------------------------------------------------------
 * The universe gets most of the screen; the action panel floats beside it. The
 * relationship changes by width:
 *
 *   >=1440px  universe | docked 320px panel          (full workspace, s. 49)
 *   >=768px   universe | collapsible slide-over panel (tablet, s. 50)
 *   <768px    universe with a bottom action dock      (fallback, s. 51)
 *
 * On mobile the panel becomes a bottom sheet rather than being hidden, because
 * the brief's mobile priority order is: signal -> possibilities -> branching ->
 * stabilization -> preview. Branching and stabilisation must stay reachable.
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter, useStore } from '../composables.js'
import UniverseCanvas from '../components/universe/UniverseCanvas.vue'
import NodeActionPanel from '../components/universe/NodeActionPanel.vue'
import AiStatus from '../components/ui/AiStatus.vue'
import SigButton from '../components/ui/SigButton.vue'

const store = useStore()
const router = useRouter()

/** Slide-over visibility for the tablet / mobile panel. */
const panelOpen = ref(false)

/** Live media queries, matching the breakpoints declared in theme.css. */
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

const atLeastTablet = useMedia('(min-width: 768px)')
const atLeastDesktop = useMedia('(min-width: 1440px)')

/** Desktop docks the panel; narrower screens slide it over the map. */
const panelDocked = atLeastDesktop
const hasNodes = computed(() => store.state.nodes.length > 0)

/** Close the slide-over after an action so the map is visible again. */
function runAndClose(action) {
  action()
  if (!panelDocked.value) panelOpen.value = false
}
</script>

<template>
  <section class="uv" aria-labelledby="uv-title">
    <!-- ===================== Screen reader heading ===================== -->
    <h1 id="uv-title" class="sr-only">Creative Universe</h1>

    <!-- ===================== Empty state (s. 62) ===================== -->
    <div v-if="!hasNodes" class="uv__empty cs-corners">
      <p class="eyebrow">CREATIVE UNIVERSE EMPTY</p>
      <h2 class="uv__emptytitle">NO SIGNALS DETECTED</h2>
      <p class="uv__emptybody">
        Start with a thought, a voice signal, a sketch, or an image. You don't
        need to know what it becomes yet.
      </p>
      <SigButton
        tone="primary"
        size="lg"
        icon="arrowLeft"
        @click="router.navigate('/signal')"
      >
        INITIALIZE SIGNAL
      </SigButton>
    </div>

    <template v-else>
      <!-- ===================== The map ===================== -->
      <div class="uv__stage">
        <UniverseCanvas class="uv__canvas" />

        <!-- Toggle for the slide-over panel (tablet + mobile). -->
        <SigButton
          v-if="!panelDocked"
          class="uv__paneltoggle"
          tone="primary"
          icon="layers"
          :aria-expanded="panelOpen"
          aria-controls="uv-panel"
          @click="panelOpen = !panelOpen"
        >
          {{ panelOpen ? 'HIDE ACTIONS' : 'ACTIONS' }}
        </SigButton>
      </div>

      <!-- ===================== Action panel ===================== -->
      <!--
        One instance in two positions. The wrapper owns the geometry so
        NodeActionPanel stays purely presentational and needs no prop drilling.
      -->
      <aside
        id="uv-panel"
        class="uv__panel"
        :data-open="panelDocked ? undefined : panelOpen"
        :aria-hidden="!panelDocked && !panelOpen ? 'true' : undefined"
        :inert="!panelDocked && !panelOpen ? true : undefined"
      >
        <NodeActionPanel />
      </aside>

      <div
        v-if="!panelDocked && panelOpen"
        class="uv__scrim"
        aria-hidden="true"
        @click="panelOpen = false"
      />
    </template>

    <!-- Generation feedback floats over the map, never blocking it. -->
    <AiStatus v-if="hasNodes" class="uv__status" compact />
  </section>
</template>

<style scoped>
/* ==========================================================================
   Universe screen
   --------------------------------------------------------------------------
   The map always takes the majority of the space. The panel docks only at the
   desktop breakpoint (brief section 49); below that it slides over the map so
   the universe is never squeezed into an unusable strip (sections 50 and 51).
   ========================================================================== */
.uv {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

/* ---- Map ----------------------------------------------------------------- */
.uv__stage {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.uv__canvas {
  width: 100%;
  height: 100%;
}

.uv__paneltoggle {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 5;
}

/* ---- Panel --------------------------------------------------------------- */
.uv__panel {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 40;
  /* A bottom sheet on narrow screens: reachable with a thumb. */
  max-height: 72vh;
  transform: translateY(100%);
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  border-top: 1px solid var(--color-line);
}

.uv__panel[data-open='true'] {
  transform: translateY(0);
}

.uv__scrim {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgb(3 4 7 / 0.6);
}

/* ---- Status -------------------------------------------------------------- */
.uv__status {
  position: absolute;
  left: 50%;
  bottom: 4.5rem;
  z-index: 6;
  padding: 0.5rem 0.85rem;
  transform: translateX(-50%);
  background: color-mix(in srgb, var(--color-terminal) 94%, transparent);
  border: 1px solid var(--color-line);
}

/* ---- Empty state (s. 62) ------------------------------------------------- */
.uv__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  grid-column: 1 / -1;
  padding: 2rem;
  text-align: center;
}

.uv__emptytitle {
  margin: 0;
  font-size: clamp(1.1rem, 4vw, 1.6rem);
  color: var(--color-ink);
}

.uv__emptybody {
  margin: 0 0 0.5rem;
  max-width: 26rem;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-ink2);
}

/* ---- Tablet: slide-over panel, not a docked sidebar (s. 50) -------------- */
@media (min-width: 768px) {
  .uv__panel {
    inset: 0 0 0 auto;
    width: min(88vw, 22rem);
    max-height: none;
    transform: translateX(100%);
    border-top: none;
    border-left: 1px solid var(--color-line);
  }
  .uv__panel[data-open='true'] {
    transform: translateX(0);
  }
}

/* ---- Desktop: dock the panel (s. 49) -------------------------------------- */
@media (min-width: 1440px) {
  .uv {
    grid-template-columns: minmax(0, 1fr) 320px;
  }
  .uv__panel {
    position: static;
    grid-column: 2;
    width: auto;
    max-height: none;
    transform: none;
    border-left: 1px solid var(--color-line);
  }
  .uv__scrim {
    display: none;
  }
}
</style>