/**
 * 01-code-flow/useDialog.js — accessible dialog behaviour, in one place.
 * ---------------------------------------------------------------------------
 * WHY?
 *   Bottom sheets and modals both need the SAME four accessibility behaviours.
 *   Writing them twice invites divergence and bugs, so they live here:
 *
 *     1. Lock the page behind the dialog (no background scrolling).
 *     2. Move focus into the dialog when it opens.
 *     3. Trap Tab/Shift+Tab inside it, and close on Escape.
 *     4. Restore focus to whatever was focused before, on close.
 *
 * This is the WAI-ARIA "dialog (modal)" interaction pattern, which is what
 * makes the prototype usable with a keyboard or screen reader.
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
 * @param {{ onClose?: () => void, initialFocus?: () => HTMLElement | null }} [options]
 * @returns {{ panel: import('vue').Ref<HTMLElement|null>, close: () => void }}
 */
export function useDialog(isOpen, options = {}) {
  /** Template ref for the dialog panel; the trap is scoped to it. */
  const panel = ref(null)

  /** The element that had focus before the dialog opened. */
  let previouslyFocused = null

  /** List focusable children of the panel. @returns {HTMLElement[]} */
  function getFocusable() {
    if (!panel.value) return []
    return Array.from(panel.value.querySelectorAll(FOCUSABLE_SELECTOR))
  }

  /**
   * Keyboard handling: Escape closes; Tab cycles within the dialog.
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
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
  function lockScroll() {
    document.body.style.overflow = 'hidden'
  }

  /** Restore scrolling and event listeners. */
  function unlockScroll() {
    document.body.style.overflow = ''
  }

  watch(isOpen, async (open) => {
    if (open) {
      previouslyFocused = document.activeElement
      lockScroll()
      document.addEventListener('keydown', handleKeydown)

      // Wait for the panel to mount before moving focus into it.
      await nextTick()
      const target = options.initialFocus?.() || getFocusable()[0] || panel.value
      target?.focus?.()
    } else {
      document.removeEventListener('keydown', handleKeydown)
      unlockScroll()
      // Return focus where the user left it (WCAG 2.4.3 focus order).
      previouslyFocused?.focus?.()
      previouslyFocused = null
    }
  })

  // Safety net: if the component unmounts while open, never leave the page
  // permanently scroll-locked.
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
    unlockScroll()
  })

  return { panel, close: () => options.onClose?.() }
}
