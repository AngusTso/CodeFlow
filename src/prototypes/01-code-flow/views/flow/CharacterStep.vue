<script setup>
/**
 * CharacterStep.vue — step 4: the Character Generator (assignment module 3).
 * ---------------------------------------------------------------------------
 * The assignment asks for: AI-suggested templates, customisation of appearance
 * / clothing / expression / pose, and "integration with scenes" — i.e. showing
 * how the character fits into a generated environment.
 *
 * So this screen has three parts:
 *   1. AI template cards      → generate a character from an archetype
 *   2. Your cast              → customise or remove generated characters
 *   3. In-scene preview       → the character dropped into the first scene
 */

import { computed, ref } from 'vue'
import { CHARACTER_TEMPLATES } from '../../../../shared/data/mockData.js'
import { useStore } from '../../composables.js'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import AppModal from '../../components/ui/AppModal.vue'
import CharacterCard from '../../components/cards/CharacterCard.vue'
import CharacterEditor from '../../components/editor/CharacterEditor.vue'
import PlaceholderArt from '../../components/ui/PlaceholderArt.vue'

const store = useStore()

const busy = computed(() => store.state.isGenerating)
const characters = computed(() => store.characters.value)
const scenes = computed(() => store.scenes.value)

/** Id of the character open in the editor sheet ('' = closed). */
const editingId = ref('')

/** Character awaiting delete confirmation. */
const pendingDelete = ref(null)

/** The character being edited, resolved from the live list. */
const editingCharacter = computed(
  () => characters.value.find((character) => character.id === editingId.value) || null,
)

/** The scene used for the "in scene" preview (the first shot). */
const previewScene = computed(() => scenes.value[0] || null)

/** Generate a character from a template, then open it for customising. */
async function addFromTemplate(template) {
  const created = await store.addCharacter(template.id)
  if (created) editingId.value = created.id
}

/** Open the customisation sheet. */
function openEditor(character) {
  editingId.value = character.id
}

/** Close the sheet. */
function closeEditor() {
  editingId.value = ''
}

/** Persist customisations. */
function saveCharacter(patch) {
  if (editingId.value) store.updateCharacter(editingId.value, patch)
}

/**
 * "Suggest another look": generate a fresh character from the same template and
 * replace the current one. Implemented with the existing store actions
 * (generate + remove) so no extra store API is needed; done in that order so
 * the cast is never momentarily empty.
 */
async function suggestAnother(templateId) {
  const current = editingCharacter.value
  if (!current) return

  const replacement = await store.addCharacter(templateId)
  if (!replacement) return

  store.deleteCharacter(current.id)
  editingId.value = replacement.id
}

/** Ask before removing a character. */
function requestDelete(character) {
  // Close the editor sheet first so the confirmation is the only open dialog
  // (see the same comment in StoryboardStep.vue).
  editingId.value = ''
  pendingDelete.value = character
}

/** Perform the confirmed removal. */
function confirmDelete() {
  if (pendingDelete.value) {
    store.deleteCharacter(pendingDelete.value.id)
    if (editingId.value === pendingDelete.value.id) editingId.value = ''
  }
  pendingDelete.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- ================================================================ -->
    <!-- 1. AI-suggested templates                                         -->
    <!-- ================================================================ -->
    <section aria-labelledby="character-templates-heading">
      <h2 id="character-templates-heading" class="text-lg font-semibold tracking-tight">
        Pick a character to start
      </h2>
      <p class="mt-1 text-sm text-muted">
        These are AI suggestions. You can change the details right after.
      </p>

      <ul class="mt-4 grid gap-3 sm:grid-cols-2">
        <li v-for="template in CHARACTER_TEMPLATES" :key="template.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-3xl border border-line bg-surface p-3 text-left shadow-sm transition-colors hover:border-brand/40 disabled:opacity-60"
            :disabled="busy"
            :aria-label="`Generate a ${template.archetype} character`"
            @click="addFromTemplate(template)"
          >
            <PlaceholderArt
              :image-url="template.imageUrl || ''"
              :gradient="`linear-gradient(135deg, ${template.palette[0]} 0%, ${template.palette[1]} 100%)`"
              :glyph="template.glyph"
              :alt="template.alt || `Preview artwork for the ${template.archetype} template`"
              rounded="rounded-2xl"
              class="size-16 shrink-0"
            />

            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold text-ink">{{ template.archetype }}</span>
              <span class="mt-0.5 block text-xs text-muted">{{ template.description }}</span>
            </span>

            <AppIcon name="plus" :size="18" class="shrink-0 text-brand" />
          </button>
        </li>
      </ul>
    </section>

    <!-- ================================================================ -->
    <!-- 2. Your cast                                                      -->
    <!-- ================================================================ -->
    <section aria-labelledby="character-cast-heading">
      <h2 id="character-cast-heading" class="text-lg font-semibold tracking-tight">Your cast</h2>

      <ul v-if="characters.length" class="mt-4 grid gap-3 sm:grid-cols-2">
        <li v-for="character in characters" :key="character.id">
          <CharacterCard
            :character="character"
            :busy="busy"
            @edit="openEditor(character)"
            @delete="requestDelete(character)"
          />
        </li>
      </ul>

      <p
        v-else
        class="mt-4 rounded-3xl border border-dashed border-line bg-surface p-6 text-center text-sm text-muted"
        role="status"
      >
        No characters yet. Generating one is optional — your video works without it.
      </p>
    </section>

    <!-- ================================================================ -->
    <!-- 3. Integration with scenes (assignment: "show how characters fit") -->
    <!-- ================================================================ -->
    <section v-if="previewScene" aria-labelledby="character-preview-heading">
      <h2 id="character-preview-heading" class="text-lg font-semibold tracking-tight">
        How they look in your video
      </h2>
      <p class="mt-1 text-sm text-muted">
        Scene {{ previewScene.order }}: {{ previewScene.title }}
      </p>

      <div class="relative mt-3 overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <PlaceholderArt
          :image-url="previewScene.imageUrl || ''"
          :gradient="previewScene.gradient"
          :alt="`${previewScene.alt} Scene ${previewScene.order}: ${previewScene.title}.`"
          rounded="rounded-none"
          class="aspect-video w-full"
        />

        <!-- Characters composited over the scene. -->
        <ul
          v-if="characters.length"
          class="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2"
          aria-label="Characters placed in this scene"
        >
          <li
            v-for="character in characters"
            :key="character.id"
            class="flex items-center gap-2 rounded-full bg-surface/95 py-1 pl-1 pr-3 shadow-sm backdrop-blur"
          >
            <PlaceholderArt
              :image-url="character.imageUrl || ''"
              :gradient="character.gradient"
              :alt="character.alt"
              rounded="rounded-full"
              class="size-7 shrink-0"
            />
            <span class="text-xs font-medium">{{ character.name }}</span>
          </li>
        </ul>

        <p
          v-else
          class="absolute inset-x-3 bottom-3 rounded-full bg-surface/95 px-3 py-1.5 text-center text-xs text-muted shadow-sm backdrop-blur"
        >
          No characters placed yet
        </p>
      </div>
    </section>

    <!-- ================================================================ -->
    <!-- Sheets and dialogs                                                -->
    <!-- ================================================================ -->
    <CharacterEditor
      :character="editingCharacter"
      :busy="busy"
      @close="closeEditor"
      @update="saveCharacter"
      @suggest="suggestAnother"
    />

    <AppModal
      :open="Boolean(pendingDelete)"
      tone="danger"
      :title="pendingDelete ? `Remove ${pendingDelete.name}?` : 'Remove character?'"
      message="The character is removed from this video. Your scenes stay exactly as they are."
      confirm-label="Remove character"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>
