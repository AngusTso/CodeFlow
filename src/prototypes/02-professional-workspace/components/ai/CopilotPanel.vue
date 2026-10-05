<script setup>
/**
 * CopilotPanel.vue — brief section 10 (the AI Copilot) and section 15.
 * ---------------------------------------------------------------------------
 * The rule this panel exists to demonstrate: "AI assists; humans direct."
 *
 * The loop is always the same three visible steps —
 *
 *   1. INSTRUCT  a plain-language instruction, pre-filled from whatever action
 *                the user just clicked.
 *   2. REVIEW    a proposal: a one-line summary, the list of things that would
 *                change, and a table of the exact values involved. While the
 *                summary streams in, the panel says it is writing — it never
 *                claims to show a model's internal reasoning (section 11).
 *   3. DECIDE    Apply (one undoable change, badge becomes "Human Edited"),
 *                Edit the instruction, or Reject. Nothing is applied until a
 *                person says so.
 *
 * Escape is handled globally in App.vue, so this panel does not add a second
 * key handler for it.
 */

import { computed, nextTick, ref, watch } from 'vue'
import { useStore } from '../../composables.js'
import { LIGHTING, MOODS, STYLES, labelOf } from '../../../../shared/data/mockData.js'
import Btn from '../ui/Btn.vue'
import Icon from '../ui/Icon.vue'

const store = useStore()

const copilot = computed(() => store.state.copilot)
const open = computed(() => copilot.value.open)
const proposal = computed(() => copilot.value.proposal)
const thinking = computed(() => copilot.value.thinking)
const streaming = computed(() => copilot.value.streaming)
const streamText = computed(() => copilot.value.streamText)

/** The scene a proposal would be applied to, if there is one. */
const target = computed(() => store.selectedScene.value || store.previewScene.value)
const targetTitle = computed(() => target.value?.title || 'this scene')

/** Local draft, so the instruction can be edited before it is submitted. */
const draft = ref('')
const input = ref(null)

// Pre-fill from the store whenever the panel opens or a new instruction is
// pushed in from the Inspector or the action bar.
watch([open, () => copilot.value.instruction], ([isOpen, instruction]) => {
  if (!isOpen) return
  if (instruction) draft.value = instruction
  nextTick(() => input.value?.focus())
})

/** Friendly names for the patch keys a proposal can carry. */
const PATCH_LABELS = {
  prompt: 'Prompt',
  lens: 'Lens',
  camera: 'Camera',
  movement: 'Camera movement',
  framing: 'Framing',
  lighting: 'Lighting',
  lightingIntensity: 'Lighting intensity',
  lightingContrast: 'Lighting contrast',
  mood: 'Mood',
  style: 'Look',
  duration: 'Duration',
  transition: 'Transition',
  role: 'Marketing role',
}

/** Render a patch value in the same vocabulary the Inspector uses. */
function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return '—'
  if (key === 'mood') return labelOf(MOODS, value)
  if (key === 'style') return labelOf(STYLES, value)
  if (key === 'lighting') return labelOf(LIGHTING, value)
  if (key === 'lightingIntensity') return `${value}%`
  if (key === 'duration') return `${value} seconds`
  return String(value)
}

/** A readable row per changed value — the "what exactly changes" table. */
const patchRows = computed(() => {
  const patch = proposal.value?.patch || {}
  return Object.entries(patch)
    .filter(([key]) => key !== 'gradient' && key !== 'alt')
    .map(([key, value]) => ({ key, label: PATCH_LABELS[key] || key, value: formatValue(key, value) }))
})

/** Submit the instruction for review. */
function submit() {
  const text = draft.value.trim()
  if (!text || thinking.value || !target.value) return
  store.submitCopilotInstruction(text)
}

/** Apply the reviewed proposal, then close so the change is visible. */
function apply() {
  store.applyProposal()
  store.closeCopilot()
}

/** Reject the proposal and return to the instruction, keeping the text. */
function edit() {
  store.editInstruction()
  nextTick(() => input.value?.focus())
}
</script>

<template>
  <Transition name="pro-panel">
    <aside
      v-if="open"
      class="fixed bottom-28 right-4 z-40 flex max-h-[min(32rem,62vh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
      role="dialog"
      aria-label="AI Copilot"
      aria-modal="false"
    >
      <!-- ============================ Header ============================ -->
      <header class="flex items-center gap-2 border-b border-line px-3 py-2">
        <Icon name="spark" :size="15" class="text-accent" aria-hidden="true" />
        <p class="flex-1 text-[13px] font-semibold text-ink">AI Copilot</p>
        <button
          type="button"
          class="grid size-7 place-items-center rounded text-ink2 hover:bg-elevated hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Close the Copilot"
          @click="store.closeCopilot()"
        >
          <Icon name="close" :size="15" />
        </button>
      </header>

      <div class="min-h-0 flex-1 space-y-3 overflow-y-auto scroll p-3">
        <p v-if="target" class="text-[11px] text-ink3">
          Proposals apply to <span class="text-ink2">{{ targetTitle }}</span>. Nothing changes until
          you approve it.
        </p>
        <p v-else class="rounded border border-dashed border-line p-2 text-[11px] text-ink3">
          Select a scene first — the Copilot works on the current selection.
        </p>

        <!-- ======================= 1. Instruct ======================= -->
        <label class="block">
          <span class="eyebrow mb-1 block">Instruction</span>
          <textarea
            ref="input"
            v-model="draft"
            rows="3"
            class="field resize-y leading-relaxed"
            placeholder="e.g. Make this feel more cinematic"
            :disabled="thinking"
            @keydown.enter.exact.prevent="submit"
          />
        </label>
        <p class="text-[10px] text-ink3">Enter submits · Shift + Enter adds a line.</p>

        <div class="flex flex-wrap gap-2">
          <Btn
            size="sm"
            variant="primary"
            icon="send"
            :disabled="!draft.trim() || thinking || !target"
            @click="submit"
          >
            Review proposal
          </Btn>
          <Btn v-if="streaming" size="sm" variant="quiet" @click="store.cancelStream()">
            Stop writing
          </Btn>
        </div>

        <!-- ======================== 2. Review ======================== -->
        <div
          v-if="thinking"
          class="flex items-center gap-2 text-[12px] text-ink2"
          role="status"
          aria-live="polite"
        >
          <span
            class="size-3.5 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent"
            aria-hidden="true"
          />
          Considering your instruction…
        </div>

        <template v-if="proposal">
          <div class="rounded-lg border border-line bg-raised p-2.5">
            <p class="eyebrow mb-1">Proposal</p>
            <p class="text-[12px] leading-relaxed text-ink2" aria-live="polite">
              {{ streamText }}<span v-if="streaming" class="animate-pro-pulse" aria-hidden="true">▌</span>
            </p>
          </div>

          <div v-if="proposal.changes && proposal.changes.length">
            <p class="eyebrow mb-1">Would change</p>
            <ul class="flex flex-wrap gap-1">
              <li
                v-for="change in proposal.changes"
                :key="change"
                class="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-ink2"
              >
                {{ change }}
              </li>
            </ul>
          </div>

          <div v-if="patchRows.length">
            <p class="eyebrow mb-1">Exact values</p>
            <dl class="overflow-hidden rounded border border-line">
              <div
                v-for="row in patchRows"
                :key="row.key"
                class="flex items-baseline gap-2 border-b border-line px-2 py-1.5 last:border-b-0"
              >
                <dt class="w-28 shrink-0 truncate text-[11px] text-ink3">{{ row.label }}</dt>
                <dd class="min-w-0 flex-1 text-[11px] break-words text-ink">{{ row.value }}</dd>
              </div>
            </dl>
          </div>

          <!-- ======================= 3. Decide ======================= -->
          <div class="flex flex-wrap gap-2">
            <Btn size="sm" variant="primary" icon="check" @click="apply">Apply changes</Btn>
            <Btn size="sm" variant="ghost" icon="sliders" @click="edit">Edit instruction</Btn>
            <Btn size="sm" variant="quiet" @click="store.rejectProposal()">Reject</Btn>
          </div>
          <p class="text-[10px] text-ink3">
            Applying is a single undo step and marks the scene ✎ Human Edited.
          </p>
        </template>
      </div>
    </aside>
  </Transition>
</template>

