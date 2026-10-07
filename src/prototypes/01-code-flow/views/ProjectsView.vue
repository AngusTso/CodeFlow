<script setup>
/**
 * ProjectsView.vue — the library of saved videos (global "Projects" tab).
 * ---------------------------------------------------------------------------
 * The prototype persists nothing, so the list is mock data. Its job is to prove
 * the screen works: filtering is keyboard operable, each item is a real link,
 * and the empty state is handled rather than ignored.
 */

import { computed, ref } from 'vue'
import { SAMPLE_PROJECTS, SCENE_TYPES, gradientFor } from '../../../shared/data/mockData.js'
import { useRouter } from '../composables.js'
import AppButton from '../components/ui/AppButton.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import PlaceholderArt from '../components/ui/PlaceholderArt.vue'

const router = useRouter()

/** Currently selected filter id ('all' or a scene type). */
const activeFilter = ref('all')

/** Filter chips: "All" plus one per scene type. */
const filters = computed(() => [
  { id: 'all', label: 'All videos' },
  ...SCENE_TYPES.map((type) => ({ id: type.id, label: type.label })),
])

/** Projects matching the current filter. */
const visibleProjects = computed(() =>
  activeFilter.value === 'all'
    ? SAMPLE_PROJECTS
    : SAMPLE_PROJECTS.filter((project) => project.type === activeFilter.value),
)

/** Start a new video. */
function startCreating() {
  router.navigate('/flow/idea')
}
</script>

<template>
  <div class="space-y-5">
    <!-- ================================================================ -->
    <!-- Header row + primary action                                       -->
    <!-- ================================================================ -->
    <div class="flex flex-wrap items-center gap-3">
      <p class="text-sm text-muted">
        {{ visibleProjects.length }} of {{ SAMPLE_PROJECTS.length }} videos
      </p>
      <AppButton class="ml-auto" variant="primary" icon="plus" @click="startCreating">
        New video
      </AppButton>
    </div>

    <!-- ================================================================ -->
    <!-- Filters                                                           -->
    <!-- ================================================================ -->
    <div role="group" aria-label="Filter projects by scene type" class="flex flex-wrap gap-2">
      <button
        v-for="option in filters"
        :key="option.id"
        type="button"
        class="min-h-11 rounded-full border px-3.5 text-sm font-medium transition-colors"
        :class="
          activeFilter === option.id
            ? 'border-brand bg-brand text-white'
            : 'border-line bg-surface text-muted hover:text-ink'
        "
        :aria-pressed="activeFilter === option.id"
        @click="activeFilter = option.id"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- ================================================================ -->
    <!-- Project grid / empty state                                        -->
    <!-- ================================================================ -->
    <ul v-if="visibleProjects.length" class="grid gap-3 sm:grid-cols-2">
      <li v-for="project in visibleProjects" :key="project.id">
        <article class="flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <PlaceholderArt
            :image-url="project.imageUrl || ''"
            :gradient="gradientFor(project.type, project.scenes)"
            :alt="project.alt || `Artwork for ${project.title}`"
            rounded="rounded-none"
            class="aspect-video w-full"
          />

          <div class="flex flex-1 flex-col p-4">
            <h3 class="text-base font-semibold leading-snug">{{ project.title }}</h3>
            <p class="mt-0.5 text-xs text-muted">
              {{ project.scenes }} scenes · {{ project.updated }}
            </p>

            <div class="mt-3">
              <div
                class="h-1.5 w-full overflow-hidden rounded-full bg-line"
                role="progressbar"
                :aria-valuenow="project.progress"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`${project.title} progress`"
              >
                <div class="h-full rounded-full bg-brand" :style="{ width: `${project.progress}%` }" />
              </div>
            </div>

            <div class="mt-auto flex items-center gap-2 pt-4">
              <AppButton variant="secondary" size="sm" icon="play" @click="startCreating">
                Continue
              </AppButton>
              <AppButton variant="ghost" size="sm" icon="share">Share</AppButton>
            </div>
          </div>
        </article>
      </li>
    </ul>

    <!-- Empty state: never leave the user staring at nothing. -->
    <div
      v-else
      class="rounded-3xl border border-dashed border-line bg-surface p-10 text-center"
      role="status"
    >
      <span class="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand" aria-hidden="true">
        <AppIcon name="projects" :size="24" />
      </span>
      <p class="mt-3 font-medium">No videos in this category yet</p>
      <p class="mt-1 text-sm text-muted">Try another filter, or start something new.</p>
      <AppButton class="mt-4" variant="primary" icon="plus" @click="startCreating">
        Start a video
      </AppButton>
    </div>
  </div>
</template>
