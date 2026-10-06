/**
 * 03-creative-signal/useDialog.js - accessible modal behaviour, in one place.
 * ---------------------------------------------------------------------------
 * WHY A PROTOTYPE-LOCAL COPY?
 *   Prototype 01 has an equivalent helper, but the brief (section 74.2) says
 *   Prototype 3 should own its components and interaction state and must not
 *   depend on another prototype's internals. Duplicating ~40 lines of WAI-ARIA
 *   dialog pattern is cheaper than coupling the two prototypes together, and
 *   this version adds one thing Prototype 03 specifically needs: it can suppress
 *   the page scroll-lock, because the Universe behind a modal is a pan/zoom
 *   surface whose own scroll container must keep behaving normally.
 *
 * THE FOUR BEHAVIOURS (brief section 43)
 *   1. Move focus into the modal when it opens.
 *   2. Trap Tab / Shift+Tab inside it.
 *   3. Close on Escape.
 *   4. Restore focus to whatever was focused before, on close.
 */

import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

/** Elements that can receive keyboard focus inside a dialog. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Wire up dialog behaviour for a reactive `isOpen` flag.
 *
 * @param {import('vue').Ref<boolean>} isOpen - Reactive open state.
 * @param {{ onClose?: () => void, initialFocus?: () => HTMLElement | null,
 *           lockScroll?: boolean }} [options]
 * @returns {{ panel: import('vue').Ref<HTMLElement|null>, close: () => void }}
 */
export function useDialog(isOpen, options = {}) {
  const { lockScroll = true } = options

  /** Template ref for the dialog panel; the trap is scoped to it. */
  const panel = ref(null)

  /** The element that had focus before the dialog opened. */
  let previouslyFocused = null

  /** List focusable children of the panel. @returns {HTMLElement[]} */
  function getFocusable() {
    if (!panel.value) return []
    return Array.from(panel.value.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      // Skip anything hidden, so the trap never lands on an invisible control.
      (element) => element.offsetParent !== null || element === document.activeElement,
    )
  }

  /**
   * Keyboard handling: Escape closes; Tab cycles within the dialog.
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      options.onClose?.()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = getFocusable()
    if (focusable.length === 0) {
      // Nothing focusable inside: keep focus on the panel itself.
      event.preventDefault()
      panel.value?.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (event.shiftKey && (active === first || active === panel.value)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  /** Prevent the page behind the dialog from scrolling. */
  function lock() {
    if (lockScroll) document.body.style.overflow = 'hidden'
  }

  /** Restore scrolling and remove listeners. */
  function unlock() {
    if (lockScroll) document.body.style.overflow = ''
  }

  watch(isOpen, async (open) => {
    if (open) {
      previouslyFocused = document.activeElement
      lock()
      document.addEventListener('keydown', handleKeydown, true)

      // Wait for the panel to mount before moving focus into it.
      await nextTick()
      const target = options.initialFocus?.() || getFocusable()[0] || panel.value
      target?.focus?.()
    } else {
      document.removeEventListener('keydown', handleKeydown, true)
      unlock()
      // Return focus where the user left it (WCAG 2.4.3 focus order).
      previouslyFocused?.focus?.()
      previouslyFocused = null
    }
  })

  // Safety net: never leave the page permanently scroll-locked.
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown, true)
    unlock()
  })

  return { panel, close: () => options.onClose?.() }
}