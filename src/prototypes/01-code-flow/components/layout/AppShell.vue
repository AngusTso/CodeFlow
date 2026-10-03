<script setup>
/**
 * AppShell.vue — the layout chrome for the global screens (listed in AGENTS.md).
 * ---------------------------------------------------------------------------
 * RESPONSIVE STRATEGY (DESIGN_PROTOTYPE1 §11)
 *   • < 1024px : brand header on top, content below, fixed bottom navigation.
 *   • ≥ 1024px : the SAME navigation moves into a persistent left side rail and
 *                the header becomes a slim page title bar. We do not simply
 *                stretch the mobile layout — the space is actually used.
 *
 * The shell is presentation-only: it renders a slot and never touches product
 * state (AGENTS.md: keep state separate from presentation).
 */

import { computed } from 'vue'
import { NAV_ITEMS, isNavItemActive } from '../../navigation.js'
import { useRouter } from '../../composables.js'
import AppIcon from '../ui/AppIcon.vue'
import BottomNavigation from './BottomNavigation.vue'

const router = useRouter()
const route = computed(() => router.route.value)

/** Per-screen page title/subtitle, keyed by route name. */
const SCREEN_TEXT = {
  home: { title: 'Code Flow', subtitle: 'Turn an idea into a short video' },
  projects: { title: 'Projects', subtitle: 'Everything you have started' },
  profile: { title: 'Profile', subtitle: 'Account and preferences' },
}

const screen = computed(() => SCREEN_TEXT[route.value.name] || SCREEN_TEXT.home)
</script>

<template>
  <div class="min-h-screen lg:flex">
    <!-- Skip link: lets keyboard users jump straight past the navigation. -->
    <a
      href="#main"
      class="skip-link"
    >
      Skip to content
    </a>

    <!-- ---------------------------------------------------------------- -->
    <!-- Desktop side rail (≥1024px only)                                  -->
    <!-- ---------------------------------------------------------------- -->
    <aside
      class="hidden border-r border-line bg-surface lg:flex lg:w-64 lg:shrink-0 lg:flex-col"
      aria-label="Sidebar"
    >
      <div class="flex items-center gap-2.5 px-6 py-6">
        <span
          class="grid size-9 place-items-center rounded-xl bg-brand text-white"
          aria-hidden="true"
        >
          <AppIcon name="play" :size="18" />
        </span>
        <span class="text-lg font-semibold tracking-tight">Code Flow</span>
      </div>

      <nav aria-label="Primary" class="px-3">
        <ul class="space-y-1">
          <li v-for="item in NAV_ITEMS" :key="item.id">
            <a
              :href="`#${item.path}`"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
              :class="
                isNavItemActive(item, route)
                  ? 'bg-brand-soft font-semibold text-brand'
                  : 'font-medium text-muted hover:bg-canvas hover:text-ink'
              "
              :aria-current="isNavItemActive(item, route) ? 'page' : undefined"
            >
              <AppIcon :name="item.icon" :size="20" />
              <span class="flex-1">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <p class="mt-auto px-6 py-6 text-xs leading-relaxed text-muted">
        Prototype 01 — minimalist, mobile-first.<br />
        A front-end demo; all AI output is simulated.
      </p>
    </aside>

    <!-- ---------------------------------------------------------------- -->
    <!-- Main column                                                       -->
    <!-- ---------------------------------------------------------------- -->
    <div class="flex min-h-screen flex-1 flex-col">
      <!-- Mobile brand header (hidden once the side rail appears). -->
      <header
        class="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur lg:bg-surface/90"
      >
        <div class="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <span
            class="grid size-9 place-items-center rounded-xl bg-brand text-white lg:hidden"
            aria-hidden="true"
          >
            <AppIcon name="play" :size="18" />
          </span>

          <div class="min-w-0 flex-1">
            <h1 class="truncate text-lg font-semibold tracking-tight">{{ screen.title }}</h1>
            <p v-if="screen.subtitle" class="truncate text-sm text-muted">{{ screen.subtitle }}</p>
          </div>

          <!-- Screen-specific actions (e.g. a "New" button) land here. -->
          <slot name="actions" />
        </div>
      </header>

      <!-- id="main" is the skip-link target and the main landmark. -->
      <main id="main" class="mx-auto w-full max-w-4xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-12">
        <slot />
      </main>
    </div>

    <BottomNavigation />
  </div>
</template>
