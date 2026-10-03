<script setup>
/**
 * GenerationState.vue — the shared AI feedback surface.
 * ---------------------------------------------------------------------------
 * DESIGN_PROTOTYPE1 §7 ("playful magical feedback"): while the simulated AI
 * works we show a spinner-ish breathing sparkle and ONE friendly sentence —
 * never technical progress like "diffusion inference".
 *
 * It lives in the shared UI layer because every step and every prototype needs
 * identical feedback semantics; only the styling changes per prototype.
 *
 * ACCESSIBILITY
 *   • The overlay is a `role="status"` with `aria-live="polite"`, so the
 *     message is announced without interrupting the user.
 *   • The decorative sparkle is `aria-hidden`.
 *   • The overlay is not focusable and does not trap focus, but the underlying
 *     actions are disabled by the store's `isGenerating` flag, so nothing
 *     conflicting can be triggered meanwhile.
 */

import { computed } from 'vue'
import { useStore } from '../../composables.js'
import AppIcon from './AppIcon.vue'

const store = useStore()

const isGenerating = computed(() => store.state.isGenerating)
const message = computed(() => store.state.message)
const error = computed(() => store.state.error)

/** Dismiss the error banner. */
function dismissError() {
  store.state.error = ''
}
</script>

<template>
  <!-- ================================================================== -->
  <!-- Generation overlay                                                  -->
  <!-- ================================================================== -->
  <Transition name="fade">
    <div
      v-if="isGenerating"
      class="fixed inset-0 z-40 grid place-items-center bg-canvas/75 p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div class="w-full max-w-xs rounded-3xl border border-line bg-surface p-6 text-center shadow-xl">
        <div class="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-soft">
          <span class="animate-breathe text-3xl" aria-hidden="true">✨</span>
        </div>

        <!-- The friendly, human sentence (never technical detail). -->
        <p class="mt-4 font-medium text-ink">{{ message }}</p>
        <p class="mt-1 text-sm text-muted">Just a moment.</p>

        <!-- Three breathing dots: clearly "busy" without implying a specific
             percentage, which would be dishonest for a mock. -->
        <span class="mt-5 flex justify-center gap-1.5" aria-hidden="true">
          <span
            class="size-2.5 animate-breathe rounded-full bg-brand"
            style="animation-delay: 0ms"
          />
          <span
            class="size-2.5 animate-breathe rounded-full bg-brand"
            style="animation-delay: 160ms"
          />
          <span
            class="size-2.5 animate-breathe rounded-full bg-brand"
            style="animation-delay: 320ms"
          />
        </span>
      </div>
    </div>
  </Transition>

  <!-- ================================================================== -->
  <!-- Error banner (non-blocking, dismissible)                            -->
  <!-- ================================================================== -->
  <Transition name="pop">
    <div
      v-if="error && !isGenerating"
      class="pb-safe fixed inset-x-0 bottom-0 z-40 p-4"
      role="alert"
    >
      <div
        class="mx-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lg"
      >
        <span class="mt-0.5 text-danger" aria-hidden="true">
          <AppIcon name="info" :size="20" />
        </span>
        <p class="flex-1 text-sm text-ink">{{ error }}</p>
        <button
          type="button"
          class="-m-1 grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink"
          aria-label="Dismiss message"
          @click="dismissError"
        >
          <AppIcon name="close" :size="18" />
        </button>
      </div>
    </div>
  </Transition>
</template>
