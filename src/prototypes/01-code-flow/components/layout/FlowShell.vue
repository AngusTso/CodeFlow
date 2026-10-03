<script setup>
/**
 * FlowShell.vue — the chrome for the guided creation workflow.
 * ---------------------------------------------------------------------------
 * DESIGN_PROTOTYPE1 §2: once the user enters creation mode, the CREATION FLOW
 * becomes the primary navigation. So this shell replaces the global bottom bar
 * with a contextual header (back / title / start-over), the 5-step progress
 * indicator, the step content, and a sticky footer holding the primary action.
 *
 * It also renders <GenerationState>, the shared AI feedback surface, so every
 * step gets consistent loading + error feedback for free.
 */

import { computed } from 'vue'
import { FLOW_STEPS } from '../../../../shared/store/creationStore.js'
import { useRouter, useStore } from '../../composables.js'
import AppButton from '../ui/AppButton.vue'
import AppIcon from '../ui/AppIcon.vue'
import CreationProgress from './CreationProgress.vue'
import GenerationState from '../ui/GenerationState.vue'

import IdeaStep from '../../views/flow/IdeaStep.vue'
import StoryboardStep from '../../views/flow/StoryboardStep.vue'
import ScenesStep from '../../views/flow/ScenesStep.vue'
import CharacterStep from '../../views/flow/CharacterStep.vue'
import VideoStep from '../../views/flow/VideoStep.vue'

const router = useRouter()
const store = useStore()

/** step id → component */
const STEP_COMPONENTS = {
  idea: IdeaStep,
  storyboard: StoryboardStep,
  scenes: ScenesStep,
  character: CharacterStep,
  video: VideoStep,
}

const currentStepId = computed(() => store.state.currentStep)
const currentStep = computed(
  () => FLOW_STEPS.find((step) => step.id === currentStepId.value) || FLOW_STEPS[0],
)
const currentStepIndex = computed(() => store.currentStepIndex.value)
const stepComponent = computed(() => STEP_COMPONENTS[currentStepId.value] || IdeaStep)

/** The Idea step owns its own primary action, so it needs no footer. */
const showFooter = computed(() => currentStepIndex.value > 0 && currentStepId.value !== 'video')

/** Label for the footer's primary button, based on the NEXT step. */
const continueLabel = computed(() => {
  const next = FLOW_STEPS[currentStepIndex.value + 1]
  return next ? `Continue to ${next.label.toLowerCase()}` : 'Continue'
})

/** Leave the flow. The project is kept, so returning resumes where you were. */
function exitFlow() {
  router.navigate('/')
}

/** Go back one step, or leave the flow if this is the first step. */
function goBack() {
  if (currentStepIndex.value === 0) exitFlow()
  else store.previousStep()
}

/** Advance to the next step, marking the current one complete. */
function continueFlow() {
  store.completeAndContinue(currentStepId.value)
}

/** Discard the project and restart at the Idea step. */
function startOver() {
  store.reset()
  router.navigate('/flow/idea')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-canvas">
    <!-- Skip link for keyboard users. -->
    <a
      href="#flow-main"
      class="skip-link"
    >
      Skip to workflow
    </a>

    <!-- ================================================================ -->
    <!-- Contextual header                                                 -->
    <!-- ================================================================ -->
    <header class="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
      <div class="mx-auto w-full max-w-4xl px-3 pb-3 pt-3 sm:px-6">
        <div class="flex items-center gap-2">
          <!-- Back: previous step, or leave the flow from step 1. -->
          <button
            type="button"
            class="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
            :aria-label="currentStepIndex === 0 ? 'Leave the creation flow' : 'Go to previous step'"
            @click="goBack"
          >
            <AppIcon :name="currentStepIndex === 0 ? 'close' : 'back'" :size="20" />
          </button>

          <div class="min-w-0 flex-1 text-center">
            <p class="truncate text-sm font-semibold">{{ store.state.project.title }}</p>
            <p class="truncate text-xs text-muted">{{ currentStep.hint }}</p>
          </div>

          <button
            type="button"
            class="grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
            aria-label="Start over with a new video"
            @click="startOver"
          >
            <AppIcon name="refresh" :size="20" />
          </button>
        </div>

        <!-- The 5-step progress indicator, which doubles as step navigation. -->
        <CreationProgress class="mt-3" />
      </div>
    </header>

    <!-- ================================================================ -->
    <!-- Step content                                                      -->
    <!-- ================================================================ -->
    <main
      id="flow-main"
      class="mx-auto w-full max-w-4xl flex-1 px-4 pt-5 sm:px-6"
      :class="showFooter ? 'pb-32' : 'pb-12'"
    >
      <!-- A polite live region announces step changes without stealing focus. -->
      <p class="sr-only" aria-live="polite">
        Step {{ currentStepIndex + 1 }} of {{ FLOW_STEPS.length }}: {{ currentStep.label }}
      </p>

      <Transition name="fade-page" mode="out-in">
        <component :is="stepComponent" :key="currentStepId" />
      </Transition>
    </main>

    <!-- ================================================================ -->
    <!-- Sticky footer with the step's primary action                      -->
    <!-- ================================================================ -->
    <div
      v-if="showFooter"
      class="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur"
    >
      <div class="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
        <!-- A running summary answers "how long is my video?" on every step. -->
        <p class="text-sm text-muted">
          <span class="font-semibold text-ink">{{ store.scenes.value.length }}</span> scenes ·
          <span class="font-semibold text-ink">{{ store.totalSeconds.value }}s</span>
        </p>

        <AppButton
          class="ml-auto"
          variant="primary"
          size="md"
          icon="chevronRight"
          icon-position="end"
          @click="continueFlow"
        >
          {{ continueLabel }}
        </AppButton>
      </div>
    </div>

    <!-- Shared AI feedback layer (loading / errors). -->
    <GenerationState />
  </div>
</template>
