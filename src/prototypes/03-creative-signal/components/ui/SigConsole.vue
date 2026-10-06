<script setup>
/**
 * SigConsole.vue — the terminal modal shell (brief sections 18, 37, 38).
 * ---------------------------------------------------------------------------
 * Modals are a MAJOR visual component of Prototype 03: "they should feel like
 * system consoles". This component owns that shared chrome exactly once, so the
 * Synthesis, Possibility, Stabilize and Export modals are unmistakably part of
 * one system instead of four similar-looking dialogs.
 *
 * Everything ornamental lives here (corner brackets, scanlines, the header
 * sweep). Everything semantic lives in the slot, so a caller's screen reader
 * still gets a clean heading, description and list of controls.
 *
 * ACCESSIBILITY (brief section 43)
 *   * `role="dialog"` + `aria-modal` + `aria-labelledby` on the panel.
 *   * Focus moves in on open and is restored on close (via useDialog).
 *   * Escape closes.
 *   * The dismiss control is a real button with an accessible name.
 */
import { ref, toRef } from 'vue'
import { useDialog } from '../../useDialog.js'
import SigIcon from './SigIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Console title, e.g. "SIGNAL SYNTHESIS // 04". */
  title: { type: String, required: true },
  /** Optional line under the title. */
  subtitle: { type: String, default: '' },
  /** Widen the panel (the synthesis modal needs the extra room). */
  wide: { type: Boolean, default: false },
  /** Show the animated header sweep (only while genuinely working). */
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

/** Stable id for aria-labelledby, derived from the title. */
const titleId = `console-${props.title.replace(/\W+/g, '-').toLowerCase()}`

const closeBtn = ref(null)
const { panel } = useDialog(toRef(props, 'open'), {
  onClose: () => emit('close'),
  // Land on the dismiss control so a keyboard user starts from a known place.
  initialFocus: () => closeBtn.value,
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cs-modal">
      <div
        v-if="props.open"
        class="sig-console__scrim"
        @click.self="emit('close')"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          class="sig-console cs-corners"
          :class="{ 'sig-console--wide': props.wide }"
          tabindex="-1"
        >
          <!-- Decorative scanlines; the panel stays fully readable beneath. -->
          <span class="sig-console__scan cs-scanlines" aria-hidden="true" />

          <!-- ======================= Header ======================= -->
          <header class="sig-console__head">
            <h2 :id="titleId" class="sig-console__title">{{ props.title }}</h2>
            <button
              ref="closeBtn"
              type="button"
              class="sig-console__close"
              aria-label="Close this console"
              @click="emit('close')"
            >
              <SigIcon name="close" :size="16" />
            </button>
          </header>

          <p v-if="props.subtitle" class="sig-console__sub">{{ props.subtitle }}</p>

          <!-- Animated loading line, only while genuinely working (s. 61). -->
          <div v-if="props.busy" class="sig-console__track" aria-hidden="true">
            <span class="animate-cs-sweep" />
          </div>

          <!-- ======================= Content ======================= -->
          <div class="sig-console__body scroll">
            <slot />
          </div>

          <!-- ======================= Footer ======================= -->
          <footer v-if="$slots.footer" class="sig-console__foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<style scoped>
.sig-console__scrim {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(3 4 7 / 0.82);
}

.sig-console {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 34rem;
  max-height: min(92vh, 54rem);
  overflow: hidden;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  box-shadow:
    0 0 0 1px rgb(0 229 255 / 0.22),
    0 24px 60px -18px rgb(0 0 0 / 0.9);
}

.sig-console--wide {
  max-width: 46rem;
}

.sig-console__scan {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.5;
}

.sig-console__head {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: var(--color-terminal);
  border-bottom: 1px solid var(--color-line);
}

.sig-console__title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-cyan);
}

.sig-console__close {
  display: grid;
  place-items: center;
  /* 44px target even though the glyph is small (brief section 52). */
  width: 44px;
  height: 44px;
  margin: -0.5rem -0.5rem -0.5rem 0;
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-ink2);
  cursor: pointer;
  transition:
    color 140ms ease,
    border-color 140ms ease;
}
.sig-console__close:hover {
  color: var(--color-danger);
  border-color: var(--color-line);
}

.sig-console__sub {
  position: relative;
  z-index: 2;
  margin: 0;
  padding: 0.6rem 1rem;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-ink2);
  border-bottom: 1px solid var(--color-line);
}

.sig-console__track {
  position: relative;
  z-index: 2;
  height: 2px;
  overflow: hidden;
  background: var(--color-line);
}
.sig-console__track span {
  display: block;
  width: 33%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--color-cyan), transparent);
}

.sig-console__body {
  position: relative;
  z-index: 2;
  padding: 1rem;
  overflow-y: auto;
}

.sig-console__foot {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  background: var(--color-terminal);
  border-top: 1px solid var(--color-line);
}
</style>