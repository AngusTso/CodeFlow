<script setup>
/**
 * Btn.vue — the button primitive for Prototype 02.
 * ---------------------------------------------------------------------------
 * Same guarantees as Prototype 01's AppButton, restyled for a dense dark tool:
 *
 *   1. Compact but still tappable (32px default, 40px in the large size; every
 *      icon-only use is paired with a 36px+ hit area in the parent).
 *   2. Visible focus ring in the accent colour.
 *   3. `loading` blocks interaction AND announces `aria-busy`, so a screen
 *      reader knows an action is in flight rather than having done nothing.
 *
 * CONTRAST NOTE (brief section 22): white text on #5b8def is only ~2.9:1 and
 * fails WCAG AA. The filled primary therefore uses near-black ink on blue
 * (~6.0:1), which reads as a deliberate dark-tool accent rather than a
 * consumer pill.
 */

import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | ghost | quiet | danger
  size: { type: String, default: 'md' }, // sm | md | lg
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: '' },
  type: { type: String, default: 'button' },
  /** Native tooltip; useful for icon-forward toolbar controls. */
  title: { type: String, default: '' },
})

const emit = defineEmits(['click'])

const isDisabled = computed(() => props.disabled || props.loading)

const VARIANTS = {
  primary: 'bg-accent text-canvas font-semibold hover:bg-[#72a0f7]',
  ghost: 'border border-line bg-elevated text-ink hover:border-[#3a4552] hover:bg-[#212833]',
  quiet: 'text-ink2 hover:bg-elevated hover:text-ink',
  danger: 'border border-line text-danger hover:bg-[#201417]',
}

const SIZES = {
  sm: 'h-7 px-2 text-[12px] gap-1.5',
  md: 'h-8 px-3 text-[13px] gap-1.5',
  lg: 'h-10 px-4 text-[13px] gap-2',
}

const classes = computed(() => [
  'inline-flex items-center justify-center rounded transition-colors',
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
  'disabled:cursor-not-allowed disabled:opacity-45',
  VARIANTS[props.variant] || VARIANTS.primary,
  SIZES[props.size] || SIZES.md,
  props.block ? 'w-full' : '',
])

/** Forward the click only when the control is genuinely usable. */
function handleClick(event) {
  if (isDisabled.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="props.type"
    :class="classes"
    :disabled="isDisabled"
    :title="props.title"
    :aria-busy="props.loading ? 'true' : undefined"
    @click="handleClick"
  >
    <span
      v-if="props.loading"
      class="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <Icon v-else-if="props.icon" :name="props.icon" :size="14" />
    <span class="whitespace-nowrap"><slot /></span>
  </button>
</template>
