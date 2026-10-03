<script setup>
/**
 * IdeaStep.vue — step 1 of the creation flow: start an idea.
 * ---------------------------------------------------------------------------
 * DESIGN_PROTOTYPE1 §1 ("AI interaction: Wizard + Template Hybrid"):
 *
 *   Start Creating
 *        ├── Start from Template
 *        └── Describe Your Idea
 *                    ↓
 *              Guided Workflow
 *
 * Both doors lead into exactly the same guided flow. Templates exist so a
 * beginner is never blocked by a blank text box; free text exists so an
 * experienced user is never boxed in by our presets.
 *
 * Both options are shown side by side rather than behind a tab, because a tab
 * would hide half the choice on a phone — and the choice IS the point here.
 */

import { computed, ref, watch } from 'vue'
import { IDEA_SUGGESTIONS, VIDEO_TEMPLATES } from '../../../../shared/data/mockData.js'
import { useStore } from '../../composables.js'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import TemplateCard from '../../components/cards/TemplateCard.vue'

const store = useStore()

/** Local mirror of the idea text, seeded from the store on re-entry. */
const idea = ref(store.state.project.idea || '')

/** Whether a simulated AI job is running. */
const busy = computed(() => store.state.isGenerating)

/** Keep the store in sync as the user types (also updates the project title). */
watch(idea, (value) => store.setIdea(value))

/** Very short prompts produce poor storyboards, so we require a few words. */
const canGenerate = computed(() => idea.value.trim().length >= 4)

/** Fill the textarea from a suggestion chip. */
function useSuggestion(text) {
  idea.value = text
}

/** Generate a storyboard from the typed idea. */
async function generateFromIdea() {
  if (!canGenerate.value) return
  store.setIdea(idea.value)
  await store.generateStoryboard()
}

/** Generate from a template (also seeds the idea text). */
async function generateFromTemplate(template) {
  await store.startFromTemplate(template)
}
</script>

<template>
  <div class="space-y-6">
    <!-- ================================================================ -->
    <!-- Door 1: describe your idea                                        -->
    <!-- ================================================================ -->
    <section class="rounded-3xl border border-line bg-surface p-5 shadow-sm" aria-labelledby="idea-heading">
      <h2 id="idea-heading" class="text-lg font-semibold tracking-tight">Describe your idea</h2>
      <p class="mt-1 text-sm text-muted">
        One or two sentences is plenty. AI will turn it into scenes you can change later.
      </p>

      <label class="field-label mt-4" for="idea-input">Your video idea</label>
      <textarea
        id="idea-input"
        v-model="idea"
        rows="3"
        class="field mt-1"
        placeholder="A cyberpunk city at night with neon lights and rain..."
        :aria-describedby="canGenerate ? undefined : 'idea-hint'"
      />

      <p v-if="!canGenerate" id="idea-hint" class="field-hint">
        Add a few more words to get started.
      </p>

      <!-- Suggestion chips: they remove the "what do I even type?" problem,
           which is the single biggest blocker for a casual creator. -->
      <p class="mt-4 text-xs font-medium uppercase tracking-wide text-muted">Need inspiration?</p>
      <ul class="mt-2 flex flex-wrap gap-2">
        <li v-for="suggestion in IDEA_SUGGESTIONS" :key="suggestion">
          <button
            type="button"
            class="min-h-11 rounded-full border border-line bg-canvas px-3.5 text-left text-sm text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft"
            @click="useSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </li>
      </ul>

      <AppButton
        class="mt-5"
        block
        variant="primary"
        size="lg"
        icon="wand"
        :loading="busy"
        :disabled="!canGenerate"
        @click="generateFromIdea"
      >
        Create my storyboard
      </AppButton>
    </section>

    <!-- ================================================================ -->
    <!-- Door 2: start from a template                                     -->
    <!-- ================================================================ -->
    <section aria-labelledby="template-heading">
      <div class="flex items-baseline gap-2">
        <h2 id="template-heading" class="text-lg font-semibold tracking-tight">
          Or start from a template
        </h2>
      </div>
      <p class="mt-1 text-sm text-muted">
        A ready-made style you can reshape. Same editor, same steps.
      </p>

      <ul class="mt-4 grid gap-4 sm:grid-cols-2">
        <li v-for="template in VIDEO_TEMPLATES" :key="template.id">
          <TemplateCard :template="template" :busy="busy" @use="generateFromTemplate" />
        </li>
      </ul>
    </section>

    <!-- Reassurance, because an empty first screen can feel risky. -->
    <p class="flex items-start gap-2 rounded-2xl bg-brand-soft p-3 text-sm text-brand-ink">
      <AppIcon name="info" :size="18" class="mt-0.5" />
      <span>
        Nothing is permanent. Every scene AI creates can be regenerated, reordered or deleted.
      </span>
    </p>
  </div>
</template>
