<script setup>
/**
 * SceneCard.vue — one shot in the storyboard (AGENTS.md "SceneCard").
 * ---------------------------------------------------------------------------
 * DESIGN_PROTOTYPE1 §4: this single card is reused for storyboard browsing, the
 * overview list, the scene editor preview and the video timeline. Keeping one
 * card component is what makes the whole prototype feel consistent.
 *
 * It is deliberately PRESENTATIONAL: it renders a scene and emits intent
 * events. All state changes happen in the store, which the parent view calls.
 *
 * ACCESSIBILITY
 *   • Every action is a real <button> with an explicit accessible name that
 *     includes the scene number ("Regenerate scene 2"), because "Regenerate"
 *     alone is meaningless when a screen reader lists ten of them.
 *   • The card's artwork carries meaningful alt text from the scene data.
 *   • Actions can be disabled while the AI is busy, rather than silently
 *     ignored.
 */

import { computed } from 'vue'
import { CAMERAS, MOODS, STYLES, labelOf } from '../../../../shared/data/mockData.js'
import AppIcon from '../ui/AppIcon.vue'
import PlaceholderArt from '../ui/PlaceholderArt.vue'

const props = defineProps({
  /** A Scene model (see shared/domain/models.js). */
  scene: { type: Object, required: true },
  /** Zero-based position, used only for labels. */
  index: { type: Number, default: 0 },
  /** Total number of scenes, so the card can say "1 of 5". */
  total: { type: Number, default: 1 },
  /** Highlighted state (e.g. the scene currently open in the editor). */
  selected: { type: Boolean, default: false },
  /** Whether to show the reorder/regenerate/delete row. */
  showActions: { type: Boolean, default: true },
  /** Disables all actions while a generation is running. */
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['open', 'move-up', 'move-down', 'regenerate', 'delete'])

/** Human label for a scene's position, e.g. "1 of 5". */
const positionLabel = computed(() => `${props.index + 1} of ${props.total}`)

/** Small metadata chips shown under the prompt. */
const chips = computed(() => [
  `${props.scene.duration}s`,
  labelOf(MOODS, props.scene.mood),
  labelOf(CAMERAS, props.scene.camera),
  labelOf(STYLES, props.scene.style),
])
</script>

<template>
  <div
    class="flex h-full flex-col gap-3 rounded-3xl border bg-surface p-3 shadow-sm transition-colors"
    :class="props.selected ? 'border-brand ring-2 ring-brand/30' : 'border-line'"
  >
    <!-- Artwork + scene number overlay -->
    <div class="relative">
      <PlaceholderArt
        :image-url="props.scene.imageUrl || ''"
        :gradient="props.scene.gradient"
        :alt="props.scene.alt"
        rounded="rounded-2xl"
        class="aspect-video w-full"
      />

      <p
        class="absolute left-2 top-2 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur"
      >
        Scene {{ String(props.index + 1).padStart(2, '0') }}
      </p>

      <p
        class="absolute right-2 top-2 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur"
      >
        {{ positionLabel }}
      </p>
    </div>

    <!-- Text -->
    <div class="px-1">
      <h3 class="text-base font-semibold leading-snug text-ink">{{ props.scene.title }}</h3>
      <p class="mt-1 line-clamp-2 text-sm text-muted">{{ props.scene.prompt }}</p>

      <ul class="mt-2.5 flex flex-wrap gap-1.5" aria-label="Scene settings">
        <li
          v-for="chip in chips"
          :key="chip"
          class="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand-ink"
        >
          {{ chip }}
        </li>
      </ul>
    </div>

    <!-- Actions -->
    <div v-if="props.showActions" class="mt-auto flex items-center gap-1.5 px-1">
      <!-- Accessible alternative to dragging (DESIGN_PROTOTYPE1 §6). -->
      <button
        type="button"
        class="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
        :disabled="props.busy || props.index === 0"
        :aria-label="`Move scene ${props.index + 1} earlier`"
        @click="emit('move-up')"
      >
        <AppIcon name="up" :size="18" />
      </button>

      <button
        type="button"
        class="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
        :disabled="props.busy || props.index === props.total - 1"
        :aria-label="`Move scene ${props.index + 1} later`"
        @click="emit('move-down')"
      >
        <AppIcon name="down" :size="18" />
      </button>

      <button
        type="button"
        class="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
        :disabled="props.busy"
        :aria-label="`Regenerate scene ${props.index + 1}`"
        @click="emit('regenerate')"
      >
        <AppIcon name="refresh" :size="18" />
      </button>

      <button
        type="button"
        class="grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-danger disabled:opacity-40"
        :disabled="props.busy"
        :aria-label="`Delete scene ${props.index + 1}`"
        @click="emit('delete')"
      >
        <AppIcon name="trash" :size="18" />
      </button>

      <button
        type="button"
        class="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-soft px-3.5 text-sm font-medium text-brand-ink transition-colors hover:bg-brand hover:text-white disabled:opacity-40"
        :disabled="props.busy"
        :aria-label="`Edit scene ${props.index + 1}: ${props.scene.title}`"
        @click="emit('open')"
      >
        <AppIcon name="sliders" :size="16" />
        <span>Edit</span>
      </button>
    </div>
  </div>
</template>
