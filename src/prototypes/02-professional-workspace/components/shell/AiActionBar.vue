<script setup>
/**
 * AiActionBar.vue — brief sections 11 and 18.
 * ---------------------------------------------------------------------------
 * The persistent strip along the bottom of the workspace. It answers, at a
 * glance and without opening anything:
 *
 *   1. WHAT is currently selected  ("AI · Scene")
 *   2. WHAT the AI can do to it    (contextual actions, never a generic menu)
 *   3. WHETHER AI is working       (stage text, live region, skip / cancel)
 *   4. HOW to finish               (undo / redo / export)
 *
 * Section 18 is explicit that the AI must feel context-aware, and section 29
 * forbids "static AI magic buttons that do not produce meaningful UI state
 * changes" — so every action here routes through a real, reviewable outcome.
 * Progress is never a fabricated percentage; it is a named stage.
 */

import { computed } from 'vue'
import { useAiActions, useStore } from '../../composables.js'
import Btn from '../ui/Btn.vue'

const store = useStore()
const { runAction } = useAiActions()

/** Contextual actions for whatever the store says is selected (section 18). */
const actions = computed(() => store.contextActions.value)

const running = computed(() => store.state.ai.running)
const stage = computed(() => store.state.ai.stages[store.state.ai.stageIndex] || '')
const error = computed(() => store.state.ai.error)

const canUndo = computed(() => store.canUndo.value)
const canRedo = computed(() => store.canRedo.value)

/** A plain-language noun for the current selection, so actions read correctly. */
const selectionLabel = computed(() => {
  const kind = store.state.selection.kind
  if (kind === 'character') return 'Character'
  if (kind === 'clip') return 'Track clip'
  if (kind === 'asset') return 'Asset'
  return 'Scene'
})
</script>

<template>
  <footer class="flex items-center gap-3 border-t border-line bg-surface px-4">
    <!-- ================= What is selected ================= -->
    <p class="shrink-0 text-[11px] uppercase tracking-wide text-ink3">
      AI
      <span class="text-ink2" aria-live="polite">{{ selectionLabel }}</span>
    </p>

    <!-- ================= Contextual actions ================= -->
    <!-- Horizontally scrollable rather than wrapped: the bar never grows and
         steals height from the preview, even at 320px. -->
    <div class="min-w-0 flex-1 overflow-x-auto">
      <div class="flex w-max items-center gap-1.5" role="group" :aria-label="`AI actions for the selected ${selectionLabel}`">
        <Btn
          v-for="(action, index) in actions"
          :key="action"
          size="sm"
          :variant="index === 0 ? 'primary' : 'ghost'"
          :disabled="running"
          @click="runAction(action)"
        >
          {{ action }}
        </Btn>
      </div>
    </div>

    <!-- ================= Live generation status ================= -->
    <div
      v-if="running"
      class="flex shrink-0 items-center gap-2"
      role="status"
      aria-live="polite"
    >
      <span
        class="size-3.5 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent"
        aria-hidden="true"
      />
      <p class="hidden max-w-52 truncate text-[12px] text-ink2 sm:block">
        {{ stage || '✨ AI is working…' }}
      </p>
      <Btn size="sm" variant="quiet" title="Jump to the final state" @click="store.skipAI()">Skip</Btn>
      <Btn size="sm" variant="quiet" title="Stop this generation" @click="store.cancelAI()">
        Cancel
      </Btn>
    </div>

    <p v-else-if="error" class="shrink-0 text-[12px] text-danger" role="alert">{{ error }}</p>

    <!-- ================= History + export ================= -->
    <div class="flex shrink-0 items-center gap-1">
      <Btn
        size="sm"
        variant="quiet"
        icon="undo"
        title="Undo the last change"
        :disabled="!canUndo"
        @click="store.undo()"
      >
        <span class="sr-only sm:not-sr-only">Undo</span>
      </Btn>
      <Btn
        size="sm"
        variant="quiet"
        icon="redo"
        title="Redo the last undone change"
        :disabled="!canRedo"
        @click="store.redo()"
      >
        <span class="sr-only sm:not-sr-only">Redo</span>
      </Btn>
      <Btn size="sm" variant="primary" icon="download" @click="store.openExport()">
        Export
      </Btn>
    </div>
  </footer>
</template>
