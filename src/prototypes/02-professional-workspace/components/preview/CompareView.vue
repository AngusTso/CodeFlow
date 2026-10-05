<script setup>
/**
 * CompareView.vue — brief section 16: side-by-side comparison.
 * ---------------------------------------------------------------------------
 * Professional AI iteration needs the original to stay visible, so the two
 * frames sit next to each other and the choice is explicit:
 *
 *     [ Keep Original ]     [ Use Variation ]
 *
 * If no variation exists yet the view offers to generate one rather than
 * showing an empty pair of boxes.
 */

import { computed } from 'vue'
import { useStore } from '../../composables.js'
import Icon from '../ui/Icon.vue'
import Btn from '../ui/Btn.vue'

const emit = defineEmits(['close'])

const store = useStore()

const original = computed(
  () => store.state.variations.list.length && store.selectedScene.value
    ? store.selectedScene.value
    : store.currentScene.value,
)

const active = computed(() => store.activeVariation.value)
const variations = computed(() => store.state.variations.list)

/** Zero-padded label, e.g. "Variation 02" (brief section 15). */
function labelFor(variation) {
  const index = variations.value.findIndex((entry) => entry.id === variation.id)
  return `Variation ${String(index + 1).padStart(2, '0')}`
}

/** Generate a variation first, so comparison has something to show. */
async function generate() {
  await store.requestVariation()
}

function keepOriginal() {
  store.keepOriginal()
  emit('close')
}

function useSelected() {
  if (active.value) store.useVariation(active.value.id)
  emit('close')
}
</script>

<template>
  <div class="mb-2 border-b border-line pb-3">
    <div class="mb-2 flex items-center gap-2">
      <p class="eyebrow flex-1">Compare</p>
      <Btn variant="quiet" size="sm" icon="close" aria-label="Close comparison" @click="emit('close')" />
    </div>

    <!-- ---------- Nothing generated yet ---------- -->
    <div
      v-if="!active"
      class="rounded border border-dashed border-line px-4 py-6 text-center"
      role="status"
    >
      <Icon name="compare" :size="22" class="mx-auto text-ink3" />
      <p class="mt-2 text-[13px] text-ink2">No variation to compare yet.</p>
      <p class="mt-0.5 text-[12px] text-ink3">
        The original is always recoverable — comparing never replaces it.
      </p>
      <Btn class="mt-3" variant="ghost" icon="spark" :loading="store.state.ai.running" @click="generate">
        Generate a variation
      </Btn>
    </div>

    <!-- ---------- Side-by-side ---------- -->
    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <figure class="m-0">
        <div
          class="relative aspect-video overflow-hidden rounded border border-line bg-black"
          :style="{ backgroundImage: original?.gradient }"
        >
          <span
            class="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
          >
            Original
          </span>
        </div>
        <figcaption class="mt-1 truncate text-[12px] text-ink3">{{ original?.title }}</figcaption>
      </figure>

      <figure class="m-0">
        <div
          class="relative aspect-video overflow-hidden rounded border border-accent bg-black"
          :style="{ backgroundImage: active.value.gradient }"
        >
          <span
            class="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-canvas"
          >
            {{ labelFor(active) }}
          </span>
        </div>
        <figcaption class="mt-1 truncate text-[12px] text-ink3">{{ active.value.title }}</figcaption>
      </figure>

      <!-- Explicit, reversible choice (brief sections 16 and 17). -->
      <div class="col-span-full flex flex-wrap gap-2">
        <Btn variant="ghost" @click="keepOriginal">Keep Original</Btn>
        <Btn variant="primary" icon="check" @click="useSelected">Use {{ labelFor(active) }}</Btn>
        <Btn
          class="ml-auto"
          variant="quiet"
          icon="refresh"
          :loading="store.state.ai.running"
          @click="generate"
        >
          Generate Another
        </Btn>
      </div>
    </div>
  </div>
</template>
