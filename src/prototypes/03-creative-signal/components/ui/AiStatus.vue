<script setup>
/**
 * AiStatus.vue — stage-based AI feedback (brief sections 47 and 61).
 * ---------------------------------------------------------------------------
 * The brief forbids fake percentages ("Generating 73%") unless they represent a
 * real deterministic simulation. This component therefore reports NAMED STAGES
 * - CAPTURING SIGNAL, INTERPRETING SIGNAL, CONNECTING CONCEPTS - and never a
 * number the system cannot actually justify.
 *
 * It also never reveals model internals. There is no "reasoning" transcript
 * here, only what the system is doing and what it produced (brief sections 37,
 * 44 and 82).
 *
 * SCREEN READERS (brief section 47)
 *   The live region announces each stage change politely, so a screen-reader
 *   user hears progress without the visual animation being required. It
 *   announces STAGES, not animation frames.
 */
import { computed } from 'vue'
import { useStore } from '../../composables.js'

const props = defineProps({
  /** Compact single-line form, used inside panels and the modal header. */
  compact: { type: Boolean, default: false },
})

const store = useStore()
const ai = computed(() => store.state.ai)

/** The current stage, or a neutral label when idle. */
const label = computed(() => (ai.value.busy ? ai.value.stage : ''))

/** True on the final stage, which is where the result is genuinely ready. */
const isFinal = computed(() => ai.value.stageIndex === ai.value.stages.length - 1)
</script>

<template>
  <!--
    One polite live region for the whole app. It is always present (rather than
    conditionally rendered) so assistive technology has it registered before the
    first generation starts - a region that does not exist yet is not announced.
  -->
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ ai.busy ? label : '' }}
  </div>

  <div v-if="ai.busy" class="ai-status" :class="{ 'ai-status--compact': props.compact }">
    <!-- Text state first: the glyph reinforces the word, never replaces it. -->
    <p class="ai-status__label">
      <span class="animate-cs-pulse ai-status__dot" aria-hidden="true" />
      <span class="tnum">{{ label }}</span>
      <span v-if="!isFinal" class="ai-status__ellipsis" aria-hidden="true">...</span>
      <span class="sr-only">(simulated generation in progress)</span>
    </p>

    <!-- Stage ticks: a position indicator, not a progress bar. -->
    <ol v-if="!props.compact" class="ai-status__stages">
      <li
        v-for="(stage, index) in ai.stages"
        :key="stage"
        class="ai-status__tick"
        :data-state="index < ai.stageIndex ? 'done' : index === ai.stageIndex ? 'active' : 'pending'"
      >
        <span class="sr-only">
          {{ index < ai.stageIndex ? 'Completed: ' : index === ai.stageIndex ? 'In progress: ' : 'Not started: ' }}{{ stage }}
        </span>
        <span aria-hidden="true">{{ index < ai.stageIndex ? '✓' : index === ai.stageIndex ? '▸' : '·' }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
/* ==========================================================================
   AI status
   --------------------------------------------------------------------------
   Feedback uses MOTION + WORDS, not colour alone (brief section 44): the pulse
   says "working", the label says what is happening.
   ========================================================================== */
.ai-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-status--compact {
  gap: 0;
}

.ai-status__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--color-cyan);
}

.ai-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-cyan);
  box-shadow: 0 0 8px var(--color-cyan);
}

.ai-status__ellipsis {
  color: var(--color-ink3);
}

.ai-status__stages {
  display: flex;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ai-status__tick {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  font-family: var(--font-mono);
  font-size: 11px;
  border: 1px solid var(--color-line);
  color: var(--color-ink3);
}
.ai-status__tick[data-state='done'] {
  color: var(--color-green);
  border-color: color-mix(in srgb, var(--color-green) 40%, transparent);
}
.ai-status__tick[data-state='active'] {
  color: var(--color-cyan);
  border-color: var(--color-cyan);
}
</style>