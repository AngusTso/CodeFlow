<script setup>
/**
 * CreationProgress.vue — the 5-step creation progress indicator.
 * ---------------------------------------------------------------------------
 * Two jobs at once:
 *   1. SHOW progress — where am I in Idea → Storyboard → Scenes → Character →
 *      Video? (DESIGN_PROTOTYPE1 §3 "guided" stage.)
 *   2. OFFER navigation — once a step is finished it becomes clickable, which
 *      is the "progressive freedom" half of the same design decision.
 *
 * ACCESSIBILITY
 *   Rendered as an ordered list inside a labelled <nav>. The active step is
 *   marked with `aria-current="step"`; finished steps are described in words
 *   ("completed") rather than relying on colour alone (WCAG 1.4.1).
 */

import { computed } from 'vue'
import { FLOW_STEPS } from '../../../../shared/store/creationStore.js'
import { useStore } from '../../composables.js'
import AppIcon from '../ui/AppIcon.vue'

const store = useStore()
const currentIndex = computed(() => store.currentStepIndex.value)

/**
 * Describe a step's state for both styling and assistive tech.
 * @param {number} index
 * @returns {'done' | 'current' | 'available' | 'locked'}
 */
function stateFor(index) {
  if (index < currentIndex.value) return 'done'
  if (index === currentIndex.value) return 'current'
  return store.canVisit(FLOW_STEPS[index].id) ? 'available' : 'locked'
}

/** Only finished/unlocked steps may be jumped to. */
function visit(stepId) {
  store.goToStep(stepId)
}
</script>

<template>
  <nav aria-label="Creation progress">
    <ol class="flex items-center gap-1">
      <li v-for="(step, index) in FLOW_STEPS" :key="step.id" class="flex min-w-0 flex-1 items-center">
        <!-- Each step is a button only when it can actually be visited, so we
             never present a control that does nothing. -->
        <component
          :is="store.canVisit(step.id) ? 'button' : 'div'"
          :type="store.canVisit(step.id) ? 'button' : undefined"
          class="group flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl px-1 py-1 text-center"
          :class="store.canVisit(step.id) ? 'cursor-pointer' : 'cursor-default'"
          :aria-current="stateFor(index) === 'current' ? 'step' : undefined
          "
          :aria-label="
            `Step ${index + 1} of ${FLOW_STEPS.length}: ${step.label}` +
            (stateFor(index) === 'done'
              ? ' (completed)'
              : stateFor(index) === 'locked'
                ? ' (locked)'
                : '')
          "
          @click="visit(step.id)"
        >
          <!-- Marker: number, or a tick once the step is finished. -->
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors"
            :class="{
              'border-brand bg-brand text-white': stateFor(index) === 'current',
              'border-brand bg-brand-soft text-brand': stateFor(index) === 'done',
              'border-line bg-surface text-muted': stateFor(index) === 'available',
              'border-line bg-canvas text-muted/50': stateFor(index) === 'locked',
            }"
            aria-hidden="true"
          >
            <AppIcon v-if="stateFor(index) === 'done'" name="check" :size="14" />
            <template v-else>{{ index + 1 }}</template>
          </span>

          <!-- Labels are hidden on the narrowest screens (320–374px) where
               five labels cannot fit; the numbers still convey position. -->
          <span
            class="hidden truncate text-[11px] leading-tight sm:block"
            :class="stateFor(index) === 'locked' ? 'text-muted/60' : 'text-muted'"
          >
            {{ step.label }}
          </span>
        </component>

        <!-- Connector between markers (decorative). -->
        <span
          v-if="index < FLOW_STEPS.length - 1"
          class="mb-4 hidden h-px flex-1 shrink-0 bg-line sm:block"
          :class="{ 'bg-brand': index < currentIndex }"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>
