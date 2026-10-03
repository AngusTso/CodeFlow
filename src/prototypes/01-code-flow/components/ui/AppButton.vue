<script setup>
/**
 * AppButton.vue — the prototype's button primitive (listed in AGENTS.md).
 * ---------------------------------------------------------------------------
 * WHY A WRAPPER?
 *   Every action in the app needs the same three guarantees, so they live here
 *   once instead of being repeated in 20 templates:
 *     1. A touch target of at least 44px (WCAG 2.5.5 / mobile-first).
 *     2. A visible focus ring (inherited from `:focus-visible` in theme.css).
 *     3. A busy/disabled state that is expressed for BOTH sighted users
 *        (spinner, dimmed) and assistive tech (`aria-busy`, `disabled`).
 */

import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  /** Visual weight. */
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger
  /** Control size; all sizes keep a >=44px tap height. */
  size: { type: String, default: 'md' }, // sm | md | lg
  /** Stretch to the full width of the container. */
  block: { type: Boolean, default: false },
  /** Show a spinner and block interaction. */
  loading: { type: Boolean, default: false },
  /** Standard disabled state. */
  disabled: { type: Boolean, default: false },
  /** Optional leading/trailing icon name (see AppIcon). */
  icon: { type: String, default: '' },
  iconPosition: { type: String, default: 'start' }, // start | end
  type: { type: String, default: 'button' },
})

const emit = defineEmits(['click'])

/** Loading also disables the control, so the two are handled together. */
const isDisabled = computed(() => props.disabled || props.loading)

/** Variant → Tailwind classes. Kept as data so it is easy to audit contrast. */
const VARIANT_CLASSES = {
  primary: 'bg-brand text-white hover:bg-brand-ink active:bg-brand-ink shadow-sm',
  secondary: 'bg-surface text-ink border border-line hover:bg-brand-soft active:bg-brand-soft',
  ghost: 'bg-transparent text-brand hover:bg-brand-soft active:bg-brand-soft',
  danger: 'bg-surface text-danger border border-line hover:bg-red-50 active:bg-red-50',
}

/** Size → Tailwind classes. `min-h-11` is 44px, the recommended tap target. */
const SIZE_CLASSES = {
  sm: 'min-h-11 px-3 text-sm gap-1.5',
  md: 'min-h-11 px-4 text-sm gap-2',
  lg: 'min-h-12 px-5 text-base gap-2',
}

const classes = computed(() => [
  'inline-flex items-center justify-center rounded-full font-medium transition-colors',
  'disabled:cursor-not-allowed disabled:opacity-60',
  VARIANT_CLASSES[props.variant] || VARIANT_CLASSES.primary,
  SIZE_CLASSES[props.size] || SIZE_CLASSES.md,
  props.block ? 'w-full' : '',
])

/** Forward the click only when the control is actually usable. */
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
    :aria-busy="props.loading ? 'true' : undefined"
    @click="handleClick"
  >
    <!-- Leading spinner replaces the leading icon while busy, so the control
         keeps the same width and does not jump. -->
    <span
      v-if="props.loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
    <AppIcon v-else-if="props.icon && props.iconPosition === 'start'" :name="props.icon" :size="18" />

    <span><slot /></span>

    <AppIcon
      v-if="!props.loading && props.icon && props.iconPosition === 'end'"
      :name="props.icon"
      :size="18"
    />
  </button>
</template>
