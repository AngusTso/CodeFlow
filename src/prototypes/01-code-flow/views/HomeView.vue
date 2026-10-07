<script setup>
/**
 * HomeView.vue — the app's dashboard (global "Home" tab).
 * ---------------------------------------------------------------------------
 * DESIGN_PROTOTYPE1: the target user is a casual creator, so Home does three
 * simple jobs and nothing more:
 *   1. One obvious way to start (the big "Start creating" card).
 *   2. A glimpse of recent work so returning feels natural.
 *   3. A short explanation of the five steps, so the workflow is never a
 *      surprise later.
 *
 * DESIGN_PROTOTYPE1 §9: lots of white space, rounded cards, clear hierarchy.
 */

import { useRouter } from '../composables.js'
import { FLOW_STEPS } from '../../../shared/store/creationStore.js'
import { SAMPLE_PROJECTS, gradientFor } from '../../../shared/data/mockData.js'
import AppButton from '../components/ui/AppButton.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import PlaceholderArt from '../components/ui/PlaceholderArt.vue'

const router = useRouter()

/** The three most recent projects (mock data). */
const recent = SAMPLE_PROJECTS.slice(0, 3)

/** Enter the creation flow at its first step. */
function startCreating() {
  router.navigate('/flow/idea')
}
</script>

<template>
  <div class="space-y-6">
    <!-- ================================================================ -->
    <!-- Hero: the single most important action on this screen             -->
    <!-- ================================================================ -->
    <section
      class="overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8"
      aria-labelledby="home-hero-heading"
    >
      <p class="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-ink">
        <AppIcon name="wand" :size="14" />
        AI short-video studio
      </p>

      <h2 id="home-hero-heading" class="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        Turn an idea into a short video
      </h2>

      <p class="mt-2 max-w-prose text-muted">
        Describe what you want to see. Code Flow writes the storyboard, draws the scenes and
        assembles the edit — so you never have to open an editing app.
      </p>

      <div class="mt-5 flex flex-wrap gap-2">
        <AppButton variant="primary" size="lg" icon="create" @click="startCreating">
          Start creating
        </AppButton>
        <AppButton variant="secondary" size="lg" icon="projects" @click="router.navigate('/projects')">
          View projects
        </AppButton>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- The five steps, explained up front                                -->
    <!-- ================================================================ -->
    <section aria-labelledby="home-how-heading">
      <h2 id="home-how-heading" class="text-base font-semibold">How it works</h2>

      <ol class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
        <li
          v-for="(step, index) in FLOW_STEPS"
          :key="step.id"
          class="rounded-2xl border border-line bg-surface p-3"
        >
          <span
            class="grid size-7 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand-ink"
            aria-hidden="true"
          >
            {{ index + 1 }}
          </span>
          <p class="mt-2 text-sm font-medium">{{ step.label }}</p>
          <p class="mt-0.5 text-xs text-muted">{{ step.hint }}</p>
        </li>
      </ol>
    </section>

    <!-- ================================================================ -->
    <!-- Recent work                                                       -->
    <!-- ================================================================ -->
    <section aria-labelledby="home-recent-heading">
      <div class="flex items-center justify-between">
        <h2 id="home-recent-heading" class="text-base font-semibold">Continue where you left off</h2>
        <button
          type="button"
          class="inline-flex min-h-11 items-center gap-1 rounded-full text-sm font-medium text-brand hover:underline"
          @click="router.navigate('/projects')"
        >
          See all
          <AppIcon name="chevronRight" :size="16" />
        </button>
      </div>

      <ul class="mt-3 grid gap-3 sm:grid-cols-3">
        <li v-for="project in recent" :key="project.id">
          <article class="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            <PlaceholderArt
              :image-url="project.imageUrl || ''"
              :gradient="gradientFor(project.type, project.scenes)"
              :alt="project.alt || `Artwork for ${project.title}`"
              rounded="rounded-none"
              class="aspect-video w-full"
            />
            <div class="p-3">
              <h3 class="truncate text-sm font-semibold">{{ project.title }}</h3>
              <p class="mt-0.5 text-xs text-muted">
                {{ project.scenes }} scenes · {{ project.updated }}
              </p>
              <!-- A determinate progress bar: this is real information about a
                   saved project, not a fake loading indicator. -->
              <div class="mt-2.5">
                <div class="flex items-center justify-between text-[11px] text-muted">
                  <span>Progress</span>
                  <span>{{ project.progress }}%</span>
                </div>
                <div
                  class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line"
                  role="progressbar"
                  :aria-valuenow="project.progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-label="`${project.title} progress`"
                >
                  <div class="h-full rounded-full bg-brand" :style="{ width: `${project.progress}%` }" />
                </div>
              </div>
            </div>
          </article>
        </li>
      </ul>
    </section>
  </div>
</template>
