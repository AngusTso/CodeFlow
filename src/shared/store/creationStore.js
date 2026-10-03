/**
 * shared/store/creationStore.js — the creation workflow state machine.
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   AGENTS.md: "Keep product state separate from presentation" and share
 *   "common interaction logic" across prototypes. This store is that shared
 *   brain: it owns the project data and every workflow action (generate,
 *   regenerate, reorder, delete, compose, export).
 *
 *   Prototypes 02 and 03 import THIS file unchanged — they only replace the
 *   components that render `state`. That is the "same core, different skin"
 *   idea the assignment is looking for.
 *
 * DESIGN NOTES
 *   • Uses Vue's `reactive()` — no Pinia, keeping dependencies minimal.
 *   • Created by a factory (`createCreationStore`) instead of a module
 *     singleton, so each app instance gets isolated state.
 *   • `state.isGenerating` is a single flag: the simulated AI runs one job at a
 *     time, so the UI can safely disable conflicting actions.
 */

import { computed, reactive } from 'vue'
import { createExportSettings, createProject, reorderScenes } from '../domain/models.js'
import * as ai from '../ai/mockAi.js'
import { EXPORT_PLATFORMS, SCENE_TYPES, labelOf, gradientFor } from '../data/mockData.js'

/**
 * The five guided steps of the creation workflow (DESIGN_PROTOTYPE1 §3).
 * Array order IS the flow order.
 * @type {{id: string, label: string, hint: string}[]}
 */
export const FLOW_STEPS = [
  { id: 'idea', label: 'Idea', hint: 'Describe it or pick a template' },
  { id: 'storyboard', label: 'Storyboard', hint: 'Review the whole sequence' },
  { id: 'scenes', label: 'Scenes', hint: 'Tune each shot' },
  { id: 'character', label: 'Character', hint: 'Cast your video' },
  { id: 'video', label: 'Video', hint: 'Compose, preview and export' },
]

/**
 * Create a fresh creation store.
 * @returns {object} The store API (state + derived state + actions).
 */
export function createCreationStore() {
  return buildStore()
}

/** Build the reactive state and actions in one readable top-to-bottom pass. */
function buildStore() {
  /* ---------------------------------------------------------------------- */
  /* STATE                                                                   */
  /* ---------------------------------------------------------------------- */

  const state = reactive({
    /** @type {import('../domain/models.js').Project} */
    project: createProject(),
    /** Which guided step is currently displayed. */
    currentStep: 'idea',
    /** True while a simulated AI job runs. Drives <GenerationState>. */
    isGenerating: false,
    /** The friendly loading message shown during generation. */
    message: '',
    /** Non-blocking error text (never a raw stack trace). */
    error: '',
    /** Result of the last simulated export, or null. */
    exportResult: null,
    /** The furthest step unlocked so far (progressive freedom). */
    maxReachedIndex: 0,
  })

  /**
   * Per-scene regeneration counters: bumping one yields a different (but still
   * deterministic) regeneration result.
   * @type {Map<string, number>}
   */
  const regenCounters = new Map()

  /** Variant counter for character suggestions. @type {Map<string, number>} */
  const characterCounters = new Map()

  /* ---------------------------------------------------------------------- */
  /* DERIVED STATE                                                           */
  /* ---------------------------------------------------------------------- */

  const scenes = computed(() => state.project.storyboard.scenes)
  const characters = computed(() => state.project.characters)
  const totalSeconds = computed(() =>
    scenes.value.reduce((sum, scene) => sum + (scene.duration || 0), 0),
  )

  /** Index of the currently displayed step in FLOW_STEPS. */
  const currentStepIndex = computed(() =>
    Math.max(0, FLOW_STEPS.findIndex((step) => step.id === state.currentStep)),
  )

  /**
   * A step is "complete" once its generation has finished.
   * @param {string} stepId
   * @returns {boolean}
   */
  const isStepComplete = (stepId) => state.project.completedSteps.includes(stepId)

  /**
   * Progressive freedom (DESIGN_PROTOTYPE1 §3): users may jump back to any
   * finished step, or forward only as far as they have already reached.
   * @param {string} stepId
   * @returns {boolean}
   */
  const canVisit = (stepId) => {
    const targetIndex = FLOW_STEPS.findIndex((step) => step.id === stepId)
    return targetIndex >= 0 && targetIndex <= state.maxReachedIndex
  }

  /* ---------------------------------------------------------------------- */
  /* INTERNAL HELPERS                                                        */
  /* ---------------------------------------------------------------------- */

  /** Mark a step complete (idempotent). @param {string} stepId */
  const markComplete = (stepId) => {
    if (!state.project.completedSteps.includes(stepId)) {
      state.project.completedSteps.push(stepId)
    }
  }

  /** Raise the "furthest reached" watermark so forward jumps stay locked. */
  const syncMaxReached = () => {
    const index = FLOW_STEPS.findIndex((step) => step.id === state.currentStep)
    state.maxReachedIndex = Math.max(state.maxReachedIndex, index)
  }

  /**
   * Run a simulated AI job, managing the loading flag and friendly message.
   *
   * @template T
   * @param {'storyboard'|'scene'|'character'|'video'|'export'} task
   * @param {() => Promise<T>} worker
   * @returns {Promise<T|null>} The result, or null if the job failed.
   */
  const runGeneration = async (task, worker) => {
    // One AI job at a time keeps the UX honest and the UI simple.
    if (state.isGenerating) return null

    state.isGenerating = true
    state.error = ''
    state.message = ai.messageFor(task)

    try {
      return await worker()
    } catch (error) {
      // Friendly copy for the user; the real error stays in the console.
      state.error = 'Something went wrong while generating. Please try again.'
      console.error('[mockAi] generation failed:', error)
      return null
    } finally {
      state.isGenerating = false
      state.message = ''
    }
  }

  /** Find a scene by id. @param {string} sceneId */
  const findScene = (sceneId) => state.project.storyboard.scenes.find((s) => s.id === sceneId)

  /** Find a character by id. @param {string} characterId */
  const findCharacter = (characterId) =>
    state.project.characters.find((c) => c.id === characterId)

  /* ---------------------------------------------------------------------- */
  /* ACTIONS — navigation / flow                                             */
  /* ---------------------------------------------------------------------- */

  /**
   * Jump to a step, respecting progressive freedom.
   * @param {string} stepId
   * @returns {boolean} Whether the jump was allowed.
   */
  function goToStep(stepId) {
    if (!canVisit(stepId)) return false
    state.currentStep = stepId
    syncMaxReached()
    return true
  }

  /** Advance one step (no-op at the end). @returns {boolean} */
  function nextStep() {
    const target = FLOW_STEPS[Math.min(FLOW_STEPS.length - 1, currentStepIndex.value + 1)]
    return goToStep(target.id)
  }

  /** Go back one step (no-op at the start). @returns {boolean} */
  function previousStep() {
    const target = FLOW_STEPS[Math.max(0, currentStepIndex.value - 1)]
    return goToStep(target.id)
  }

  /** Throw everything away and start a brand-new project. */
  function reset() {
    state.project = createProject()
    state.currentStep = 'idea'
    state.maxReachedIndex = 0
    state.error = ''
    state.exportResult = null
    regenCounters.clear()
    characterCounters.clear()
  }

  /* ---------------------------------------------------------------------- */
  /* ACTIONS — Idea step                                                     */
  /* ---------------------------------------------------------------------- */

  /**
   * Store the user's free-text idea. Called on every keystroke.
   * @param {string} text
   */
  function setIdea(text) {
    state.project.idea = text
    state.project.source = 'idea'
    state.project.templateId = null
    // The project title follows the idea until the user renames it.
    const trimmed = text.trim()
    state.project.title = trimmed ? trimmed.slice(0, 60) : 'Untitled video'
  }

  /**
   * Seed the project from a ready-made template and start generating.
   * This is the "Start from Template" branch of the hybrid entry
   * (DESIGN_PROTOTYPE1 §1).
   *
   * @param {{id: string, title: string, prompt: string, sceneCount: number}} template
   * @returns {Promise<void>}
   */
  async function startFromTemplate(template) {
    const project = state.project
    project.idea = template.prompt
    project.title = template.title
    project.source = 'template'
    project.templateId = template.id

    // A template defines a fixed number of scenes, so pass it through.
    await generateStoryboard({ count: template.sceneCount })
  }

  /* ---------------------------------------------------------------------- */
  /* ACTIONS — Storyboard generation                                         */
  /* ---------------------------------------------------------------------- */

  /**
   * Generate (or regenerate) the whole storyboard from the current idea.
   *
   * @param {{count?: number}} [options]
   * @returns {Promise<import('../domain/models.js').Storyboard|null>}
   */
  async function generateStoryboard(options = {}) {
    const project = state.project

    const result = await runGeneration('storyboard', () =>
      ai.generateStoryboard(project.idea, {
        templateId: project.templateId,
        count: options.count,
      }),
    )

    if (!result) return null

    project.storyboard = result
    // New scenes have new ids, so previous regeneration counters are stale.
    regenCounters.clear()

    markComplete('idea')
    markComplete('storyboard')

    // Generating the storyboard is how the user reaches the Storyboard step.
    state.currentStep = 'storyboard'
    syncMaxReached()

    return result
  }

  /* ---------------------------------------------------------------------- */
  /* ACTIONS — Scene editing                                                 */
  /* ---------------------------------------------------------------------- */

  /**
   * Apply a partial update to one scene (title, prompt, mood, etc.).
   * @param {string} sceneId
   * @param {Partial<import('../domain/models.js').Scene>} patch
   * @returns {object|null} The updated scene.
   */
  function updateScene(sceneId, patch) {
    const scene = findScene(sceneId)
    if (!scene) return null
    Object.assign(scene, patch)
    return scene
  }

  /**
   * Set a scene's duration. Marks it as user-set so future regenerations keep
   * the user's deliberate choice (see mockAi.regenerateScene).
   * @param {string} sceneId
   * @param {number} seconds
   */
  function setSceneDuration(sceneId, seconds) {
    const scene = findScene(sceneId)
    if (!scene) return
    scene.duration = Math.min(10, Math.max(2, Math.round(seconds)))
    scene.durationUserSet = true
  }

  /**
   * Regenerate a single scene, producing a new deterministic variation.
   * @param {string} sceneId
   * @returns {Promise<object|null>} The replacement scene.
   */
  async function regenerateSceneById(sceneId) {
    const scene = findScene(sceneId)
    if (!scene) return null

    const variant = (regenCounters.get(sceneId) || 0) + 1

    const replacement = await runGeneration('scene', () => ai.regenerateScene(scene, variant))
    if (!replacement) return null

    regenCounters.set(sceneId, variant)

    // Replace in place so ordering, focus and scroll position are preserved.
    const index = state.project.storyboard.scenes.findIndex((entry) => entry.id === sceneId)
    state.project.storyboard.scenes.splice(index, 1, replacement)

    return replacement
  }

  /**
   * Change a scene's generation parameters (type, mood, camera, style,
   * lighting) and immediately regenerate a fresh draft with those settings.
   * This is the assignment's "Scene Generation" module.
   *
   * @param {string} sceneId
   * @param {object} patch - e.g. { type: 'nature', mood: 'calm' }
   * @returns {Promise<object|null>}
   */
  async function applySceneParams(sceneId, patch) {
    const scene = findScene(sceneId)
    if (!scene) return null

    Object.assign(scene, patch)
    if (patch.type) scene.typeLabel = labelOf(SCENE_TYPES, patch.type)
    if (patch.type) scene.gradient = gradientFor(patch.type, (scene.order || 1) - 1)

    return regenerateSceneById(sceneId)
  }

  /**
   * Append a brand-new AI-generated scene to the end of the storyboard.
   * @returns {Promise<object|null>}
   */
  async function addScene() {
    const order = state.project.storyboard.scenes.length

    const created = await runGeneration('scene', () =>
      ai.generateScene(state.project.idea, { variant: order, order }),
    )
    if (!created) return null

    state.project.storyboard.scenes = reorderScenes([...scenes.value, created])
    // A changed storyboard means the composition is stale.
    invalidateComposition()
    return created
  }

  /**
   * Delete a scene and re-normalise the remaining order values.
   * @param {string} sceneId
   * @returns {boolean} Whether a scene was removed.
   */
  function deleteScene(sceneId) {
    const remaining = scenes.value.filter((scene) => scene.id !== sceneId)
    if (remaining.length === scenes.value.length) return false

    state.project.storyboard.scenes = reorderScenes(remaining)
    regenCounters.delete(sceneId)
    invalidateComposition()
    return true
  }

  /**
   * Move a scene up or down by one position (the accessible alternative to
   * drag-and-drop, required by DESIGN_PROTOTYPE1 §6).
   *
   * @param {string} sceneId
   * @param {-1 | 1} delta - -1 = up/earlier, 1 = down/later.
   * @returns {boolean} Whether the move happened.
   */
  function moveScene(sceneId, delta) {
    const list = scenes.value
    const index = list.findIndex((scene) => scene.id === sceneId)
    const target = index + delta

    if (index < 0 || target < 0 || target >= list.length) return false

    const next = [...list]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)

    state.project.storyboard.scenes = reorderScenes(next)
    invalidateComposition()
    return true
  }

  /**
   * Move a scene to an absolute index (used by drag-to-reorder + keyboard).
   * @param {number} fromIndex
   * @param {number} toIndex
   * @returns {boolean} Whether the move happened.
   */
  function moveSceneTo(fromIndex, toIndex) {
    const list = scenes.value
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= list.length ||
      toIndex >= list.length
    ) {
      return false
    }

    const next = [...list]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)

    state.project.storyboard.scenes = reorderScenes(next)
    invalidateComposition()
    return true
  }

  /**
   * Mark the composed video as out-of-date. Called whenever scenes change so
   * the UI can prompt the user to re-compose instead of showing a stale result.
   */
  function invalidateComposition() {
    if (!state.project.video.ready) return
    state.project.video = { ...state.project.video, ready: false, status: 'queued' }
  }

  /* ---------------------------------------------------------------------- */
  /* ACTIONS — Character step                                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Generate a character from an AI template and add it to the project.
   * This is the assignment's "Character Generator" module.
   *
   * @param {string} templateId - A CHARACTER_TEMPLATES id.
   * @returns {Promise<object|null>} The created character.
   */
  async function addCharacter(templateId) {
    const variant = (characterCounters.get(templateId) || 0) + 1

    const character = await runGeneration('character', () =>
      ai.generateCharacter({ templateId, variant }),
    )
    if (!character) return null

    characterCounters.set(templateId, variant)
    state.project.characters.push(character)
    markComplete('character')
    return character
  }

  /**
   * Apply a partial update to a character (outfit, expression, pose, name).
   * @param {string} characterId
   * @param {Partial<import('../domain/models.js').Character>} patch
   * @returns {object|null}
   */
  function updateCharacter(characterId, patch) {
    const character = findCharacter(characterId)
    if (!character) return null
    Object.assign(character, patch)
    return character
  }

  /**
   * Remove a character from the project.
   * @param {string} characterId
   * @returns {boolean}
   */
  function deleteCharacter(characterId) {
    const before = state.project.characters.length
    state.project.characters = state.project.characters.filter(
      (character) => character.id !== characterId,
    )
    return state.project.characters.length < before
  }

  /* ---------------------------------------------------------------------- */
  /* ACTIONS — Video composition & export                                    */
  /* ---------------------------------------------------------------------- */

  /**
   * Compose the final video from the current scenes + characters.
   * This is the assignment's "Video Composition Preview" module.
   *
   * @returns {Promise<import('../domain/models.js').VideoComposition|null>}
   */
  async function composeVideo() {
    const result = await runGeneration('video', () =>
      ai.composeVideo(scenes.value, state.project.characters, {
        platform: state.project.export.platform,
      }),
    )

    if (!result) return null

    state.project.video = result
    markComplete('video')
    // Composing is the end of the flow, so everything is now reachable.
    state.maxReachedIndex = FLOW_STEPS.length - 1
    return result
  }

  /**
   * Choose a target platform; also applies that platform's recommended export
   * settings (the assignment's "platform optimization").
   *
   * @param {string} platformId - An EXPORT_PLATFORMS id.
   */
  function setExportPlatform(platformId) {
    const platform = EXPORT_PLATFORMS.find((entry) => entry.id === platformId)
    if (!platform) return

    state.project.export = createExportSettings({
      platform: platform.id,
      resolution: platform.resolution,
      format: platform.format,
      fps: platform.fps,
    })

    // The composition's framing follows the chosen platform.
    if (state.project.video.ready) {
      state.project.video = {
        ...state.project.video,
        resolution: platform.resolution,
        aspectRatio: platform.aspectRatio,
        format: platform.format,
        platform: platform.id,
      }
    }
  }

  /**
   * Apply a partial update to the export settings.
   * @param {Partial<import('../domain/models.js').ExportSettings>} patch
   */
  function updateExport(patch) {
    state.project.export = { ...state.project.export, ...patch }
  }

  /**
   * Run the simulated export ("share to platform").
   * @returns {Promise<object|null>}
   */
  async function runExport() {
    const result = await runGeneration('export', () => ai.simulateExport(state.project.export))

    if (!result) return null

    state.exportResult = result
    return result
  }

  /** Rename the current project. @param {string} title */
  function renameProject(title) {
    state.project.title = title.trim() || 'Untitled video'
  }

  /**
   * Mark a step complete and unlock + advance to the next one.
   * Used by the "Continue" buttons at the bottom of each step.
   *
   * @param {string} stepId
   * @returns {boolean}
   */
  function completeAndContinue(stepId) {
    markComplete(stepId)
    const index = FLOW_STEPS.findIndex((step) => step.id === stepId)
    // Unlock the next step so nextStep()'s progressive-freedom guard passes.
    state.maxReachedIndex = Math.max(state.maxReachedIndex, index + 1, 0)
    return nextStep()
  }

  /* ---------------------------------------------------------------------- */
  /* PUBLIC API                                                              */
  /* ---------------------------------------------------------------------- */

  return {
    // -- state
    state,
    // -- derived
    scenes,
    characters,
    totalSeconds,
    currentStepIndex,
    // -- helpers used by components
    isStepComplete,
    canVisit,
    syncMaxReached,
    // -- navigation / flow
    goToStep,
    nextStep,
    previousStep,
    completeAndContinue,
    reset,
    renameProject,
    // -- idea + storyboard
    setIdea,
    startFromTemplate,
    generateStoryboard,
    // -- scenes
    updateScene,
    setSceneDuration,
    regenerateSceneById,
    applySceneParams,
    addScene,
    deleteScene,
    moveScene,
    moveSceneTo,
    // -- characters
    addCharacter,
    updateCharacter,
    deleteCharacter,
    // -- video + export
    composeVideo,
    invalidateComposition,
    setExportPlatform,
    updateExport,
    runExport,
  }
}


