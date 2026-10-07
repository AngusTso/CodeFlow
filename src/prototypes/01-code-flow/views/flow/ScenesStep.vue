<script setup>
/**
 * ScenesStep.vue — step 3: the Scene Generation module (assignment module 2).
 * ---------------------------------------------------------------------------
 * The assignment asks this module to provide:
 *   • "Visual selection of scene types"     → the Scene type grid below
 *   • "Parameter controls: lighting, colour palette, mood, camera angle, style"
 *   • "Preview area showing AI-generated scene drafts with regeneration options"
 *
 * So this screen is a single-shot workbench: pick a shot on the left, tune it in
 * the middle, watch the preview update, then regenerate.
 *
 * Parameters are staged in a local draft and applied with one button, which
 * avoids firing a generation on every chip click (see DESIGN_PROTOTYPE1 §5).
 */

import { computed, ref, watch } from 'vue'
import {
  CAMERAS,
  LIGHTING,
  MOODS,
  SCENE_TYPES,
  STYLES,
} from '../../../../shared/data/mockData.js'
import { useStore } from '../../composables.js'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import PlaceholderArt from '../../components/ui/PlaceholderArt.vue'

const store = useStore()

const busy = computed(() => store.state.isGenerating)
const scenes = computed(() => store.scenes.value)

/** Which scene is being tuned. */
const selectedId = ref(scenes.value[0]?.id || '')

// Keep the selection valid if scenes are added, deleted or regenerated.
watch(scenes, (list) => {
  if (!list.some((scene) => scene.id === selectedId.value)) {
    selectedId.value = list[0]?.id || ''
  }
})

/** The scene currently being edited. */
const selectedScene = computed(
  () => scenes.value.find((scene) => scene.id === selectedId.value) || null,
)

/** Staged parameter values (applied only when the user regenerates). */
const draft = ref({})

// Re-seed the draft whenever a different scene is selected.
watch(
  selectedScene,
  (scene) => {
    if (!scene) return
    draft.value = {
      type: scene.type,
      lighting: scene.lighting,
      mood: scene.mood,
      camera: scene.camera,
      style: scene.style,
    }
  },
  { immediate: true },
)

/**
 * The parameter groups rendered as chip rows. Keeping them as data (rather than
 * four near-identical blocks of markup) is what makes this screen short enough
 * to actually read.
 */
const groups = computed(() => [
  { key: 'lighting', label: 'Lighting', options: LIGHTING, icon: 'sun' },
  { key: 'mood', label: 'Mood', options: MOODS, icon: 'wand' },
  { key: 'camera', label: 'Camera angle', options: CAMERAS, icon: 'camera' },
  { key: 'style', label: 'Visual style', options: STYLES, icon: 'image' },
])

/** True when the staged draft differs from what the scene currently uses. */
const hasChanges = computed(() => {
  if (!selectedScene.value) return false
  return Object.entries(draft.value).some(([key, value]) => selectedScene.value[key] !== value)
})

/** Stage a single parameter value. */
function setParam(key, value) {
  draft.value = { ...draft.value, [key]: value }
}

/** Apply the staged parameters and let the AI redraw the shot. */
async function regenerate() {
  if (!selectedScene.value) return
  await store.applySceneParams(selectedScene.value.id, { ...draft.value })
}

/** Reset the draft back to the scene's current values. */
function discardChanges() {
  if (!selectedScene.value) return
  draft.value = {
    type: selectedScene.value.type,
    lighting: selectedScene.value.lighting,
    mood: selectedScene.value.mood,
    camera: selectedScene.value.camera,
    style: selectedScene.value.style,
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Defensive empty state (should not normally be reachable). -->
    <div
      v-if="!selectedScene"
      class="rounded-3xl border border-dashed border-line bg-surface p-10 text-center"
      role="status"
    >
      <p class="font-medium">No scenes to tune yet</p>
      <p class="mt-1 text-sm text-muted">Go back a step and generate a storyboard first.</p>
    </div>

    <template v-else>
      <!-- ============================================================== -->
      <!-- 1. Choose a scene                                              -->
      <!-- ============================================================== -->
      <section aria-labelledby="scene-picker-heading">
        <h2 id="scene-picker-heading" class="text-sm font-medium text-muted">Choose a scene</h2>

        <ul class="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <li v-for="(scene, index) in scenes" :key="scene.id" class="shrink-0">
            <button
              type="button"
              class="w-40 rounded-2xl border p-1.5 text-left transition-colors"
              :class="
                scene.id === selectedId
                  ? 'border-brand bg-brand-soft'
                  : 'border-line bg-surface hover:border-brand/40'
              "
              :aria-current="scene.id === selectedId ? 'true' : undefined"
              :aria-label="`Tune scene ${index + 1}: ${scene.title}`"
              @click="selectedId = scene.id"
            >
              <PlaceholderArt
                :image-url="scene.imageUrl || ''"
                :gradient="scene.gradient"
                :alt="scene.alt"
                rounded="rounded-xl"
                class="aspect-video w-full"
              />
              <span class="mt-1.5 block truncate px-0.5 text-xs font-medium">
                {{ index + 1 }}. {{ scene.title }}
              </span>
            </button>
          </li>
        </ul>
      </section>

      <!-- ============================================================== -->
      <!-- 2. Preview the current shot                                    -->
      <!-- ============================================================== -->
      <section
        class="rounded-3xl border border-line bg-surface p-3 shadow-sm"
        aria-labelledby="scene-preview-heading"
      >
        <h2 id="scene-preview-heading" class="sr-only">Scene preview</h2>

        <PlaceholderArt
          :image-url="selectedScene.imageUrl || ''"
          :gradient="selectedScene.gradient"
          :alt="selectedScene.alt"
          class="aspect-video w-full"
        />

        <div class="px-1 pt-3">
          <div class="flex items-baseline gap-2">
            <h3 class="text-base font-semibold">{{ selectedScene.title }}</h3>
            <span class="ml-auto shrink-0 text-xs text-muted">
              {{ selectedScene.duration }}s · {{ selectedScene.typeLabel }}
            </span>
          </div>
          <p class="mt-1 text-sm text-muted">{{ selectedScene.prompt }}</p>
        </div>
      </section>

      <!-- ============================================================== -->
      <!-- 3. Scene type — VISUAL selection (assignment module 2)          -->
      <!-- ============================================================== -->
      <fieldset class="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <legend class="px-1 text-sm font-medium">Scene type</legend>

        <div class="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          <button
            v-for="type in SCENE_TYPES"
            :key="type.id"
            type="button"
            class="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-xs font-medium transition-colors"
            :class="
              draft.type === type.id
                ? 'border-brand bg-brand-soft text-brand-ink'
                : 'border-line bg-canvas text-muted hover:border-brand/40 hover:text-ink'
            "
            :aria-pressed="draft.type === type.id"
            @click="setParam('type', type.id)"
          >
            <span class="text-2xl" aria-hidden="true">{{ type.glyph }}</span>
            {{ type.label }}
          </button>
        </div>
      </fieldset>

      <!-- ============================================================== -->
      <!-- 4. Parameter controls (lighting, mood, camera, style)           -->
      <!-- ============================================================== -->
      <fieldset
        v-for="group in groups"
        :key="group.key"
        class="rounded-3xl border border-line bg-surface p-4 shadow-sm"
      >
        <legend class="px-1">
          <span class="inline-flex items-center gap-1.5 text-sm font-medium">
            <AppIcon :name="group.icon" :size="16" />
            {{ group.label }}
          </span>
        </legend>

        <ul class="mt-3 flex flex-wrap gap-2">
          <li v-for="option in group.options" :key="option.id">
            <button
              type="button"
              class="min-h-11 rounded-full border px-3.5 text-sm font-medium transition-colors"
              :class="
                draft[group.key] === option.id
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-canvas text-muted hover:text-ink'
              "
              :aria-pressed="draft[group.key] === option.id"
              @click="setParam(group.key, option.id)"
            >
              {{ option.label }}
            </button>
          </li>
        </ul>
      </fieldset>

      <!-- ============================================================== -->
      <!-- 5. Apply the draft                                             -->
      <!-- ============================================================== -->
      <div class="rounded-3xl border border-line bg-surface p-4 shadow-sm">
        <p class="text-sm text-muted">
          {{
            hasChanges
              ? 'You have unsaved tweaks. Regenerate to let AI redraw this shot with them.'
              : 'These settings match the current shot.'
          }}
        </p>

        <div class="mt-3 flex flex-wrap gap-2">
          <AppButton variant="secondary" :disabled="!hasChanges || busy" @click="discardChanges">
            Discard
          </AppButton>

          <AppButton
            class="flex-1"
            variant="primary"
            icon="refresh"
            :loading="busy"
            :disabled="!hasChanges"
            @click="regenerate"
          >
            Regenerate this scene
          </AppButton>
        </div>
      </div>
    </template>
  </div>
</template>
