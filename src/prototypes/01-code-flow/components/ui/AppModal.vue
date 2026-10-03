<script setup>
/**
 * AppModal.vue — a small confirmation dialog (AGENTS.md "Modal").
 * ---------------------------------------------------------------------------
 * Used for destructive or irreversible actions, where an inline button is not
 * enough — e.g. "Delete this scene?".
 *
 * It shares all of its accessibility behaviour with <AppBottomSheet> through
 * `useDialog` (focus trap, Escape, scroll lock, focus restore), and uses
 * `role="alertdialog"` because it interrupts the user to confirm something.
 */

import { toRef } from 'vue'
import { useDialog } from '../../useDialog.js'
import AppButton from './AppButton.vue'

const props = defineProps({
  /** Whether the dialog is visible. */
  open: { type: Boolean, default: false },
  /** Short question, e.g. "Delete Scene 2?". */
  title: { type: String, default: 'Are you sure?' },
  /** Optional explanation of the consequence. */
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  /** 'danger' renders the confirm action with destructive styling. */
  tone: { type: String, default: 'primary' }, // primary | danger
})

const emit = defineEmits(['confirm', 'cancel'])

// Escape / backdrop click both cancel — never confirm (safer default).
const { panel } = useDialog(toRef(props, 'open'), { onClose: () => emit('cancel') })
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="props.open" class="fixed inset-0 z-[60] grid place-items-center p-4">
        <div class="absolute inset-0 bg-ink/45" aria-hidden="true" @click="emit('cancel')" />

        <Transition name="pop" appear>
          <div
            ref="panel"
            role="alertdialog"
            aria-modal="true"
            :aria-label="props.title"
            tabindex="-1"
            class="relative w-full max-w-sm rounded-3xl bg-surface p-5 shadow-2xl"
          >
            <h2 class="text-base font-semibold text-ink">{{ props.title }}</h2>
            <p v-if="props.message" class="mt-1.5 text-sm text-muted">{{ props.message }}</p>

            <div class="mt-5 flex justify-end gap-2">
              <AppButton variant="secondary" @click="emit('cancel')">
                {{ props.cancelLabel }}
              </AppButton>
              <AppButton
                :variant="props.tone === 'danger' ? 'danger' : 'primary'"
                @click="emit('confirm')"
              >
                {{ props.confirmLabel }}
              </AppButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
