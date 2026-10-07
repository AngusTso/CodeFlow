<script setup>
/**
 * ProfileView.vue — account and preferences (global "Profile" tab).
 * ---------------------------------------------------------------------------
 * There is no authentication in this prototype (explicitly out of scope), so
 * the profile is mock content. It is included because the assignment's global
 * navigation expects it, and because it is a natural home for accessibility
 * preferences.
 *
 * NOTE ON THE MOTION SETTING
 *   We do NOT fake a working "reduce motion" toggle. Instead we READ the user's
 *   actual operating-system preference and display it. That is honest, and it
 *   demonstrates that the prototypes genuinely respect it.
 */

import { computed } from 'vue'
import { PROFILE_ARTWORK, SAMPLE_PROJECTS } from '../../../shared/data/mockData.js'
import { useReducedMotion, useStore } from '../composables.js'
import AppButton from '../components/ui/AppButton.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import PlaceholderArt from '../components/ui/PlaceholderArt.vue'

const store = useStore()
const prefersReducedMotion = useReducedMotion()

/** Mock account details. */
const profile = {
  name: 'Casual Creator',
  handle: '@my-first-videos',
  plan: 'Free plan',
}

/** Simple stats derived from the mock library. */
const stats = computed(() => [
  { label: 'Videos', value: SAMPLE_PROJECTS.length },
  {
    label: 'Scenes',
    value: SAMPLE_PROJECTS.reduce((sum, project) => sum + project.scenes, 0),
  },
  { label: 'Published', value: 2 },
])

/** Throw away the in-progress project (useful when demoing repeatedly). */
function resetDemo() {
  store.reset()
}
</script>

<template>
  <div class="space-y-5">
    <!-- ================================================================ -->
    <!-- Identity                                                          -->
    <!-- ================================================================ -->
    <section class="flex items-center gap-4 rounded-3xl border border-line bg-surface p-5 shadow-sm">
      <PlaceholderArt
        :image-url="PROFILE_ARTWORK.imageUrl"
        gradient="linear-gradient(135deg, #4d57e0 0%, #8b5cf6 100%)"
        :alt="PROFILE_ARTWORK.alt"
        rounded="rounded-2xl"
        class="size-16 shrink-0"
      />
      <div class="min-w-0">
        <h2 class="truncate text-lg font-semibold">{{ profile.name }}</h2>
        <p class="truncate text-sm text-muted">{{ profile.handle }}</p>
        <p class="mt-1 inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-ink">
          {{ profile.plan }}
        </p>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- Stats                                                             -->
    <!-- ================================================================ -->
    <section aria-labelledby="profile-stats-heading">
      <h2 id="profile-stats-heading" class="sr-only">Your activity</h2>
      <dl class="grid grid-cols-3 gap-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-2xl border border-line bg-surface p-4 text-center"
        >
          <dt class="text-xs text-muted">{{ stat.label }}</dt>
          <dd class="mt-1 text-2xl font-semibold">{{ stat.value }}</dd>
        </div>
      </dl>
    </section>

    <!-- ================================================================ -->
    <!-- Accessibility preferences                                         -->
    <!-- ================================================================ -->
    <section class="rounded-3xl border border-line bg-surface p-5 shadow-sm" aria-labelledby="profile-a11y-heading">
      <h2 id="profile-a11y-heading" class="text-base font-semibold">Accessibility</h2>
      <p class="mt-1 text-sm text-muted">
        Code Flow follows your device settings rather than overriding them.
      </p>

      <div class="mt-4 flex items-start gap-3 rounded-2xl bg-canvas p-3">
        <span class="mt-0.5 text-brand" aria-hidden="true">
          <AppIcon name="info" :size="18" />
        </span>
        <div class="text-sm">
          <p class="font-medium">
            Reduced motion is
            <span class="font-semibold">{{ prefersReducedMotion ? 'ON' : 'OFF' }}</span>
          </p>
          <p class="mt-0.5 text-muted">
            {{
              prefersReducedMotion
                ? 'Animations are being suppressed, as your system requested.'
                : 'Turn on “Reduce motion” in your operating system to suppress animations here.'
            }}
          </p>
        </div>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- Demo controls                                                     -->
    <!-- ================================================================ -->
    <section class="rounded-3xl border border-line bg-surface p-5 shadow-sm" aria-labelledby="profile-demo-heading">
      <h2 id="profile-demo-heading" class="text-base font-semibold">Prototype controls</h2>
      <p class="mt-1 text-sm text-muted">
        This is a front-end demo. Nothing is uploaded, stored or published.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <AppButton variant="secondary" icon="refresh" @click="resetDemo">Reset demo data</AppButton>
        <AppButton variant="ghost" icon="info" @click="store.state.error = ''">
          Clear messages
        </AppButton>
      </div>
    </section>
  </div>
</template>
