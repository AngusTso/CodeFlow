<script setup>
/**
 * StoryboardStep.vue — step 2: review and reorder the whole sequence.
 * ---------------------------------------------------------------------------
 * DIVISION OF LABOUR between steps 2 and 3 (they could easily overlap):
 *   • Storyboard (this file) is about SEQUENCE — the order of shots, deleting
 *     shots, adding shots. It shows the whole video at once.
 *   • Scenes (step 3) is about one SHOT's parameters — scene type, lighting,
 *     camera, style — with a large preview.
 *
 * That keeps each screen with one clear job, which is the point of
 * DESIGN_PROTOTYPE1's "guided first, flexible later" workflow.
 *
 * This file wires <SceneTimeline> (browse/reorder) to <SceneEditor> (a bottom
 * sheet), and asks for confirmation before anything destructive via <AppModal>.
 */

import { computed, ref } from 'vue'
import { useStore } from '../../composables.js'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import AppModal from '../../components/ui/AppModal.vue'
import SceneTimeline from '../../components/storyboard/SceneTimeline.vue'
import SceneEditor from '../../components/editor/SceneEditor.vue'

const store = useStore()

const busy = computed(() => store.state.isGenerating)
const scenes = computed(() => store.scenes.value)
const logline = computed(() => store.state.project.storyboard.logline)

/** Id of the scene open in the editor sheet ('' = closed). */
const editingId = ref('')

/** Scene awaiting delete confirmation (null = no dialog). */
const pendingDelete = ref(null)

/** The scene object currently being edited, resolved from the live list. */
const editingScene = computed(
  () => scenes.value.find((scene) => scene.id === editingId.value) || null,
)

/** Title for the confirmation dialog. */
const deleteTitle = computed(() =>
  pendingDelete.value ? `Delete scene ${pendingDelete.value.order}?` : 'Delete scene?',
)

/** Open the editor sheet for a scene. */
function openEditor(scene) {
  editingId.value = scene.id
}

/** Close the editor sheet. */
function closeEditor() {
  editingId.value = ''
}

/** Move a scene one position earlier/later (accessible alternative to drag). */
function moveUp(scene) {
  store.moveScene(scene.id, -1)
}

/** Move a scene one position later. */
function moveDown(scene) {
  store.moveScene(scene.id, 1)
}

/** Absolute-position reorder, emitted by the drag interaction. */
function reorder(fromIndex, toIndex) {
  store.moveSceneTo(fromIndex, toIndex)
}

/** Ask the AI for a fresh take on one scene. */
function regenerate(scene) {
  store.regenerateSceneById(scene.id)
}

/** Open the delete confirmation. */
function requestDelete(scene) {
  // Close the editor sheet first (when the request came from inside it) so the
  // confirmation is the ONLY open dialog. Two stacked dialogs would fight over
  // the focus trap and the page's scroll lock.
  editingId.value = ''
  pendingDelete.value = scene
}

/** Perform the confirmed delete. */
function confirmDelete() {
  if (pendingDelete.value) {
    store.deleteScene(pendingDelete.value.id)
    if (editingId.value === pendingDelete.value.id) editingId.value = ''
  }
  pendingDelete.value = null
}

/** Save edits without regenerating. */
function saveScene(patch) {
  if (!editingId.value) return

  // Duration has its own store action so it can be flagged as user-chosen.
  const { duration, ...rest } = patch
  if (typeof duration === 'number') store.setSceneDuration(editingId.value, duration)
  store.updateScene(editingId.value, rest)
}

/** Save edits AND regenerate the shot with the new parameters. */
async function applyScene(patch) {
  if (!editingId.value) return
  await store.applySceneParams(editingId.value, patch)
  closeEditor()
}

/** Append a new AI-generated scene. */
async function addScene() {
  const created = await store.addScene()
  if (created) editingId.value = created.id
}

/** Re-run generation for the whole storyboard. */
async function redrawAll() {
  await store.generateStoryboard()
}
</script>

<template>
  <div class="space-y-5">
    <!-- ================================================================ -->
    <!-- Summary + whole-storyboard action                                 -->
    <!-- ================================================================ -->
    <section class="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <div class="flex flex-wrap items-start gap-3">
        <div class="min-w-0 flex-1">
          <h2 class="text-lg font-semibold tracking-tight">Your storyboard</h2>
          <p v-if="logline" class="mt-1 text-sm text-muted">{{ logline }}</p>
          <p class="mt-1 text-sm text-muted">
            {{ scenes.length }} scenes · {{ store.totalSeconds.value }} seconds total
          </p>
        </div>

        <AppButton variant="secondary" icon="refresh" :loading="busy" @click="redrawAll">
          Redraw all
        </AppButton>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- Cards / overview                                                  -->
    <!-- ================================================================ -->
    <SceneTimeline
      v-if="scenes.length"
      :scenes="scenes"
      :busy="busy"
      :selected-id="editingId"
      @open="openEditor"
      @move-up="moveUp"
      @move-down="moveDown"
      @regenerate="regenerate"
      @delete="requestDelete"
      @reorder="reorder"
    />

    <div v-else class="rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
      <p class="font-medium">No scenes yet</p>
      <p class="mt-1 text-sm text-muted">Generate a storyboard from your idea to begin.</p>
    </div>

    <!-- ================================================================ -->
    <!-- Add scene                                                         -->
    <!-- ================================================================ -->
    <AppButton block variant="secondary" icon="plus" :loading="busy" @click="addScene">
      Add another scene
    </AppButton>

    <p class="flex items-start gap-2 rounded-2xl bg-brand-soft p-3 text-sm text-brand-ink">
      <AppIcon name="info" :size="18" class="mt-0.5" />
      <span>
        Drag a row in <strong>Overview</strong> to reorder, or use the up/down buttons — whichever
        suits you.
      </span>
    </p>

    <!-- Scene editor (bottom sheet on mobile, centred dialog on desktop). -->
    <SceneEditor
      :scene="editingScene"
      :busy="busy"
      @close="closeEditor"
      @update="saveScene"
      @apply="applyScene"
      @delete="requestDelete(editingScene)"
    />

    <!-- Destructive-action confirmation. -->
    <AppModal
      :open="Boolean(pendingDelete)"
      tone="danger"
      :title="deleteTitle"
      message="This removes the scene and shortens your video. It cannot be undone."
      confirm-label="Delete scene"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>
