<script setup>
/**
 * AppBottomSheet.vue — the editing surface for Prototype 01 (AGENTS.md
 * "BottomSheet"; DESIGN_PROTOTYPE1 §5).
 * ---------------------------------------------------------------------------
 * WHY A BOTTOM SHEET?
 *   On a phone, a panel that rises from the bottom sits within thumb reach and
 *   keeps the context (the scene you tapped) visible behind it. On larger
 *   screens the same component centres itself as a modal — one component, two
 *   presentations, consistent behaviour.
 *
 * ACCESSIBILITY
 *   All of the tricky parts (focus trap, Escape, scroll lock, focus restore)
 *   come from `useDialog`. Here we only add the visuals and the semantics:
 *   `role="dialog"`, `aria-modal="true"`, and a labelled header.
 */

import { toRef } from 'vue'
import { useDialog } from '../../useDialog.js'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  /** Whether the sheet is visible (use with `v-model:open`). */
  open: { type: Boolean, default: false },
  /** Accessible name for the dialog; also rendered as the visible heading. */
  title: { type: String, default: '' },
  /** Optional short description under the title. */
  description: { type: String, default: '' },
  /** Tailwind max-width class controlling the desktop presentation. */
  size: { type: String, default: 'sm:max-w-lg' },
})

const emit = defineEmits(['close'])

// `useDialog` needs a ref; the prop is read-only, so wrap it with toRef.
const { panel } = useDialog(toRef(props, 'open'), { onClose: () => emit('close') })
</script>

<template>
  <!-- Teleport keeps the sheet above every stacking context in the app. -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="props.open"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      >
        <!-- Backdrop: clicking it closes the sheet (a familiar affordance).
             aria-hidden because it carries no information. -->
        <div class="absolute inset-0 bg-ink/45" aria-hidden="true" @click="emit('close')" />

        <Transition name="sheet" appear>
          <div
            ref="panel"
            role="dialog"
            aria-modal="true"
            :aria-label="props.title || 'Editor'"
            tabindex="-1"
            class="relative flex max-h-[88vh] w-full flex-col rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl"
            :class="props.size"
          >
            <!-- Grab handle: a visual affordance hinting "this can be dismissed".
                 It is decorative; the close button below is the real control. -->
            <div class="mx-auto mt-3 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden="true" />

            <header class="flex items-start gap-3 px-5 pb-3 pt-4">
              <div class="min-w-0 flex-1">
                <h2 class="truncate text-base font-semibold text-ink">{{ props.title }}</h2>
                <p v-if="props.description" class="mt-0.5 text-sm text-muted">
                  {{ props.description }}
                </p>
              </div>

              <button
                type="button"
                class="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink"
                aria-label="Close panel"
                @click="emit('close')"
              >
                <AppIcon name="close" :size="20" />
              </button>
            </header>

            <!-- Scrollable body: the sheet itself never grows past 88vh. -->
            <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              <slot />
            </div>

            <!-- Persistent action area (Regenerate / Delete / Done, etc.). -->
            <footer
              v-if="$slots.actions"
              class="pb-safe flex flex-wrap items-center gap-2 border-t border-line bg-surface px-5 py-3"
            >
              <slot name="actions" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
