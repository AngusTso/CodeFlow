<script setup>
/**
 * NodeActionPanel.vue — the actions for the selected possibility (s. 25).
 * ---------------------------------------------------------------------------
 * THE BUTTON-EQUIVALENT LAYER (brief section 46).
 *
 * Everything the Creative Universe can do to a node is reachable from here, in
 * order of importance (brief section 80):
 *
 *   PRIMARY    GENERATE 3 ALTERNATIVES · COMBINE
 *   SECONDARY  BRANCH · INSPECT IN LAB · STABILISE
 *   TERTIARY   CENTER HERE · DELETE
 *
 * That grouping is not decoration: it stops a dozen equally-weighted terminal
 * buttons from competing with the two actions that actually create something.
 *
 * COMBINE IS EXPLAINED, NOT SILENTLY DISABLED (brief section 63)
 * With fewer than two nodes selected, the button carries a `title` saying
 * exactly what is missing. A user who cannot combine right now is told why,
 * rather than meeting a dead control.
 */
import { computed } from 'vue'
import { useRouter, useStore } from '../../composables.js'
import {
  PRIMARY_NODE_ACTIONS,
  SECONDARY_NODE_ACTIONS,
  TERTIARY_NODE_ACTIONS,
} from '../../navigation.js'
import SigButton from '../ui/SigButton.vue'

const store = useStore()
const router = useRouter()

const active = computed(() => store.activeNode.value)
const selection = computed(() => store.selectedNodes.value)
const busy = computed(() => store.state.ai.busy)

/** Two or more nodes are required to combine (brief section 17). */
const canCombine = computed(() => selection.value.length >= 2)

/** Human explanation for the combine button's disabled state. */
const combineHint = computed(() => {
  if (canCombine.value) return `Combine ${selection.value.length} selected possibilities`
  const count = selection.value.length
  if (count === 0) return 'Select at least two possibilities to combine them'
  return 'Select one more possibility to combine them'
})

/** True once a concept has been stabilised - enables the video hand-off. */
const hasConcept = computed(() => Boolean(store.state.concept))
</script>

<template>
  <aside class="nap" aria-labelledby="nap-title">
    <!-- ===================== Empty state (s. 62) ===================== -->
    <template v-if="!active">
      <p class="eyebrow">NO POSSIBILITY SELECTED</p>
      <p class="nap__hint">
        Select a node in the universe to explore it, combine it with another, or
        branch it in a new direction.
      </p>
    </template>

    <template v-else>
      <!-- ===================== The inspected node ===================== -->
      <header class="nap__head">
        <p class="eyebrow">{{ active.createdFrom.toUpperCase() }}</p>
        <h2 id="nap-title" class="nap__title">{{ active.title }}</h2>
        <p class="nap__desc">{{ active.description }}</p>

        <p class="nap__meta">
          <span>DEPTH {{ String(active.depth).padStart(2, '0') }}</span>
          <span>{{ active.children.length }} BRANCHES</span>
          <span v-if="active.recommended" class="nap__rec">AI RECOMMENDED</span>
        </p>
      </header>

      <!-- Why the AI recommended it (brief section 23). -->
      <p v-if="active.recommended && active.reason" class="nap__reason">
        <strong>WHY:</strong> {{ active.reason }}
      </p>

      <!-- Multi-select summary, so the combine target is always visible. -->
      <p class="nap__selcount">
        <span class="tnum">{{ selection.length }}</span>
        SELECTED<span v-if="selection.length > 1"> — ready to combine</span>
      </p>

      <!-- ===================== PRIMARY ===================== -->
      <div class="nap__group">
        <p class="nap__grouplabel">PRIMARY</p>
        <SigButton
          v-for="action in PRIMARY_NODE_ACTIONS"
          :key="action.id"
          :tone="action.id === 'combine' ? 'primary' : 'secondary'"
          block
          :icon="action.id === 'combine' ? 'merge' : 'spark'"
          :disabled="busy || (action.id === 'combine' && !canCombine)"
          :title="action.id === 'combine' ? combineHint : ''"
          @click="action.id === 'combine' ? store.openSynthesis() : store.openAlternatives(active.id)"
        >
          {{ action.label }}
        </SigButton>
        <p v-if="!canCombine" class="nap__why">{{ combineHint }}</p>
      </div>

      <!-- ===================== SECONDARY ===================== -->
      <div class="nap__group">
        <p class="nap__grouplabel">SECONDARY</p>
        <SigButton
          v-for="action in SECONDARY_NODE_ACTIONS"
          :key="action.id"
          tone="secondary"
          block
          :icon="action.id"
          :disabled="busy"
          @click="
            action.id === 'branch'
              ? store.createBranches(active.id)
              : action.id === 'lab'
                ? router.navigate('/lab')
                : store.stabilize(active.id)
          "
        >
          {{ action.label }}
        </SigButton>
      </div>

      <!-- ===================== Stabilised -> video (s. 29) ===================== -->
      <div v-if="hasConcept" class="nap__group nap__group--video">
        <p class="nap__grouplabel">CONCEPT STABILIZED</p>
        <p class="nap__concept">{{ store.state.concept.title }}</p>
        <SigButton
          tone="primary"
          block
          icon="film"
          :disabled="busy"
          @click="store.turnIntoVideo().then(() => router.navigate('/export'))"
        >
          TURN INTO VIDEO
        </SigButton>
      </div>

      <!-- ===================== TERTIARY ===================== -->
      <div class="nap__group">
        <p class="nap__grouplabel">TERTIARY</p>
        <SigButton
          v-for="action in TERTIARY_NODE_ACTIONS"
          :key="action.id"
          :tone="action.id === 'delete' ? 'danger' : 'ghost'"
          block
          :icon="action.id === 'focus' ? 'target' : 'trash'"
          :disabled="busy"
          :title="action.id === 'delete' ? `Delete ${active.title} and everything beneath it` : ''"
          @click="action.id === 'delete' ? store.removeNode(active.id) : store.centerOn(active.id)"
        >
          {{ action.label }}
        </SigButton>
      </div>
    </template>
  </aside>
</template>

<style scoped>
/* ==========================================================================
   Node action panel
   --------------------------------------------------------------------------
   Floats beside the universe rather than boxing it in. Group labels are the
   hierarchy made visible (brief section 80).
   ========================================================================== */
.nap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
}

.nap__hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-ink2);
}

/* ---- Header -------------------------------------------------------------- */
.nap__head {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--color-line);
}

.nap__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-ink);
}

.nap__desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-ink2);
}

.nap__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.2rem 0 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-ink3);
}

/* Recommendation reads as a word, not only a colour (brief section 44). */
.nap__rec {
  padding: 1px 5px;
  border: 1px solid var(--color-solar);
  color: var(--color-solar);
}

.nap__reason {
  margin: 0;
  padding: 0.6rem 0.7rem;
  background: color-mix(in srgb, var(--color-solar) 8%, transparent);
  border-left: 2px solid var(--color-solar);
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-ink2);
}

.nap__reason strong {
  color: var(--color-solar);
}

.nap__selcount {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--color-cyan);
}

/* ---- Groups -------------------------------------------------------------- */
.nap__group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nap__group--video {
  padding: 0.75rem;
  background: color-mix(in srgb, var(--color-green) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-green) 40%, transparent);
}

.nap__grouplabel {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--color-ink3);
}

.nap__concept {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-green);
}

/* Explains a disabled action instead of leaving a dead button. */
.nap__why {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.5;
  color: var(--color-ink3);
}
</style>