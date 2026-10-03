<script setup>
/**
 * SceneEditor.vue — the scene editing bottom sheet (AGENTS.md "SceneEditor";
 * DESIGN_PROTOTYPE1 §5, assignment module 2).
 * ---------------------------------------------------------------------------
 * PROGRESSIVE DISCLOSURE
 *   The design doc is explicit: casual creators should first see only the few
 *   controls that matter, with advanced parameters tucked away. So:
 *     • Duration, mood and camera are always visible.
 *     • Type, style, lighting and transition live behind "More options".
 *
 * STAGED EDITS
 *   Parameters are edited into a local DRAFT. Nothing is applied until the user
 *   presses "Save changes" (keeps the new settings) or "Regenerate scene"
 *   (applies them AND asks the AI for a fresh draft with them). This avoids
 *   firing an expensive generation on every slider twitch.
 */

import { computed, ref, watch } from 'vue'
import {
  CAMERAS,
  LIGHTING,
  MOODS,
  SCENE_TYPES,
  STYLES,
  TRANSITIONS,
} from '../../../../shared/data/mockData.js'
import AppBottomSheet from '../ui/AppBottomSheet.vue'
import AppButton from '../ui/AppButton.vue'
import PlaceholderArt from '../ui/PlaceholderArt.vue'

const props = defineProps({
  /** The scene being edited, or null when the sheet is closed. */
  scene: { type: Object, default: null },
  /** Disables every control while the AI is generating. */
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'update', 'apply', 'delete'])

/** The sheet is open whenever a scene is supplied. */
const open = computed(() => Boolean(props.scene))

/** Advanced parameters are hidden until requested (progressive disclosure). */
const showAdvanced = ref(false)

/** Local working copy of the editable fields. */
const draft = ref(null)

// Re-seed the draft whenever a different scene is opened, so edits never leak
// from one scene into another.
watch(
  () => props.scene,
  (scene) => {
    if (!scene) {
      draft.value = null
      return
    }

    draft.value = {
      title: scene.title,
      prompt: scene.prompt,
      type: scene.type,
      mood: scene.mood,
      camera: scene.camera,
      style: scene.style,
      lighting: scene.lighting,
      transition: scene.transition,
      duration: scene.duration,
    }

    showAdvanced.value = false
  },
  { immediate: true },
)

/** Accessible title for the sheet. */
const sheetTitle = computed(() => {
  if (!props.scene) return 'Edit scene'
  return `Scene ${props.scene.order}: ${props.scene.title}`
})

/** Save the draft WITHOUT regenerating (fast, no AI call). */
function save() {
  if (!draft.value) return
  emit('update', { ...draft.value })
  emit('close')
}

/** Save the draft AND regenerate the artwork/text with the new parameters. */
function regenerate() {
  if (!draft.value) return
  emit('apply', { ...draft.value })
}
</script>

<template>
  <AppBottomSheet
    :open="open"
    :title="sheetTitle"
    description="Tune this shot, then let AI redraw it."
    @close="emit('close')"
  >
    <template v-if="draft && props.scene">
      <!-- Live preview of the placeholder artwork for the current settings. -->
      <PlaceholderArt
        :image-url="props.scene.imageUrl || ''"
        :gradient="props.scene.gradient"
        :alt="props.scene.alt"
        class="aspect-video w-full"
      />

      <div class="mt-4 space-y-4">
        <!-- Title ------------------------------------------------------ -->
        <div>
          <label class="field-label" for="scene-title">Title</label>
          <input id="scene-title" v-model="draft.title" type="text" class="field mt-1" />
        </div>

        <!-- Prompt ----------------------------------------------------- -->
        <div>
          <label class="field-label" for="scene-prompt">What should happen in this shot?</label>
          <textarea id="scene-prompt" v-model="draft.prompt" rows="3" class="field mt-1" />
          <p class="field-hint">This text is what the AI is asked to visualise.</p>
        </div>

        <!-- Duration --------------------------------------------------- -->
        <div>
          <div class="flex items-center justify-between">
            <label class="field-label" for="scene-duration">Duration</label>
            <!-- The value is repeated as text so it is never conveyed by the
                 slider position alone. -->
            <span class="text-sm font-medium text-brand">{{ draft.duration }}s</span>
          </div>
          <input
            id="scene-duration"
            v-model.number="draft.duration"
            type="range"
            min="2"
            max="10"
            step="1"
            class="mt-2 h-2 w-full cursor-pointer accent-brand"
          />
        </div>

        <!-- Mood + camera ---------------------------------------------- -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="field-label" for="scene-mood">Mood</label>
            <select id="scene-mood" v-model="draft.mood" class="field mt-1">
              <option v-for="option in MOODS" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="field-label" for="scene-camera">Camera</label>
            <select id="scene-camera" v-model="draft.camera" class="field mt-1">
              <option v-for="option in CAMERAS" :key="option.id" :value="option.id">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Advanced parameters (progressive disclosure, §5) ------------ -->
        <div>
          <button
            type="button"
            class="inline-flex min-h-11 items-center gap-1.5 rounded-full text-sm font-medium text-brand hover:underline"
            :aria-expanded="showAdvanced"
            aria-controls="scene-advanced"
            @click="showAdvanced = !showAdvanced"
          >
            {{ showAdvanced ? 'Hide more options' : 'More options' }}
          </button>

          <!-- v-show keeps these controls in the DOM while collapsed, so
               `aria-controls` always points at a real element. -->
          <div v-show="showAdvanced" id="scene-advanced" class="mt-3 space-y-4">
            <div>
              <label class="field-label" for="scene-type">Scene type</label>
              <select id="scene-type" v-model="draft.type" class="field mt-1">
                <option v-for="option in SCENE_TYPES" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label" for="scene-style">Style</label>
                <select id="scene-style" v-model="draft.style" class="field mt-1">
                  <option v-for="option in STYLES" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="field-label" for="scene-lighting">Lighting</label>
                <select id="scene-lighting" v-model="draft.lighting" class="field mt-1">
                  <option v-for="option in LIGHTING" :key="option.id" :value="option.id">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="field-label" for="scene-transition">Transition into next scene</label>
              <select id="scene-transition" v-model="draft.transition" class="field mt-1">
                <option v-for="option in TRANSITIONS" :key="option.id" :value="option.id">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Persistent actions --------------------------------------------- -->
    <template #actions>
      <AppButton variant="danger" icon="trash" :disabled="props.busy" @click="emit('delete')">
        Delete
      </AppButton>

      <div class="ml-auto flex flex-wrap gap-2">
        <AppButton variant="secondary" :disabled="props.busy" @click="save">Save</AppButton>
        <AppButton variant="primary" icon="refresh" :loading="props.busy" @click="regenerate">
          Regenerate
        </AppButton>
      </div>
    </template>
  </AppBottomSheet>
</template>
