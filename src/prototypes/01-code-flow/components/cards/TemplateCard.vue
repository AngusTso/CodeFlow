<script setup>
/**
 * TemplateCard.vue — a ready-made starting point (AGENTS.md "TemplateCard").
 * ---------------------------------------------------------------------------
 * DESIGN_PROTOTYPE1 §1: the "Start from Template" branch of the hybrid entry.
 * Templates let a beginner skip the blank-prompt problem while still landing in
 * exactly the same guided workflow as someone who types their own idea.
 *
 * The whole card is a single button: one large, obvious tap target rather than
 * a card plus a small "use" link.
 */

import { computed } from 'vue'
import { gradientFor, byId, SCENE_TYPES } from '../../../../shared/data/mockData.js'
import AppIcon from '../ui/AppIcon.vue'
import PlaceholderArt from '../ui/PlaceholderArt.vue'

const props = defineProps({
  /** A VIDEO_TEMPLATES entry (see shared/data/mockData.js). */
  template: { type: Object, required: true },
  /** Disables the card while a generation is already running. */
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['use'])

/** Placeholder gradient derived from the template's scene type. */
const gradient = computed(() => gradientFor(props.template.type, 1))

/** Human label for the template's scene type, e.g. "Urban". */
const typeLabel = computed(() => byId(SCENE_TYPES, props.template.type).label)

/** Accessible description combining the important facts. */
const ariaLabel = computed(
  () =>
    `Use template ${props.template.title}: ${props.template.description} ` +
    `(${props.template.sceneCount} scenes, about ${props.template.duration} seconds)`,
)
</script>

<template>
  <button
    type="button"
    class="group flex w-full flex-col overflow-hidden rounded-3xl border border-line bg-surface text-left shadow-sm transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    :disabled="props.busy"
    :aria-label="ariaLabel"
    @click="emit('use', props.template)"
  >
    <PlaceholderArt
      :gradient="gradient"
      :glyph="props.template.glyph"
      :alt="`Preview artwork for the ${props.template.title} template`"
      rounded="rounded-none"
      class="aspect-[16/9] w-full"
    />

    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="flex items-start gap-2">
        <h3 class="flex-1 text-base font-semibold leading-snug text-ink">
          {{ props.template.title }}
        </h3>
        <span
          class="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand-ink"
        >
          {{ typeLabel }}
        </span>
      </div>

      <p class="text-sm text-muted">{{ props.template.description }}</p>

      <p class="mt-auto flex items-center gap-3 pt-1 text-xs text-muted">
        <span class="inline-flex items-center gap-1">
          <AppIcon name="layers" :size="14" />
          {{ props.template.sceneCount }} scenes
        </span>
        <span class="inline-flex items-center gap-1">
          <AppIcon name="clock" :size="14" />
          ~{{ props.template.duration }}s
        </span>
        <span
          class="ml-auto inline-flex items-center gap-1 font-medium text-brand transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          Use <AppIcon name="chevronRight" :size="14" />
        </span>
      </p>
    </div>
  </button>
</template>
