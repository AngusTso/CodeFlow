<script setup>
/**
 * SigButton.vue — the one button in the system.
 * ---------------------------------------------------------------------------
 * Renders a real `<button>`. The brief is explicit that clickable `<div>`s are
 * not acceptable (section 41), and every action in Prototype 03 - including the
 * terminal-looking ones - goes through this component.
 *
 * TWO RULES THAT MATTER MORE THAN THE STYLING
 *
 *   1. TOUCH TARGETS (section 52). The terminal aesthetic must never compromise
 *      usability, so the smallest variant still has a 44px hit area.
 *   2. STATUS IS NEVER COLOUR ALONE (section 44). The `tone` prop changes
 *      colour, but callers must also pass a glyph or a word, which this
 *      component renders as a visible prefix rather than a colour-only hint.
 */
import SigIcon from './SigIcon.vue'

const props = defineProps({
  /** Visual weight: 'primary' | 'secondary' | 'ghost' | 'danger'. */
  tone: { type: String, default: 'secondary' },
  /** Display size: 'md' | 'sm' | 'lg'. All keep a >=44px hit area. */
  size: { type: String, default: 'md' },
  /** Optional icon name from SigIcon. */
  icon: { type: String, default: '' },
  /** Trailing glyph rendered as TEXT - used for non-colour status (s. 44). */
  mark: { type: String, default: '' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  /** Full-width block button. */
  block: { type: Boolean, default: false },
  /** Corner brackets, the console framing motif (section 38). */
  brackets: { type: Boolean, default: false },
  /** When true, explain a disabled state instead of failing silently (s. 63). */
  title: { type: String, default: '' },
})

const emit = defineEmits(['click'])

/**
 * Forward the click, but never when disabled.
 * @param {MouseEvent} event
 */
function onClick(event) {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="props.type"
    class="sig-btn"
    :class="[
      `sig-btn--${props.tone}`,
      `sig-btn--${props.size}`,
      { 'sig-btn--block': props.block, 'cs-corners': props.brackets },
    ]"
    :disabled="props.disabled"
    :title="props.title || undefined"
    :aria-label="props.title || undefined"
    @click="onClick"
  >
    <SigIcon v-if="props.icon" :name="props.icon" :size="props.size === 'lg' ? 18 : 15" />
    <span class="sig-btn__label"><slot /></span>
    <!-- Textual status marker: colour is never the only signal (section 44). -->
    <span v-if="props.mark" class="sig-btn__mark" aria-hidden="true">{{ props.mark }}</span>
  </button>
</template>

<style scoped>
/* ==========================================================================
   Buttons
   --------------------------------------------------------------------------
   Minimum height is 44px at every size (brief section 52). The neon treatments
   live on hover/active/disabled only, so the resting UI does not glow
   everywhere (section 35).
   ========================================================================== */
.sig-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    color 140ms ease,
    box-shadow 140ms ease;
}

.sig-btn--md {
  min-height: 44px;
  padding: 0.55rem 1rem;
  font-size: 12px;
}
.sig-btn--sm {
  min-height: 44px;
  padding: 0.4rem 0.7rem;
  font-size: 11px;
}
.sig-btn--lg {
  min-height: 52px;
  padding: 0.8rem 1.6rem;
  font-size: 13px;
}

.sig-btn--block {
  display: flex;
  width: 100%;
}

.sig-btn__mark {
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* ---- Tones --------------------------------------------------------------- */
.sig-btn--secondary {
  background: var(--color-raised);
  border-color: var(--color-line);
  color: var(--color-ink);
}
.sig-btn--secondary:hover:not(:disabled) {
  border-color: var(--color-cyan);
  color: var(--color-cyan);
}

.sig-btn--primary {
  background: color-mix(in srgb, var(--color-cyan) 16%, transparent);
  border-color: var(--color-cyan);
  color: var(--color-cyan);
  font-weight: 700;
}
.sig-btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-cyan) 28%, transparent);
  box-shadow: 0 0 18px -4px var(--color-cyan);
}

.sig-btn--ghost {
  background: transparent;
  border-color: transparent;
  color: var(--color-ink2);
}
.sig-btn--ghost:hover:not(:disabled) {
  color: var(--color-ink);
  border-color: var(--color-line);
}

/* Destructive actions still carry a text label; colour only reinforces it. */
.sig-btn--danger {
  background: color-mix(in srgb, var(--color-danger) 14%, transparent);
  border-color: color-mix(in srgb, var(--color-danger) 55%, transparent);
  color: var(--color-danger);
}
.sig-btn--danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-danger) 26%, transparent);
}

/* ---- Disabled ------------------------------------------------------------ */
/* Disabled controls explain themselves via `title`, never just dim out. */
.sig-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  border-style: dashed;
}
</style>