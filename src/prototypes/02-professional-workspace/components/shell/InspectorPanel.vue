<script setup>
/**
 * InspectorPanel.vue — brief section 7: the persistent creative-control panel.
 * ---------------------------------------------------------------------------
 * The Inspector follows the SELECTION, which is the core of brief section 30
 * (SELECT -> INSPECT). Depending on what is selected it renders:
 *
 *   scene     -> full parameter inspector (Camera / Lighting / Mood / Style)
 *               + prompt (section 9: prompt AND parameters together)
 *               + contextual AI actions + variation history (section 15)
 *   clip      -> clip metadata with keyboard-reachable move/resize controls
 *   character -> character metadata + character AI actions
 *   asset     -> asset metadata + asset AI actions
 *
 * All parameter writes go through `store.setSceneParam(key, value)`, which
 * commits to undo (section 17) and flips the clip's origin badge to
 * "Human Edited" (section 13) - so a reviewer can literally watch a scene
 * change from AI-made to human-directed.
 *
 * Section 8's vocabulary is deliberately limited: five lenses, five movements,
 * six framings, 0-100% intensity, three contrast steps.
 */

import { computed } from 'vue'
import { useAiActions, useStore } from '../../composables.js'
import {
  FRAMINGS,
  LIGHTING,
  LIGHTING_CONTRAST,
  LIGHTING_INTENSITY,
  LENSES,
  MOODS,
  MOVEMENTS,
  ORIGIN_BADGES,
  STYLES,
} from '../../../../shared/data/mockData.js'
import Icon from '../ui/Icon.vue'
import Btn from '../ui/Btn.vue'

const emit = defineEmits(['close'])
const store = useStore()

const selection = computed(() => store.state.selection)
const scene = computed(() => store.selectedScene.value)
const clip = computed(() => store.selectedClipObj.value)

/** Assets exist in P02 only, so guard the lookup. */
const asset = computed(() => {
  if (selection.value.kind !== 'asset') return null
  const list = store.state.project.assets
  return Array.isArray(list) ? list.find((entry) => entry.id === selection.value.id) || null : null
})

const character = computed(() => {
  if (selection.value.kind !== 'character') return null
  return (
    store.state.project.characters.find((entry) => entry.id === selection.value.id) || null
  )
})

const actions = computed(() => store.contextActions.value)
/**
 * The variation list for the SELECTED scene only.
 *
 * Two bugs fixed here:
 *   1. The store keeps one flat list, so a take generated for scene 02 used to
 *      show up on scene 03 as well. Entries are now filtered by sceneId.
 *   2. An "Original" row used to disappear as soon as a variation was
 *      generated. It is now synthesised from the live scene and pinned first,
 *      so the untouched baseline is always visible and previewable.
 */
const variations = computed(() => {
  const current = scene.value
  if (!current) return []
  const generated = store.state.variations.list.filter((entry) => entry.sceneId === current.id)
  const number = String(current.order).padStart(2, '0')
  return [
    {
      id: 'original',
      sceneId: current.id,
      isOriginal: true,
      label: `Scene ${number} · Original`,
      summary: 'The version currently in the sequence.',
      changes: [],
      gradient: current.gradient,
    },
    ...generated,
  ]
})

/** Alternates for this scene, excluding the pinned original row. */
const generatedCount = computed(() => variations.value.filter((entry) => !entry.isOriginal).length)
const openGroup = computed(() => store.state.inspector.group)

/** Accent chip explaining who made the current version (section 13). */
const originBadge = computed(() => {
  const origin = scene.value?.origin
  return ORIGIN_BADGES.find((entry) => entry.id === origin) || null
})

/* ---------------------------------------------------------------- */
/* Header text depends on the selected kind                          */
/* ---------------------------------------------------------------- */
const title = computed(() => {
  if (scene.value) return `Scene ${String(scene.value.order).padStart(2, '0')}`
  if (clip.value) return clip.value.label || 'Clip'
  if (character.value) return character.value.name
  if (asset.value) return asset.value.name || 'Asset'
  return 'Inspector'
})

const subtitle = computed(() => {
  if (scene.value) return `${scene.value.duration.toFixed(1)} sec · ${scene.value.typeLabel}`
  if (clip.value) return `${clip.value.duration}s · origin: ${clip.value.origin}`
  if (character.value) return character.value.archetype
  if (asset.value) return asset.value.kind || 'Asset'
  return 'Nothing selected'
})

/** Four collapsible groups, exactly the brief's control vocabulary. */
const GROUPS = [
  { id: 'camera', label: 'Camera', icon: 'camera' },
  { id: 'lighting', label: 'Lighting', icon: 'sun' },
  { id: 'mood', label: 'Mood', icon: 'palette' },
  { id: 'style', label: 'Style', icon: 'wand' },
]

/** Accordion behaviour: clicking an open group closes it. */
function toggleGroup(id) {
  store.setInspectorGroup(openGroup.value === id ? '' : id)
}

/** Write a parameter; the store coalesces rapid changes into one undo step. */
function set(key, value) {
  store.setSceneParam(key, value)
}

/**
 * Contextual AI actions (brief section 18) are dispatched by the shared
 * composable, so the Inspector and the AI Action Bar can never drift apart.
 */
const { runAction } = useAiActions()

function useVariation(id) {
  store.useVariation(id)
}

/**
 * Keyboard-reachable alternatives to dragging (brief section 6: "non-drag
 * alternatives for drag interactions"). Dragging stays available on the
 * timeline; these buttons mean a keyboard user can edit without it.
 */
function nudge(seconds) {
  const selected = store.state.selectedClip
  if (selected) store.moveClip(selected.trackId, selected.clipId, seconds)
}

function resize(seconds) {
  const selected = store.state.selectedClip
  if (selected) store.resizeClip(selected.trackId, selected.clipId, seconds)
}

/** Two-letter monogram for the character avatar (never the only identifier). */
const initials = computed(() =>
  (character.value?.name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(''),
)


</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto scroll">
    <!-- ============================ Header ============================ -->
    <header class="flex items-start gap-2 border-b border-line px-4 py-3">
      <div class="min-w-0 flex-1">
        <p class="eyebrow">Inspector</p>
        <h2 class="truncate text-[15px] font-semibold text-ink">{{ title }}</h2>
        <p class="truncate text-[12px] text-ink3">{{ subtitle }}</p>
      </div>

      <!-- Visible only while the pane floats over the stage (see <style>). -->
      <button type="button" class="pi-close" aria-label="Close inspector" @click="emit('close')">
        <Icon name="close" :size="16" />
      </button>
    </header>

    <!-- ===================== Origin badge (section 13) ===================== -->
    <div v-if="originBadge" class="px-4 pt-3">
      <span
        class="inline-flex items-center gap-1.5 rounded border border-line bg-elevated px-2 py-1 text-[11px] text-ink2"
        :title="originBadge.title"
      >
        <span aria-hidden="true">{{ originBadge.glyph }}</span>
        {{ originBadge.label }}
      </span>
    </div>

    <!-- ========================= Empty selection ========================= -->
    <div v-if="!scene && !clip && !character && !asset" class="px-4 py-8 text-center">
      <Icon name="sliders" :size="22" class="mx-auto text-ink3" />
      <p class="mt-2 text-[13px] text-ink3">Nothing selected.</p>
      <p class="mt-1 text-[12px] text-ink3">Pick a scene or clip to inspect it.</p>
    </div>

    <!-- ============================ SCENE ============================ -->
    <template v-else-if="scene">
      <!-- Scene name: rename in place, one undoable step. -->
      <section class="border-b border-line px-4 py-3">
        <label class="eyebrow" for="pro-scene-name">Scene name</label>
        <input
          id="pro-scene-name"
          type="text"
          class="field mt-2"
          maxlength="80"
          :value="scene.title"
          @change="store.setSceneName(scene.id, $event.target.value)"
          @keydown.enter="$event.target.blur()"
        />
      </section>
      <!-- Section 9: natural-language direction AND parameters, never either. -->
      <section class="border-b border-line px-4 py-3">
        <label class="eyebrow" for="pro-prompt">Prompt</label>
        <textarea
          id="pro-prompt"
          rows="3"
          class="field mt-2 resize-y"
          :value="store.state.prompt"
          @input="store.setPrompt($event.target.value)"
        />
        <p class="mt-1.5 text-[11px] leading-relaxed text-ink3">
          Read together with the parameters below, then regenerate — a direction
          change is never silently lost.
        </p>
      </section>

      <!-- Parameter groups: collapsible, but never hidden. -->
      <section v-for="group in GROUPS" :key="group.id" class="border-b border-line">
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-accent"
          :aria-expanded="openGroup === group.id"
          :aria-controls="`grp-${group.id}`"
          @click="toggleGroup(group.id)"
        >
          <span class="text-accent" aria-hidden="true"><Icon :name="group.icon" :size="14" /></span>
          <span class="flex-1 text-[12px] font-semibold uppercase tracking-wide text-ink2">
            {{ group.label }}
          </span>
          <span class="text-ink3" aria-hidden="true">
            <Icon :name="openGroup === group.id ? 'chevronUp' : 'chevronDown'" :size="14" />
          </span>
        </button>

        <div v-show="openGroup === group.id" :id="`grp-${group.id}`" class="space-y-3 px-4 pb-4">
          <!-- CAMERA (section 8) -->
          <template v-if="group.id === 'camera'">
            <div>
              <label class="text-[12px] text-ink3" for="pro-lens">Lens</label>
              <select id="pro-lens" class="field" :value="scene.lens" @change="set('lens', $event.target.value)">
                <option v-for="option in LENSES" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div>
              <label class="text-[12px] text-ink3" for="pro-movement">Movement</label>
              <select id="pro-movement" class="field" :value="scene.movement" @change="set('movement', $event.target.value)">
                <option v-for="option in MOVEMENTS" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div>
              <label class="text-[12px] text-ink3" for="pro-framing">Framing</label>
              <select id="pro-framing" class="field" :value="scene.framing" @change="set('framing', $event.target.value)">
                <option v-for="option in FRAMINGS" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
          </template>

          <!-- LIGHTING (section 8): preset + continuous intensity + contrast -->
          <template v-else-if="group.id === 'lighting'">
            <div>
              <label class="text-[12px] text-ink3" for="pro-light">Type</label>
              <select id="pro-light" class="field" :value="scene.lighting" @change="set('lighting', $event.target.value)">
                <option v-for="option in LIGHTING" :key="option.id" :value="option.id">{{ option.label }}</option>
              </select>
            </div>
            <div>
              <!-- Numeric value is also printed: a slider alone communicates
                   nothing on a projector or to a screen-reader user. -->
              <label class="flex items-baseline justify-between text-[12px] text-ink3" for="pro-intensity">
                <span>Intensity</span>
                <span class="font-mono tabular-nums text-ink2">{{ scene.lightingIntensity }}%</span>
              </label>
              <input
                id="pro-intensity"
                type="range"
                class="mt-1.5 h-1 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-line accent-accent"
                :min="LIGHTING_INTENSITY.min"
                :max="LIGHTING_INTENSITY.max"
                :step="LIGHTING_INTENSITY.step"
                :value="scene.lightingIntensity"
                :aria-valuetext="`${scene.lightingIntensity} percent`"
                @input="set('lightingIntensity', Number($event.target.value))"
              />
            </div>
            <div>
              <label class="text-[12px] text-ink3" for="pro-contrast">Contrast</label>
              <select id="pro-contrast" class="field" :value="scene.lightingContrast" @change="set('lightingContrast', $event.target.value)">
                <option v-for="option in LIGHTING_CONTRAST" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
          </template>

          <!-- MOOD -->
          <template v-else-if="group.id === 'mood'">
            <div>
              <label class="text-[12px] text-ink3" for="pro-mood">Mood</label>
              <select id="pro-mood" class="field" :value="scene.mood" @change="set('mood', $event.target.value)">
                <option v-for="option in MOODS" :key="option.id" :value="option.id">{{ option.label }}</option>
              </select>
            </div>
          </template>

          <!-- STYLE -->
          <template v-else>
            <div>
              <label class="text-[12px] text-ink3" for="pro-style">Visual style</label>
              <select id="pro-style" class="field" :value="scene.style" @change="set('style', $event.target.value)">
                <option v-for="option in STYLES" :key="option.id" :value="option.id">{{ option.label }}</option>
              </select>
            </div>
          </template>

        </div>
      </section>
      <!-- Section 18: contextual actions, never one generic "Ask AI" button. -->
      <section v-if="actions.length" class="border-b border-line px-4 py-3">
        <p class="eyebrow">AI actions</p>
        <div class="mt-2 grid gap-2">
          <Btn
            v-for="(action, index) in actions"
            :key="action"
            :variant="index === 0 ? 'primary' : 'ghost'"
            size="sm"
            block
            :icon="index === 0 ? 'spark' : 'wand'"
            @click="runAction(action)"
          >
            {{ action }}
          </Btn>
        </div>
        <p class="mt-2 text-[11px] leading-relaxed text-ink3">
          Results arrive as proposals you review before anything changes.
        </p>
      </section>

      <!-- Section 15: variations. The original stays recoverable. -->
      <section class="border-b border-line px-4 py-3">
        <div class="flex items-center justify-between">
          <p class="eyebrow">Variations</p>
          <span class="font-mono text-[11px] text-ink3">{{ generatedCount + 1 }}</span>
        </div>

        <p v-if="!generatedCount" class="mt-2 text-[12px] leading-relaxed text-ink3">
          No alternates yet. The row below is the original - generating one
          never touches it.
        </p>

        <ul class="mt-2 space-y-1.5">
          <li
            v-for="variation in variations"
            :key="variation.id"
            class="rounded border px-2.5 py-2"
            :class="
              variation.id === store.state.variations.activeId
                ? 'border-accent bg-elevated'
                : 'border-line'
            "
          >
            <div class="flex items-baseline gap-2">
              <span class="min-w-0 flex-1 truncate text-[12px] text-ink">{{ variation.label }}</span>
              <span
                v-if="variation.id === store.state.variations.activeId"
                class="shrink-0 text-[10px] uppercase tracking-wide text-accent"
              >
                Previewing
              </span>
            </div>
            <p v-if="variation.summary" class="mt-1 text-[11px] leading-snug text-ink3">
              {{ variation.summary }}
            </p>
            <div class="mt-2 flex gap-1.5">
              <Btn size="sm" variant="ghost" @click="store.previewVariation(variation.id)">
                Preview
              </Btn>
              <Btn
                v-if="!variation.isOriginal"
                size="sm"
                variant="primary"
                @click="useVariation(variation.id)"
              >
                Use
              </Btn>
            </div>
          </li>
        </ul>

        <Btn
          v-if="store.state.variations.activeId"
          size="sm"
          variant="quiet"
          block
          class="mt-2"
          @click="store.keepOriginal()"
        >
          Keep original
        </Btn>
      </section>

      <!-- The selected timeline clip, with non-drag editing controls. -->
      <section v-if="clip" class="border-b border-line px-4 py-3">
        <p class="eyebrow">Timeline clip</p>
        <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
          <dt class="text-ink3">In point</dt>
          <dd class="font-mono tabular-nums text-ink2">{{ clip.start.toFixed(1) }}s</dd>
          <dt class="text-ink3">Duration</dt>
          <dd class="font-mono tabular-nums text-ink2">{{ clip.duration.toFixed(1) }}s</dd>
        </dl>

        <p class="mt-3 text-[11px] text-ink3">
          Adjust without dragging — the same edits the timeline offers by mouse.
        </p>
        <div class="mt-1.5 grid grid-cols-2 gap-1.5">
          <Btn size="sm" variant="ghost" icon="chevronLeft" @click="nudge(-1)">Earlier</Btn>
          <Btn size="sm" variant="ghost" icon="chevronRight" @click="nudge(1)">Later</Btn>
          <Btn size="sm" variant="ghost" icon="minus" @click="resize(-1)">Shorter</Btn>
          <Btn size="sm" variant="ghost" icon="plus" @click="resize(1)">Longer</Btn>
        </div>
      </section>
    </template>

    <!-- == Cue clips (dialogue / audio / effects) have no scene behind them == -->
    <template v-else-if="clip">
      <section class="border-b border-line px-4 py-3">
        <p class="eyebrow">Track clip</p>
        <dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
          <dt class="text-ink3">In point</dt>
          <dd class="font-mono tabular-nums text-ink2">{{ clip.start.toFixed(1) }}s</dd>
          <dt class="text-ink3">Duration</dt>
          <dd class="font-mono tabular-nums text-ink2">{{ clip.duration.toFixed(1) }}s</dd>
          <dt class="text-ink3">Origin</dt>
          <dd class="text-ink2">{{ clip.origin }}</dd>
        </dl>
      </section>

      <section class="border-b border-line px-4 py-3">
        <p class="eyebrow">Trim</p>
        <p class="mt-1.5 text-[11px] text-ink3">
          Adjust without dragging — the same edits the timeline offers by mouse.
        </p>
        <div class="mt-2 grid grid-cols-2 gap-1.5">
          <Btn size="sm" variant="ghost" icon="chevronLeft" @click="nudge(-1)">Earlier</Btn>
          <Btn size="sm" variant="ghost" icon="chevronRight" @click="nudge(1)">Later</Btn>
          <Btn size="sm" variant="ghost" icon="minus" @click="resize(-1)">Shorter</Btn>
          <Btn size="sm" variant="ghost" icon="plus" @click="resize(1)">Longer</Btn>
        </div>
      </section>

      <section v-if="actions.length" class="border-b border-line px-4 py-3">
        <p class="eyebrow">AI actions</p>
        <div class="mt-2 grid gap-2">
          <Btn
            v-for="action in actions"
            :key="action"
            size="sm"
            variant="ghost"
            block
            icon="wand"
            @click="runAction(action)"
          >
            {{ action }}
          </Btn>
        </div>
      </section>
    </template>

    <!-- ============================== CHARACTER ============================== -->
    <template v-else-if="character">
      <section class="border-b border-line px-4 py-3">
        <div class="flex items-center gap-3">
          <img
            v-if="character.imageUrl"
            :src="character.imageUrl"
            :alt="character.alt"
            class="size-10 shrink-0 rounded-full object-cover"
          />
          <span
            v-else
            class="grid size-10 shrink-0 place-items-center rounded-full font-semibold text-canvas"
            :style="{ background: character.gradient }"
            aria-hidden="true"
          >
            {{ initials }}
          </span>
          <div class="min-w-0">
            <p class="truncate text-[13px] text-ink">{{ character.name }}</p>
            <p class="truncate text-[12px] text-ink3">{{ character.archetype }}</p>
          </div>
        </div>

        <!-- Read-only on purpose: the store exposes character selection, not
             character parameter writes, so none are invented here. -->
        <dl class="mt-3 space-y-2 text-[12px]">
          <div>
            <dt class="text-ink3">Description</dt>
            <dd class="text-ink2">{{ character.description }}</dd>
          </div>
          <div>
            <dt class="text-ink3">Wardrobe</dt>
            <dd class="text-ink2">{{ character.outfit }}</dd>
          </div>
          <div>
            <dt class="text-ink3">Expression</dt>
            <dd class="text-ink2">{{ character.expression }}</dd>
          </div>
          <div>
            <dt class="text-ink3">Pose</dt>
            <dd class="text-ink2">{{ character.pose }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="actions.length" class="border-b border-line px-4 py-3">
        <p class="eyebrow">AI actions</p>
        <div class="mt-2 grid gap-2">
          <Btn
            v-for="(action, index) in actions"
            :key="action"
            :variant="index === 0 ? 'primary' : 'ghost'"
            size="sm"
            block
            :icon="index === 0 ? 'spark' : 'wand'"
            @click="runAction(action)"
          >
            {{ action }}
          </Btn>
        </div>
        <p class="mt-2 text-[11px] leading-relaxed text-ink3">
          These open the Copilot so you approve the wording before anything runs.
        </p>
      </section>
    </template>

  </div>
</template>

<style scoped>
/* The close affordance only makes sense while the pane floats over the stage.
   From 1440px the inspector is docked in the grid, so it disappears. */
.pi-close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  color: var(--color-ink3);
}
.pi-close:hover {
  background: var(--color-elevated);
  color: var(--color-ink);
}
@media (min-width: 1440px) {
  .pi-close {
    display: none;
  }
}
</style>
