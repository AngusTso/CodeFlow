<script setup>
/**
 * TerminalNav.vue — the navigation (brief sections 6 and 79).
 * ---------------------------------------------------------------------------
 * Reads like a futuristic operating system, but behaves like an ordinary,
 * obvious menu:
 *
 *     > SIGNAL
 *       UNIVERSE
 *       LAB
 *       ARCHIVE
 *       EXPORT
 *
 * WHY IT IS NOT JUST A LIST OF LINKS
 *   - It is a real `<nav>` with real `<button>`s, so Tab order and Enter/Space
 *     work exactly as expected (brief sections 41 and 42).
 *   - The active item is marked `aria-current="page"` AND carries a visible
 *     `>` marker plus a weight change, so the current location is never
 *     communicated by colour alone (section 44).
 *   - The number shortcuts are shown but are optional accelerators. Every
 *     destination is reachable by clicking (section 79).
 *
 * RESPONSIVE
 *   From 1440px it is a full rail with hints. From 768px it keeps the same five
 *   destinations but drops the hints. Below that it becomes a horizontally
 *   scrollable strip, which stops the rail wrapping onto two rows and pushing
 *   the universe off-screen on a phone (section 51).
 */
import { computed } from 'vue'
import { useRouter, useStore } from '../../composables.js'
import { TERMINAL_NAV } from '../../navigation.js'
import SigIcon from '../ui/SigIcon.vue'

const router = useRouter()
const store = useStore()

const activeId = computed(() => router.route.value?.name || 'signal')

/**
 * EXPORT needs a stabilised concept. Rather than a dead link, the item stays
 * visible but explains why it is unavailable (brief section 63).
 */
function isLocked(item) {
  return item.id === 'export' && !store.state.concept
}

/**
 * Navigate to a section.
 * @param {{id: string, path: string}} item
 */
function go(item) {
  if (isLocked(item)) return
  router.navigate(item.path)
}

/** Human-readable explanation for a locked destination. */
function lockReason(item) {
  return item.id === 'export'
    ? 'Stabilise a possibility first — export needs a cinematic sequence.'
    : ''
}
</script>

<template>
  <nav class="term-nav" aria-label="Creative Signal sections">
    <ul class="term-nav__list">
      <li v-for="item in TERMINAL_NAV" :key="item.id">
        <button
          type="button"
          class="term-nav__item"
          :data-active="item.id === activeId"
          :aria-current="item.id === activeId ? 'page' : undefined"
          :disabled="isLocked(item)"
          :title="isLocked(item) ? lockReason(item) : item.hint"
          @click="go(item)"
        >
          <!-- Prompt marker doubles as the active-state indicator. -->
          <span class="term-nav__marker" aria-hidden="true">{{ item.id === activeId ? '>' : '·' }}</span>
          <span class="term-nav__label">{{ item.label }}</span>
          <!-- Locked destinations carry a word, not just a dimmed colour. -->
          <span v-if="isLocked(item)" class="term-nav__lock">
            <SigIcon name="lock" :size="12" />
            <span class="sr-only">Unavailable: {{ lockReason(item) }}</span>
            <span aria-hidden="true" class="term-nav__locktext">LOCKED</span>
          </span>
          <kbd class="term-nav__key" aria-hidden="true">{{ item.key }}</kbd>
          <span class="term-nav__hint" aria-hidden="true">{{ item.hint }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
<style scoped>
/* ==========================================================================
   Terminal navigation
   --------------------------------------------------------------------------
   Section 35: neon indicates ACTIVE state only. Five glowing links would flatten
   the hierarchy, so exactly one item carries the signal colour.
   ========================================================================== */
.term-nav {
  border-bottom: 1px solid var(--color-line);
  background: var(--color-terminal);
}

.term-nav__list {
  display: flex;
  /* Contained at EVERY width: the row must scroll, never overflow the page
     (the hints make the row wider than the viewport on tablet/desktop). */
  overflow-x: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  scrollbar-width: none;
}

.term-nav__list::-webkit-scrollbar {
  display: none;
}

.term-nav__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* Generous target: the aesthetic must not shrink the hit area (s. 52). */
  min-height: 52px;
  padding: 0 1rem;
  background: transparent;
  border: none;
  border-right: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  color: var(--color-ink2);
  cursor: pointer;
  transition:
    color 140ms ease,
    background-color 140ms ease;
}

.term-nav__item:first-child {
  border-left: 1px solid var(--color-line);
}

.term-nav__item:hover:not(:disabled) {
  color: var(--color-ink);
  background: var(--color-panel);
}

.term-nav__item[data-active='true'] {
  color: var(--color-cyan);
  background: color-mix(in srgb, var(--color-cyan) 8%, transparent);
  font-weight: 700;
  box-shadow: inset 0 -2px 0 var(--color-cyan);
}

.term-nav__item:disabled {
  cursor: not-allowed;
  color: var(--color-ink3);
}

.term-nav__marker {
  width: 0.6rem;
  color: var(--color-cyan);
}

.term-nav__item[data-active='false'] .term-nav__marker {
  color: var(--color-ink3);
}

.term-nav__label {
  white-space: nowrap;
}

.term-nav__lock {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  color: var(--color-ink3);
}

.term-nav__locktext {
  font-size: 9px;
  letter-spacing: 0.1em;
}

/* Keyboard hint: decorative, hidden from the accessibility tree. */
.term-nav__key {
  padding: 0.1rem 0.3rem;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-ink3);
  border: 1px solid var(--color-line);
}

/* Description is decorative; the button's title and label carry the meaning. */
.term-nav__hint {
  display: none;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--color-ink3);
  text-transform: none;
}

/* ---- Tablet and up: reveal the hint (brief section 50) -------------------- */
@media (min-width: 768px) {
  .term-nav__item {
    flex: 1 1 auto;
    /* Allow shrinking so the row fits instead of pushing a giant empty
       overflow band past the nav's edge. */
    min-width: 0;
  }
  .term-nav__label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .term-nav__hint {
    display: inline;
    min-width: 0;
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* ---- Desktop: full rail with room for descriptions (brief section 49) ----- */
@media (min-width: 1440px) {
  .term-nav__hint {
    display: inline;
    /* Capped rather than unbounded: full descriptions, but never a
       page-level overflow. */
    max-width: 16rem;
  }
}

/* ---- Narrow: scroll instead of wrapping (brief section 51) ---------------- */
@media (max-width: 767px) {
  .term-nav__list {
    overflow-x: auto;
    scrollbar-width: none;
  }
  .term-nav__list::-webkit-scrollbar {
    display: none;
  }
  .term-nav__item {
    padding: 0 0.75rem;
    font-size: 11px;
  }
  .term-nav__key,
  .term-nav__locktext {
    display: none;
  }
}
</style>