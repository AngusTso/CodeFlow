<script setup>
/**
 * SceneTile.vue — one scene, as a card.
 * ---------------------------------------------------------------------------
 * Reused in three places that ask slightly different questions:
 *   - STORYBOARD  a vertical list where order must be editable
 *   - SCENES      a responsive grid for browsing and inspecting
 *   - MEDIA       a bin of the frames available to the edit
 *
 * The card shows the scene's frame, its number, its role and — always — the
 * origin badge from brief section 13, so "was this AI or a person?" is answered
 * without opening anything.
 *
 * The tile is a real <button>: focusable, Enter/Space activatable, and paired
 * with a visible focus ring. Reordering is NOT done by dragging here — the
 * parent supplies explicit move controls, because a drag-only reorder would be
 * unreachable for keyboard and screen-reader users (brief section 6).
 *
 * @prop {object}  scene    - The scene model.
 * @prop {number}  index    - Zero-based position in the sequence.
 * @prop {boolean} selected - Whether the Inspector is showing this scene.
 * @prop {string}  role     - Optional marketing role label, e.g. "Hook".
 */

import { computed } from 'vue'
import { ORIGIN_BADGES } from '../../../../shared/data/mockData.js'
import Icon from '../ui/Icon.vue'

const props = defineProps({
  scene: { type: Object, required: true },
  index: { type: Number, default: 0 },
  selected: { type: Boolean, default: false },
  role: { type: String, default: '' },
})

defineEmits(['select'])

/** The badge that answers "who made this?" (brief section 13). */
const origin = computed(
  () => ORIGIN_BADGES.find((entry) => entry.id === props.scene.origin) || null,
)

/** Zero-padded scene number, matching the timeline clip labels. */
const number = computed(() => String(props.index + 1).padStart(2, '0'))

/** A compact, readable technical line — the parameters that matter at a glance. */
const techLine = computed(() => {
  const scene = props.scene
  return [scene.lens, scene.movement, scene.lightingIntensity ? `${scene.lightingIntensity}%` : '']
    .filter(Boolean)
    .join(' · ')
})
</script>

<template>
  <button
    type="button"
    class="group block w-full overflow-hidden rounded-lg border text-left transition-colors"
    :class="selected ? 'border-accent bg-elevated' : 'border-line bg-surface hover:border-[#3a4552] hover:bg-elevated'"
    :aria-pressed="selected"
    :aria-label="`Scene ${number}. ${scene.title}. ${origin ? origin.label : 'Origin unknown'}.`"
    @click="$emit('select', scene.id)"
  >
    <!-- Frame: the gradient stands in for a rendered still. -->
    <span
      class="relative block h-24 w-full"
      :style="{ background: scene.gradient }"
      aria-hidden="true"
    >
      <span class="absolute left-2 top-2 rounded bg-canvas/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink">
        {{ number }}
      </span>
      <span
        v-if="role"
        class="absolute right-2 top-2 rounded bg-canvas/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent"
      >
        {{ role }}
      </span>
    </span>

    <span class="block px-3 py-2">
      <span class="block truncate text-[13px] font-semibold text-ink">{{ scene.title }}</span>
      <span v-if="scene.prompt" class="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-ink3">
        {{ scene.prompt }}
      </span>

      <span class="mt-2 flex items-center gap-1.5">
        <!-- Origin badge: glyph + word, never colour alone. -->
        <span
          v-if="origin"
          class="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-[10px] text-ink2"
          :title="origin.title"
        >
          <span aria-hidden="true">{{ origin.glyph }}</span>
          {{ origin.label }}
        </span>
        <span class="ml-auto inline-flex items-center gap-1 text-[10px] text-ink3">
          <Icon name="clock" :size="11" />
          {{ scene.duration }}s
        </span>
      </span>

      <span v-if="techLine" class="mt-1.5 block truncate font-mono text-[10px] text-ink3">
        {{ techLine }}
      </span>
    </span>
  </button>
</template>
