<script setup>
/**
 * SceneTimeline.vue — the storyboard's card deck + overview (AGENTS.md
 * "SceneTimeline", DESIGN_PROTOTYPE1 §4 "hybrid card layout").
 * ---------------------------------------------------------------------------
 * TWO VIEWS, ONE COMPONENT
 *   • "Cards"    — a horizontal, swipeable deck for browsing one shot at a
 *                  time. Implemented with native CSS scroll-snap, so touch
 *                  swiping works with no custom gesture code (and therefore
 *                  works identically in every browser, and under reduced
 *                  motion).
 *   • "Overview" — a vertical list of the whole sequence, where the order is
 *                  easy to see and change. This is where drag-to-reorder and
 *                  the move-up/move-down buttons live.
 *
 * That pairing is the point: cards are good at browsing, lists are good at
 * sequencing, so the user gets both.
 *
 * ACCESSIBILITY
 *   • The deck has Previous/Next buttons, so keyboard users never need to
 *     swipe or scroll.
 *   • Reordering is available as buttons on every row — a drag is a shortcut,
 *     never the only way (AGENTS.md requirement).
 *   • Reorder results are announced through a polite live region.
 */

import { computed, ref } from 'vue'
import { useReducedMotion } from '../../composables.js'
import AppIcon from '../ui/AppIcon.vue'
import SceneCard from '../cards/SceneCard.vue'
import PlaceholderArt from '../ui/PlaceholderArt.vue'

const props = defineProps({
  /** The ordered scenes to display. */
  scenes: { type: Array, required: true },
  /** Disables interaction while a generation is running. */
  busy: { type: Boolean, default: false },
  /** Id of the scene currently open in the editor (highlighted). */
  selectedId: { type: String, default: '' },
})

const emit = defineEmits(['open', 'move-up', 'move-down', 'regenerate', 'delete', 'reorder'])

const prefersReduced = useReducedMotion()

/** Which of the two presentations is active. */
const view = ref('cards') // 'cards' | 'list'

/** Template ref for the swipeable track. */
const track = ref(null)

/** Index of the card nearest the centre of the deck. */
const activeIndex = ref(0)

/** Index being dragged in the overview list (-1 = none). */
const dragIndex = ref(-1)

/** Message announced to screen readers after a reorder. */
const liveMessage = ref('')

const count = computed(() => props.scenes.length)

/** Scroll the deck so the given index is centred. */
function goTo(index) {
  const clamped = Math.max(0, Math.min(count.value - 1, index))
  activeIndex.value = clamped

  const target = track.value?.children?.[clamped]
  target?.scrollIntoView({
    behavior: prefersReduced.value ? 'auto' : 'smooth',
    block: 'nearest',
    inline: 'center',
  })
}

/** Keep `activeIndex` in sync with the user's manual swiping. */
function onTrackScroll() {
  if (!track.value) return

  const { scrollLeft, clientWidth } = track.value
  const centre = scrollLeft + clientWidth / 2

  let nearest = 0
  let smallestDistance = Number.POSITIVE_INFINITY

  Array.from(track.value.children).forEach((child, index) => {
    const element = /** @type {HTMLElement} */ (child)
    const elementCentre = element.offsetLeft + element.offsetWidth / 2
    const distance = Math.abs(elementCentre - centre)
    if (distance < smallestDistance) {
      smallestDistance = distance
      nearest = index
    }
  })

  activeIndex.value = nearest
}

/** Begin a drag in the overview list. @param {number} index */
function onDragStart(index) {
  dragIndex.value = index
}

/** Complete a drag in the overview list. @param {number} index */
function onDrop(index) {
  const from = dragIndex.value
  dragIndex.value = -1

  if (from < 0 || from === index) return

  emit('reorder', from, index)
  liveMessage.value = `Moved to position ${index + 1} of ${count.value}`
}
</script>

<template>
  <section>
    <!-- ================================================================ -->
    <!-- View switcher: Cards (browse) vs Overview (sequence)              -->
    <!-- ================================================================ -->
    <div class="mb-3 flex items-center gap-3">
      <div
        class="inline-flex rounded-full border border-line bg-surface p-1"
        role="group"
        aria-label="Choose storyboard view"
      >
        <button
          type="button"
          class="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors"
          :class="view === 'cards' ? 'bg-brand text-white' : 'text-muted hover:text-ink'"
          :aria-pressed="view === 'cards'"
          @click="view = 'cards'"
        >
          <AppIcon name="layers" :size="16" />
          Cards
        </button>
        <button
          type="button"
          class="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors"
          :class="view === 'list' ? 'bg-brand text-white' : 'text-muted hover:text-ink'"
          :aria-pressed="view === 'list'"
          @click="view = 'list'"
        >
          <AppIcon name="sliders" :size="16" />
          Overview
        </button>
      </div>

      <p class="ml-auto text-sm text-muted">{{ count }} scenes</p>
    </div>

    <!-- Reorder announcements for screen-reader users. -->
    <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>

    <!-- ================================================================ -->
    <!-- CARDS VIEW — swipeable deck                                       -->
    <!-- ================================================================ -->
    <div v-if="view === 'cards'">
      <!-- Native scroll-snap gives real swipe behaviour on touch devices
           without a single line of gesture code. -->
      <ul
        ref="track"
        class="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0"
        aria-label="Scene cards"
        @scroll.passive="onTrackScroll"
      >
        <li
          v-for="(scene, index) in scenes"
          :key="scene.id"
          class="w-[86%] shrink-0 snap-center sm:w-[26rem]"
        >
          <SceneCard
            :scene="scene"
            :index="index"
            :total="count"
            :selected="scene.id === props.selectedId"
            :busy="props.busy"
            @open="emit('open', scene)"
            @move-up="emit('move-up', scene)"
            @move-down="emit('move-down', scene)"
            @regenerate="emit('regenerate', scene)"
            @delete="emit('delete', scene)"
          />
        </li>
      </ul>

      <!-- Prev/next buttons: the keyboard equivalent of swiping. -->
      <div class="mt-3 flex items-center gap-3">
        <button
          type="button"
          class="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink disabled:opacity-40"
          :disabled="activeIndex === 0 || props.busy"
          aria-label="Show previous scene"
          @click="goTo(activeIndex - 1)"
        >
          <AppIcon name="back" :size="18" />
        </button>

        <ul class="flex flex-1 flex-wrap items-center justify-center gap-1.5" aria-label="Jump to a scene">
          <li v-for="(scene, index) in scenes" :key="scene.id">
            <button
              type="button"
              class="block size-2.5 rounded-full transition-colors"
              :class="activeIndex === index ? 'bg-brand' : 'bg-line hover:bg-muted/50'"
              :aria-label="`Show scene ${index + 1}: ${scene.title}`"
              :aria-current="activeIndex === index ? 'true' : undefined"
              @click="goTo(index)"
            />
          </li>
        </ul>

        <button
          type="button"
          class="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-ink disabled:opacity-40"
          :disabled="activeIndex === count - 1 || props.busy"
          aria-label="Show next scene"
          @click="goTo(activeIndex + 1)"
        >
          <AppIcon name="chevronRight" :size="18" />
        </button>
      </div>
    </div>

    <!-- ================================================================ -->
    <!-- OVERVIEW VIEW — the whole sequence, reorderable                    -->
    <!-- ================================================================ -->
    <ol v-else class="space-y-2" aria-label="Scene order">
      <li
        v-for="(scene, index) in scenes"
        :key="scene.id"
        draggable="true"
        class="flex items-center gap-3 rounded-2xl border bg-surface p-2.5 shadow-sm transition-opacity"
        :class="[
          scene.id === props.selectedId ? 'border-brand' : 'border-line',
          dragIndex === index ? 'opacity-50' : '',
        ]"
        @dragstart="onDragStart(index)"
        @dragover.prevent
        @drop="onDrop(index)"
        @dragend="dragIndex = -1"
      >
        <span
          class="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-ink"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </span>

        <div class="hidden w-16 shrink-0 sm:block">
          <PlaceholderArt
            :gradient="scene.gradient"
            :alt="scene.alt"
            rounded="rounded-lg"
            class="aspect-video w-full"
          />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-ink">{{ scene.title }}</p>
          <p class="truncate text-xs text-muted">{{ scene.duration }}s · {{ scene.typeLabel }}</p>
        </div>

        <!-- Drag handle: a visual cue only. The buttons on the right are the
             accessible, always-available way to reorder. -->
        <span class="hidden shrink-0 text-muted sm:block" aria-hidden="true">
          <AppIcon name="grip" :size="18" />
        </span>

        <div class="flex shrink-0 items-center">
          <button
            type="button"
            class="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
            :disabled="props.busy || index === 0"
            :aria-label="`Move scene ${index + 1} up`"
            @click="emit('move-up', scene)"
          >
            <AppIcon name="up" :size="16" />
          </button>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
            :disabled="props.busy || index === count - 1"
            :aria-label="`Move scene ${index + 1} down`"
            @click="emit('move-down', scene)"
          >
            <AppIcon name="down" :size="16" />
          </button>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40"
            :disabled="props.busy"
            :aria-label="`Edit scene ${index + 1}: ${scene.title}`"
            @click="emit('open', scene)"
          >
            <AppIcon name="sliders" :size="16" />
          </button>
        </div>
      </li>
    </ol>
  </section>
</template>
