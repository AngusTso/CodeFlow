<script setup>
/**
 * SectionPanel.vue — the centre column, beneath the preview (brief section 4).
 * ---------------------------------------------------------------------------
 * Each left-nav destination renders its own working surface here:
 *
 *   STORYBOARD  the brief, plus an orderable list of scenes
 *   SCENES      a browsable grid for inspecting and regenerating one scene
 *   ASSETS      the reusable elements the selected scene references
 *   CHARACTERS  the cast, and AI-suggested additions
 *   MEDIA       the frames available to the edit
 *   STYLES      look / grade presets
 *   AUDIO       the music library
 *
 * Two rules hold everywhere in this file:
 *
 *   1. Reordering is never drag-only. Every list that can be reordered ships
 *      explicit move up / move down buttons, so keyboard and screen-reader
 *      users can do the same job (brief section 6).
 *   2. Nothing is invented. Where a production tool would normally hold real
 *      uploaded media, the panel says so plainly instead of faking an upload.
 */

import { computed, ref, watch } from 'vue'
import { useStore } from '../../composables.js'
import {
  AUDIO_TRACKS,
  CHARACTER_TEMPLATES,
  LIGHTING,
  MARKETING_ROLES,
  MOODS,
  STYLES,
  labelOf,
} from '../../../../shared/data/mockData.js'
import Btn from '../ui/Btn.vue'
import Icon from '../ui/Icon.vue'
import SceneTile from './SceneTile.vue'

const props = defineProps({
  /** Active section id, resolved by sectionFromRoute() in App.vue. */
  section: { type: String, default: 'storyboard' },
})

const store = useStore()

/** Header copy per section; one line each, no marketing voice. */
const SECTION_META = {
  storyboard: { title: 'Storyboard', note: 'Direct the brief, then shape the sequence scene by scene.' },
  scenes: { title: 'Scenes', note: 'Inspect, refine and regenerate a single shot.' },
  assets: { title: 'Assets', note: 'Reusable elements the selected scene references.' },
  characters: { title: 'Characters', note: 'Cast, consistency and how they are described.' },
  media: { title: 'Media', note: 'The frames this project can cut with.' },
  styles: { title: 'Styles', note: 'Look and grade presets for the selected scene.' },
  audio: { title: 'Audio', note: 'Music beds for the sequence.' },
}

const meta = computed(() => SECTION_META[props.section] || SECTION_META.storyboard)

/* ---------------------------------------------------------------- state ---- */

const scenes = computed(() => store.scenes.value)
const characters = computed(() => store.state.project.characters)
const selectedScene = computed(() => store.selectedScene.value)
const selection = computed(() => store.state.selection)

const running = computed(() => store.state.ai.running)
const stage = computed(() => store.state.ai.stages[store.state.ai.stageIndex] || '')

/** Total sequence length in seconds; matches the video track exactly. */
const total = computed(() => store.duration.value)

/* --------------------------------------------------------------- prompt ---- */

/** Local mirror of the brief so typing never fights the store. */
const draft = ref(store.state.prompt)

watch(
  () => store.state.prompt,
  (value) => {
    draft.value = value
  },
)

/**
 * Rebuild the storyboard from the brief.
 *
 * Deliberately one explicit click rather than a debounce on typing: this
 * replaces every scene, so it must never fire by itself (brief section 17).
 */
function regenerate() {
  if (running.value) return
  store.setPrompt(draft.value)
  store.regenerateStoryboard()
}

/* -------------------------------------------------------------- helpers ---- */

/** Marketing role id → label ("hook" → "Hook"); blank when untagged. */
function roleLabel(role) {
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : ''
}

/** Two-letter monogram; never the only identifier for a character. */
function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

/** The marketing roles a scene may be tagged with (brief section 19). */
const ROLE_OPTIONS = MARKETING_ROLES

/**
 * Shared styling for the small square icon buttons that sit beside every
 * reorderable row. Kept here so all four controls in a group stay identical.
 */
const ICON_BTN =
  'grid size-7 place-items-center rounded border border-line text-ink2 transition-colors hover:border-[#3a4552] hover:bg-elevated hover:text-ink focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-35'

/* ------------------------------------------------------- store commands ---- */
/*
 * The template drives the store directly. These aliases keep the markup
 * readable — `@select="selectScene"` rather than `@select="store.selectScene"`
 * — and declare, in one place, every command this panel owns. They are plain
 * closures over the store's reactive state rather than `this`-bound methods,
 * so aliasing them is safe.
 */
const {
  deleteScene,
  duplicateScene,
  moveScene,
  requestVariation,
  selectCharacter,
  selectScene,
} = store

/* --------------------------------------------------------------- assets ---- */

/**
 * The reusable elements the SELECTED scene references.
 *
 * A real reading of the scene's own parameters rather than a list of invented
 * files, so the Assets section stays honest about what actually exists.
 */
const assetRows = computed(() => {
  const scene = selectedScene.value
  if (!scene) return []
  return [
    {
      id: `style-${scene.style}`,
      kind: 'Look',
      glyph: '◐',
      label: labelOf(STYLES, scene.style),
      note: 'Grade and render style used by this scene',
    },
    {
      id: `mood-${scene.mood}`,
      kind: 'Mood',
      glyph: '◑',
      label: labelOf(MOODS, scene.mood),
      note: 'Tone the scene is graded towards',
    },
    {
      id: `lens-${scene.lens}`,
      kind: 'Lens',
      glyph: '◎',
      label: scene.lens,
      note: 'Focal length the shot is framed at',
    },
    {
      id: `light-${scene.lighting}`,
      kind: 'Lighting',
      glyph: '☀',
      label: labelOf(LIGHTING, scene.lighting),
      note: `${scene.lightingIntensity}% intensity · ${scene.lightingContrast} contrast`,
    },
    {
      id: 'audio-bed',
      kind: 'Audio bed',
      glyph: '♪',
      label: AUDIO_TRACKS[0],
      note: 'Music bed running under the whole sequence',
    },
  ]
})

/** Which asset row the Inspector is currently showing, if any. */
const activeAssetId = computed(() =>
  selection.value.kind === 'asset' ? selection.value.id || '' : '',
)

function inspectAsset(row) {
  store.selectAsset(row.id)
}

/* ----------------------------------------------------------- characters ---- */

/** Template ids already cast, so a suggestion never duplicates a character. */
const castTemplateIds = computed(() => characters.value.map((entry) => entry.templateId))

/** Templates not yet in the cast — suggested, never added automatically. */
const suggested = computed(() =>
  CHARACTER_TEMPLATES.filter((template) => !castTemplateIds.value.includes(template.id)),
)

/** Which character the Inspector is showing. */
const activeCharacterId = computed(() =>
  selection.value.kind === 'character' ? selection.value.id || '' : '',
)

/* --------------------------------------------------------- look presets ---- */

/** Applying a look marks the scene human-edited (brief sections 9 and 13). */
function applyStyle(styleId) {
  store.setSceneParam('style', styleId)
}

/**
 * Tag the selected scene with a marketing role (brief section 19).
 *
 * The selection record is refreshed afterwards on purpose: the action bar reads
 * its actions from that record, so tagging "hook" genuinely swaps in the
 * marketing actions. Filmmakers and marketers share one workspace.
 */
function setRole(role) {
  const scene = selectedScene.value
  if (!scene) return
  store.setSceneParam('role', role)
  store.selectScene(scene.id)
}

/** Toggle a role chip, so clicking the active role clears it. */
function toggleRole(role) {
  setRole(selectedScene.value && selectedScene.value.role === role ? null : role)
}

/* ------------------------------------------------------ cast, via the AI ---- */

/**
 * Carry a suggested character's look into the selected scene.
 *
 * The prototype cannot add a cast member outright — the Copilot only proposes
 * patches to the selected scene — so the button does exactly what the system
 * can honour: it pre-fills an instruction, opens the Copilot, and the user
 * reviews and applies the result (brief section 10). No dead-end buttons.
 *
 * @param {{name: string, archetype: string, outfit: string, expression: string}} template
 */
function referenceCharacter(template) {
  store.state.copilot.instruction =
    `Keep the ${template.archetype.toLowerCase()} (${template.name}) consistent here — ` +
    `${template.outfit}, ${template.expression}.`
  store.openCopilot()
}
</script>

<template>
  <section class="flex flex-col" :aria-label="meta.title">
    <!-- ============================ Header ============================ -->
    <header class="flex items-center gap-3 border-b border-line px-4 py-2.5">
      <div class="min-w-0 flex-1">
        <h2 class="truncate text-[13px] font-semibold text-ink">{{ meta.title }}</h2>
        <p class="truncate text-[11px] text-ink3">{{ meta.note }}</p>
      </div>

      <!-- Generation is announced here too, because this is where the result
           appears. Stage text only — never a fabricated percentage. -->
      <div
        v-if="running"
        class="flex shrink-0 items-center gap-2 rounded-full border border-line bg-raised px-2.5 py-1"
        role="status"
        aria-live="polite"
      >
        <span
          class="size-3 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent"
          aria-hidden="true"
        />
        <span class="text-[11px] text-ink2">{{ stage || '✨ AI is working…' }}</span>
      </div>
    </header>

    <!-- ===================== Section body (scrolls) ===================== -->
    <div class="px-4 py-4">
      <!-- =========================== STORYBOARD =========================== -->
      <div v-if="section === 'storyboard'" class="space-y-4">
        <!-- The brief: the single input everything else is derived from. -->
        <label class="block">
          <span class="eyebrow mb-1 block">The brief</span>
          <textarea
            v-model="draft"
            rows="3"
            class="field resize-y leading-relaxed"
            placeholder="Describe the video you want to make…"
            aria-label="Video brief"
          />
        </label>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Btn variant="primary" icon="spark" :disabled="running" @click="regenerate">
            Regenerate storyboard
          </Btn>
          <Btn variant="ghost" icon="plus" :disabled="running" @click="store.addScene()">
            Add scene
          </Btn>
          <p class="text-[11px] text-ink3">
            {{ scenes.length }} scenes · {{ total.toFixed(1) }}s ·
            replaces the current board
          </p>
        </div>

        <!-- Orderable sequence. TransitionGroup animates the rows as they swap
             (neutralised by prefers-reduced-motion). -->
        <TransitionGroup tag="ul" name="pro-item" class="space-y-2">
          <li v-for="(scene, index) in scenes" :key="scene.id" class="flex items-stretch gap-2">
            <div class="min-w-0 flex-1">
              <SceneTile
                :scene="scene"
                :index="index"
                :role="roleLabel(scene.role)"
                :selected="selection.kind === 'scene' && selection.id === scene.id"
                @select="selectScene"
              />
            </div>

            <!-- Non-drag alternatives for reordering (brief section 6). -->
            <div
              class="grid shrink-0 grid-cols-2 content-center gap-1"
              role="group"
              :aria-label="`Controls for scene ${index + 1}`"
            >
              <button
                type="button"
                :class="ICON_BTN"
                :disabled="index === 0"
                :aria-label="`Move scene ${index + 1} earlier`"
                title="Move earlier"
                @click="moveScene(scene.id, -1)"
              >
                <Icon name="chevronUp" :size="15" />
              </button>
              <button
                type="button"
                :class="ICON_BTN"
                :disabled="index === scenes.length - 1"
                :aria-label="`Move scene ${index + 1} later`"
                title="Move later"
                @click="moveScene(scene.id, 1)"
              >
                <Icon name="chevronDown" :size="15" />
              </button>
              <button
                type="button"
                :class="ICON_BTN"
                :aria-label="`Duplicate scene ${index + 1}`"
                title="Duplicate"
                @click="duplicateScene(scene.id)"
              >
                <Icon name="copy" :size="15" />
              </button>
              <button
                type="button"
                :class="[ICON_BTN, 'hover:text-danger']"
                :aria-label="`Delete scene ${index + 1}`"
                title="Delete — undo is available"
                @click="deleteScene(scene.id)"
              >
                <Icon name="trash" :size="15" />
              </button>
            </div>
          </li>
        </TransitionGroup>

        <p
          v-if="!scenes.length"
          class="rounded-lg border border-dashed border-line p-8 text-center text-[12px] text-ink3"
        >
          No scenes yet — write a brief above and regenerate the storyboard.
        </p>
      </div>
      <!-- ============================= SCENES ============================= -->
      <div v-else-if="section === 'scenes'" class="space-y-4">
        <p class="text-[11px] text-ink3">
          Select a scene to inspect it. Regenerating one shot never disturbs the rest of the board.
        </p>

        <div class="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          <SceneTile
            v-for="(scene, index) in scenes"
            :key="scene.id"
            :scene="scene"
            :index="index"
            :role="roleLabel(scene.role)"
            :selected="selection.kind === 'scene' && selection.id === scene.id"
            @select="selectScene"
          />
        </div>

        <!-- Detail for the scene the Inspector, timeline and preview all agree on. -->
        <div
          v-if="selectedScene"
          class="rounded-lg border border-line bg-surface p-3"
        >
          <p class="eyebrow">Selected scene</p>
          <p class="mt-1 text-[13px] font-semibold text-ink">{{ selectedScene.title }}</p>
          <p class="mt-0.5 text-[11px] leading-relaxed text-ink3">{{ selectedScene.prompt }}</p>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Btn
              size="sm"
              variant="primary"
              icon="spark"
              :disabled="running"
              @click="requestVariation()"
            >
              Generate variation
            </Btn>
            <Btn size="sm" variant="ghost" icon="sliders" @click="selectScene(selectedScene.id)">
              Re-select
            </Btn>
          </div>

          <!-- Marketing role tagging: the same workspace, a different lens. -->
          <fieldset class="mt-3 border-0 p-0">
            <legend class="eyebrow mb-1.5">Marketing role</legend>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="role in ROLE_OPTIONS"
                :key="role"
                type="button"
                class="rounded-full border px-2.5 py-1 text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                :class="
                  selectedScene.role === role
                    ? 'border-accent bg-elevated text-ink'
                    : 'border-line text-ink2 hover:border-[#3a4552] hover:text-ink'
                "
                :aria-pressed="selectedScene.role === role"
                @click="toggleRole(role)"
              >
                {{ roleLabel(role) }}
              </button>
            </div>
            <p class="mt-1.5 text-[10px] text-ink3">
              Tagging a role swaps the AI actions to marketing ones — no separate mode to switch.
            </p>
          </fieldset>
        </div>
      </div>
      <!-- ============================= ASSETS ============================= -->
      <div v-else-if="section === 'assets'" class="space-y-4">
        <template v-if="selectedScene">
          <p class="text-[11px] text-ink3">
            Referenced by
            <span class="text-ink2">{{ selectedScene.title }}</span>. Select an element to
            inspect it there; changes apply to the selected scene.
          </p>

          <ul class="overflow-hidden rounded-lg border border-line bg-surface">
            <li v-for="row in assetRows" :key="row.id" class="border-b border-line last:border-b-0">
              <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                :class="activeAssetId === row.id ? 'bg-elevated' : 'hover:bg-elevated'"
                :aria-pressed="activeAssetId === row.id"
                @click="inspectAsset(row)"
              >
                <span
                  class="grid size-9 shrink-0 place-items-center rounded bg-raised text-[15px] text-ink2"
                  aria-hidden="true"
                >{{ row.glyph }}</span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[13px] text-ink">{{ row.label }}</span>
                  <span class="block truncate text-[11px] text-ink3">{{ row.note }}</span>
                </span>
                <span class="shrink-0 text-[10px] uppercase tracking-wide text-ink3">{{ row.kind }}</span>
              </button>
            </li>
          </ul>

          <p class="text-[11px] text-ink3">
            Assets are settings, not files: changing one here changes the shot, and the scene is
            marked
            <span class="text-ink2">✎ Human Edited</span>
            so the origin stays honest.
          </p>
        </template>

        <p
          v-else
          class="rounded-lg border border-dashed border-line p-8 text-center text-[12px] text-ink3"
        >
          Select a scene to see the elements it references.
        </p>
      </div>
      <!-- =========================== CHARACTERS =========================== -->
      <div v-else-if="section === 'characters'" class="space-y-4">
        <p class="text-[11px] text-ink3">
          Consistency comes from a written description, not from retraining a model per shot. Select
          a character to see it in the Inspector.
        </p>

        <TransitionGroup tag="ul" name="pro-item" class="space-y-3">
          <li v-for="character in characters" :key="character.id">
            <button
              type="button"
              class="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              :class="
                activeCharacterId === character.id
                  ? 'border-accent bg-elevated'
                  : 'border-line bg-surface hover:border-[#3a4552] hover:bg-elevated'
              "
              :aria-pressed="activeCharacterId === character.id"
              @click="selectCharacter(character.id)"
            >
              <img
                v-if="character.imageUrl"
                :src="character.imageUrl"
                :alt="character.alt"
                class="size-12 shrink-0 rounded-lg object-cover"
              />
              <span
                v-else
                class="grid size-12 shrink-0 place-items-center rounded-lg text-[15px] font-semibold text-ink"
                :style="{ background: character.gradient }"
                aria-hidden="true"
              >{{ initials(character.name) }}</span>

              <span class="min-w-0 flex-1">
                <span class="block truncate text-[13px] font-semibold text-ink">{{ character.name }}</span>
                <span class="block truncate text-[11px] text-ink3">{{ character.archetype }}</span>
                <span class="mt-1 block text-[11px] leading-snug text-ink3">{{ character.description }}</span>
                <span class="mt-1.5 flex flex-wrap gap-1">
                  <span
                    v-for="tag in [character.outfit, character.expression, character.pose]"
                    :key="tag"
                    class="rounded bg-raised px-1.5 py-0.5 text-[10px] text-ink2"
                  >{{ tag }}</span>
                </span>
              </span>
            </button>
          </li>
        </TransitionGroup>

        <div v-if="suggested.length" class="rounded-lg border border-line bg-surface p-3">
          <p class="eyebrow mb-2">Suggested by AI</p>
          <ul class="space-y-2">
            <li
              v-for="template in suggested"
              :key="template.id"
              class="flex items-center gap-2 rounded border border-line px-2 py-1.5"
            >
              <span class="text-[15px]" aria-hidden="true">{{ template.glyph }}</span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[12px] text-ink">{{ template.name }}</span>
                <span class="block truncate text-[10px] text-ink3">{{ template.archetype }}</span>
              </span>
              <Btn
                size="sm"
                variant="ghost"
                icon="spark"
                :disabled="!selectedScene"
                :title="`Ask the Copilot to keep ${template.name} consistent in the selected scene`"
                @click="referenceCharacter(template)"
              >
                Reference
              </Btn>
            </li>
          </ul>
          <p class="mt-2 text-[10px] text-ink3">
            Suggestions are never added to the cast automatically. Reference opens the Copilot with
            an instruction about the selected scene, which you review before it is applied.
          </p>
        </div>
      </div>
      <!-- ============================= MEDIA ============================= -->
      <div v-else-if="section === 'media'" class="space-y-4">
        <p class="text-[11px] text-ink3">
          Every generated scene doubles as its own frame, so the bin and the storyboard share one
          source of truth.
        </p>

        <div class="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          <SceneTile
            v-for="(scene, index) in scenes"
            :key="scene.id"
            :scene="scene"
            :index="index"
            :role="roleLabel(scene.role)"
            :selected="selection.kind === 'scene' && selection.id === scene.id"
            @select="selectScene"
          />
        </div>

        <p class="rounded-lg border border-dashed border-line p-3 text-[11px] text-ink3">
          Uploading your own footage is out of scope for this prototype — there is no backend to
          store it, so no upload control is offered rather than one that silently does nothing.
        </p>
      </div>

      <!-- ============================ STYLES ============================ -->
      <div v-else-if="section === 'styles'" class="space-y-4">
        <template v-if="selectedScene">
          <p class="text-[11px] text-ink3">
            Applied to
            <span class="text-ink2">{{ selectedScene.title }}</span>. The rest of the sequence keeps
            its own look, so scenes can be graded individually.
          </p>

          <div class="grid gap-2 sm:grid-cols-2" role="group" aria-label="Look and grade presets">
            <button
              v-for="style in STYLES"
              :key="style.id"
              type="button"
              class="flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              :class="
                selectedScene.style === style.id
                  ? 'border-accent bg-elevated text-ink'
                  : 'border-line bg-surface text-ink2 hover:border-[#3a4552] hover:bg-elevated hover:text-ink'
              "
              :aria-pressed="selectedScene.style === style.id"
              @click="applyStyle(style.id)"
            >
              <Icon name="palette" :size="15" />
              <span class="flex-1 truncate text-[13px]">{{ style.label }}</span>
              <Icon v-if="selectedScene.style === style.id" name="check" :size="15" />
            </button>
          </div>

          <p class="text-[11px] text-ink3">
            Applying a preset marks the scene
            <span class="text-ink2">✎ Human Edited</span>
            and is a single undo step.
          </p>
        </template>

        <p
          v-else
          class="rounded-lg border border-dashed border-line p-8 text-center text-[12px] text-ink3"
        >
          Select a scene to apply a look.
        </p>
      </div>

      <!-- ============================= AUDIO ============================= -->
      <div v-else-if="section === 'audio'" class="space-y-4">
        <p class="text-[11px] text-ink3">
          One music bed runs under the whole sequence. Dialogue and effects live on their own
          timeline tracks.
        </p>

        <ul class="overflow-hidden rounded-lg border border-line bg-surface">
          <li
            v-for="(track, index) in AUDIO_TRACKS"
            :key="track"
            class="flex items-center gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
          >
            <Icon name="wave" :size="15" class="shrink-0 text-ink3" />
            <span class="min-w-0 flex-1 truncate text-[13px] text-ink">{{ track }}</span>
            <span
              v-if="index === 0"
              class="shrink-0 rounded border border-accent px-1.5 py-0.5 text-[10px] text-accent"
            >
              In this project
            </span>
          </li>
        </ul>
      </div>
      <!-- Any unknown hash route resolves to Storyboard in sectionFromRoute(). -->
    </div>
  </section>
</template>
