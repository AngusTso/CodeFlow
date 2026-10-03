/**
 * shared/a11y/usePrefersReducedMotion.js — reactive reduced-motion detection.
 * ---------------------------------------------------------------------------
 * WHY?
 *   AGENTS.md requires respecting `prefers-reduced-motion`. Most of that is
 *   handled in CSS (see theme.css), but some interactions must behave
 *   differently in JavaScript — for example, the swipeable scene carousel
 *   should jump instantly instead of easing. This composable exposes the user's
 *   preference reactively so components can branch on it.
 *
 * SHARED because every prototype must honour the same accessibility rules,
 * regardless of its visual style.
 */

import { getCurrentInstance, onUnmounted, ref } from 'vue'

/**
 * @returns {import('vue').Ref<boolean>} `true` when the user has asked the
 *   operating system to reduce motion.
 */
export function usePrefersReducedMotion() {
  // `matchMedia` is absent in non-browser environments (e.g. SSR/tests).
  const query =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null

  const prefersReduced = ref(query ? query.matches : false)

  /** @param {MediaQueryListEvent} event */
  const handleChange = (event) => {
    prefersReduced.value = event.matches
  }

  // Older Safari only supports the deprecated addListener; guard both.
  if (query?.addEventListener) {
    query.addEventListener('change', handleChange)
  } else if (query?.addListener) {
    query.addListener(handleChange)
  }

  // This composable is also used once at app level (see main.js), where there is
  // no component instance to bind a lifecycle hook to. Only register cleanup
  // when we are actually inside a component, otherwise Vue logs a warning.
  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (query?.removeEventListener) {
        query.removeEventListener('change', handleChange)
      } else if (query?.removeListener) {
        query.removeListener(handleChange)
      }
    })
  }

  return prefersReduced
}
