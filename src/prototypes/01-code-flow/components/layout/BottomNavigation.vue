<script setup>
/**
 * BottomNavigation.vue — the global navigation bar for small screens.
 * ---------------------------------------------------------------------------
 * DESIGN_PROTOTYPE1 §2: the app's global layer is Home / Projects / Create /
 * Profile. On mobile it is a fixed bottom tab bar (thumb-friendly, always
 * reachable); on desktop the same items are rendered by AppShell as a side
 * rail, so the mental model never changes (DESIGN_PROTOTYPE1 §11).
 *
 * ACCESSIBILITY
 *   • Real <a> elements: keyboard, middle-click and "open in new tab" all work.
 *   • The nav landmark is labelled ("Primary") so screen-reader users can jump
 *     straight to it.
 *   • The active destination is announced with `aria-current="page"`.
 *   • Because the router is hash-based, a plain `href="#/path"` is enough — no
 *     click handler is needed, and the browser back button behaves normally.
 */

import { computed } from 'vue'
import { NAV_ITEMS, isNavItemActive } from '../../navigation.js'
import { useRouter } from '../../composables.js'
import AppIcon from '../ui/AppIcon.vue'

const router = useRouter()

// `router.route` is a computed ref; unwrap it for the template.
const route = computed(() => router.route.value)
</script>

<template>
  <nav
    aria-label="Primary"
    class="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
  >
    <ul class="mx-auto flex max-w-lg items-stretch">
      <li v-for="item in NAV_ITEMS" :key="item.id" class="flex-1">
        <a
          :href="`#${item.path}`"
          class="flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] transition-colors"
          :class="
            isNavItemActive(item, route)
              ? 'font-semibold text-brand'
              : 'font-medium text-muted hover:text-ink'
          "
          :aria-current="isNavItemActive(item, route) ? 'page' : undefined"
        >
          <AppIcon :name="item.icon" :size="22" />
          <span>{{ item.label }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>
