<script setup>
/**
 * CharacterEditor.vue — the character customisation sheet (AGENTS.md
 * "CharacterEditor"; assignment module 3).
 * ---------------------------------------------------------------------------
 * The assignment asks for: appearance, clothing, expressions and poses, plus
 * AI-suggested templates. This sheet covers all four using native form
 * controls (select/input), which are keyboard operable and screen-reader
 * friendly without custom widget code.
 */

import { computed, ref, watch } from 'vue'
import {
  CHARACTER_EXPRESSIONS,
  CHARACTER_OUTFITS,
  CHARACTER_POSES,
  CHARACTER_TEMPLATES,
} from '../../../../shared/data/mockData.js'
import AppBottomSheet from '../ui/AppBottomSheet.vue'
import AppButton from '../ui/AppButton.vue'
import PlaceholderArt from '../ui/PlaceholderArt.vue'

const props = defineProps({
  /** The character being edited, or null when closed. */
  character: { type: Object, default: null },
  /** Disables controls while the AI is generating. */
  busy: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'update', 'suggest'])

const open = computed(() => Boolean(props.character))

/** Local working copy of the editable fields. */
const draft = ref(null)

watch(
  () => props.character,
  (character) => {
    if (!character) {
      draft.value = null
      return
    }

    draft.value = {
      name: character.name,
      outfit: character.outfit,
      expression: character.expression,
      pose: character.pose,
    }
  },
  { immediate: true },
)

/** Save the draft back to the character. */
function save() {
  if (!draft.value) return
  emit('update', { ...draft.value })
  emit('close')
}

/** Ask the AI for a different look, keeping the chosen template. */
function suggestAnother() {
  if (!props.character) return
  emit('suggest', props.character.templateId)
}
</script>

<template>
  <AppBottomSheet
    :open="open"
    :title="props.character ? `Customise ${props.character.name}` : 'Customise character'"
    :description="props.character ? props.character.archetype : ''"
    @close="emit('close')"
  >
    <template v-if="draft && props.character">
      <PlaceholderArt
        :image-url="props.character.imageUrl || ''"
        :gradient="props.character.gradient"
        :alt="props.character.alt"
        class="aspect-square w-32"
        rounded="rounded-2xl"
      />

      <div class="mt-4 space-y-4">
        <!-- Name ------------------------------------------------------- -->
        <div>
          <label class="field-label" for="character-name">Name</label>
          <input id="character-name" v-model="draft.name" type="text" class="field mt-1" />
        </div>

        <!-- Outfit ----------------------------------------------------- -->
        <div>
          <label class="field-label" for="character-outfit">Clothing</label>
          <select id="character-outfit" v-model="draft.outfit" class="field mt-1">
            <option v-for="option in CHARACTER_OUTFITS" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <!-- Expression ------------------------------------------------- -->
        <div>
          <label class="field-label" for="character-expression">Expression</label>
          <select id="character-expression" v-model="draft.expression" class="field mt-1">
            <option v-for="option in CHARACTER_EXPRESSIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <!-- Pose ------------------------------------------------------- -->
        <div>
          <label class="field-label" for="character-pose">Pose</label>
          <select id="character-pose" v-model="draft.pose" class="field mt-1">
            <option v-for="option in CHARACTER_POSES" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <!-- Template refresher: reminds the user which AI archetype is in
             play without offering a destructive mid-edit switch. -->
        <div class="rounded-2xl bg-brand-soft p-3 text-sm text-brand-ink">
          <p class="font-medium">Based on the “{{ props.character.archetype }}” template</p>
          <p class="mt-0.5 text-xs">
            Want a different archetype? Close this panel and pick another template card.
          </p>
        </div>
      </div>
    </template>

    <!-- Persistent actions --------------------------------------------- -->
    <template #actions>
      <AppButton
        variant="secondary"
        icon="wand"
        :loading="props.busy"
        @click="suggestAnother"
      >
        Suggest another look
      </AppButton>

      <AppButton class="ml-auto" variant="primary" :disabled="props.busy" @click="save">
        Save
      </AppButton>
    </template>
  </AppBottomSheet>
</template>
