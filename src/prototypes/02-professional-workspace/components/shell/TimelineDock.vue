<script setup>
/**
 * TimelineDock.vue — brief sections 12 and 14.
 * ---------------------------------------------------------------------------
 * The composition surface: four stacked tracks (VIDEO / DIALOGUE / AUDIO /
 * EFFECTS) laid out over one shared time axis, with a playhead synchronised
 * with the preview.
 *
 * WHY FOUR TRACKS: a video is not just pictures. Showing dialogue, audio and
 * effects as first-class lanes makes the "composition" idea visible instead of
 * pretending a short video is a simple slideshow (brief section 12).
 *
 * ACCESSIBILITY (brief section 6): dragging clips is a convenience, never the
 * only route. Every clip is a real button that can be focused with Tab and
 * selected with Enter/Space, and the Inspector exposes Earlier / Later /
 * Shorter / Longer controls for the selected clip. Scrubbing uses a native
 * range input, so keyboard and screen-reader seeking work for free.
 *
 * @prop {boolean} reduced - True below 768px: coarser ruler, taller rows.
 */

import { computed, ref } from 'vue'
import { useStore } from '../../composables.js'
import { ORIGIN_BADGES } from '../../../../shared/data/mockData.js'
import Btn from '../ui/Btn.vue'

const props = defineProps({
  reduced: { type: Boolean, default: false },
})

const store = useStore()

const tracks = computed(() => store.state.project.tracks)
const collapsed = computed(() => store.state.timeline.collapsed)
const time = computed(() => store.state.playback.time)
const playing = computed(() => store.state.playback.playing)

/** Guard against a zero-length axis while the storyboard is regenerating. */
const total = computed(() => Math.max(store.duration.value, 1))

/** Short, human explanation per lane - the labels are not self-explanatory. */
const TRACK_HINT = {
  video: 'Visual scenes in sequence',
  dialogue: 'Spoken lines, one per scene',
  audio: 'Music bed and sound design',
  effects: 'Transitions and overlays',
}

/**
 * Ruler ticks. Every second while the edit is short; every fifth second once
 * it grows, so labels never collide.
 */
const ticks = computed(() => {
  const seconds = Math.ceil(total.value)
  const step = props.reduced ? 5 : seconds <= 30 ? 1 : 5
  const marks = []
  for (let value = 0; value <= seconds; value += step) marks.push(value)
  return marks
})

/** Convert seconds to a CSS percentage of the shared axis. */
function pct(seconds) {
  return `${(seconds / total.value) * 100}%`
}

function originOf(clip) {
  return ORIGIN_BADGES.find((entry) => entry.id === clip.origin) || null
}

function isSelected(trackId, clipId) {
  const selected = store.state.selectedClip
  return Boolean(selected && selected.trackId === trackId && selected.clipId === clipId)
}

function select(trackId, clipId) {
  store.selectClip(trackId, clipId)
}

function seek(seconds) {
  store.seek(seconds)
}

/* ------------------------------------------------------------------ */
/* Drag to move / trim                                                 */
/* ------------------------------------------------------------------ */
/* Pointer events (not HTML5 drag-and-drop) so touch works, and so a live
   offset can be shown before committing one undoable edit on release. */

const drag = ref(null)

function beginDrag(event, mode, track, clip) {
  // Ignore secondary buttons so a right-click never starts a move.
  if (event.button !== undefined && event.button !== 0) return

  select(track.id, clip.id)

  const lane = event.currentTarget.closest('[data-lane]')
  drag.value = {
    mode,
    trackId: track.id,
    clipId: clip.id,
    startX: event.clientX,
    laneWidth: lane ? lane.clientWidth : 1,
    seconds: 0,
    pixels: 0,
  }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event) {
  const active = drag.value
  if (!active) return

  const perPixel = total.value / active.laneWidth
  active.pixels = event.clientX - active.startX
  active.seconds = Math.round(active.pixels * perPixel)
}

function endDrag() {
  const active = drag.value
  drag.value = null
  if (!active || !active.seconds) return

  if (active.mode === 'move') store.moveClipBySeconds(active.trackId, active.clipId, active.seconds)
  else store.resizeClip(active.trackId, active.clipId, active.seconds)
}

/** Live nudge applied to the clip currently being dragged. */
function dragStyle(trackId, clipId) {
  const active = drag.value
  if (!active || active.trackId !== trackId || active.clipId !== clipId) return undefined
  return { transform: `translateX(${active.pixels}px)` }
}
</script>

<template>
  <section class="flex flex-col border-t border-line bg-surface" aria-labelledby="timeline-heading">
    <!-- ======================= Header / transport ======================= -->
    <header class="flex flex-wrap items-center gap-3 px-4 py-2">
      <h2 id="timeline-heading" class="eyebrow">Timeline</h2>

      <div class="flex items-center gap-1">
        <Btn
          size="sm"
          variant="ghost"
          :icon="playing ? 'pause' : 'play'"
          :title="playing ? 'Pause' : 'Play'"
          @click="store.togglePlay()"
        >
          {{ playing ? 'Pause' : 'Play' }}
        </Btn>
        <Btn
          size="sm"
          variant="quiet"
          icon="stop"
          title="Stop and return to the start"
          @click="store.stopPlayback()"
        >
          Stop
        </Btn>
      </div>

      <!-- A running clock means the playhead never has to be estimated. -->
      <p class="font-mono text-[12px] tabular-nums text-ink2">
        {{ time.toFixed(1) }}
        <span class="text-ink3">/ {{ total.toFixed(1) }}s</span>
      </p>

      <Btn
        size="sm"
        variant="ghost"
        icon="plus"
        title="Add a scene after the selection"
        :disabled="store.state.ai.running"
        @click="store.addScene()"
      >
        Add scene
      </Btn>

      <div class="ml-auto">
        <Btn
          size="sm"
          variant="quiet"
          :icon="collapsed ? 'chevronUp' : 'chevronDown'"
          :aria-expanded="!collapsed"
          aria-controls="timeline-tracks"
          @click="store.toggleTimeline()"
        >
          {{ collapsed ? 'Expand' : 'Collapse' }}
        </Btn>
      </div>
    </header>

    <!-- ============================ Tracks ============================ -->
    <div v-show="!collapsed" id="timeline-tracks" class="px-4 pb-3">
      <!-- A range input over the axis: keyboard seeking, for free. -->
      <div class="flex items-center gap-3">
        <span class="w-24 shrink-0 text-[11px] text-ink3">Scrub</span>
        <input
          class="tl-scrub w-full min-w-0 cursor-pointer"
          type="range"
          min="0"
          :max="total"
          step="0.1"
          :value="time"
          aria-label="Scrub the timeline"
          :aria-valuetext="`${time.toFixed(1)} of ${total.toFixed(1)} seconds`"
          @input="seek(Number($event.target.value))"
        />
      </div>

      <!-- Ruler labels share the axis with the scrubber above them. -->
      <div class="mt-1 flex gap-3">
        <span class="w-24 shrink-0" aria-hidden="true" />
        <div class="relative h-4 w-full">
          <span
            v-for="tick in ticks"
            :key="tick"
            class="absolute -translate-x-1/2 font-mono text-[10px] tabular-nums text-ink3"
            :style="{ left: pct(tick) }"
          >
            {{ tick }}s
          </span>
        </div>
      </div>

      <!-- One row per track, all sharing the same left label column. -->
      <div class="mt-2 space-y-1.5">
        <div
          v-for="track in tracks"
          :key="track.id"
          class="flex items-center gap-3"
          :class="props.reduced ? 'min-h-14' : 'min-h-11'"
        >
          <div class="w-24 shrink-0">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-ink2">
              {{ track.label }}
            </p>
            <p class="hidden text-[10px] leading-tight text-ink3 lg:block">
              {{ TRACK_HINT[track.kind] }}
            </p>
          </div>

          <div
            data-lane
            class="relative w-full overflow-hidden rounded border border-line bg-canvas"
            :class="props.reduced ? 'h-12' : 'h-9'"
          >
            <!-- The playhead is shared by every lane. -->
            <span
              class="pointer-events-none absolute inset-y-0 z-20 w-px bg-accent"
              :style="{ left: pct(time) }"
              aria-hidden="true"
            />

            <button
              v-for="clip in track.clips"
              :key="clip.id"
              type="button"
              class="tl-clip absolute inset-y-0.5 overflow-hidden rounded px-2 text-left"
              :class="
                isSelected(track.id, clip.id)
                  ? 'ring-2 ring-accent'
                  : 'ring-1 ring-transparent hover:ring-line'
              "
              :style="[
                {
                  left: pct(clip.start),
                  width: pct(clip.duration),
                  backgroundImage: clip.imageUrl ? `url('${clip.imageUrl}')` : clip.gradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                },
                dragStyle(track.id, clip.id),
              ]"
              :aria-pressed="isSelected(track.id, clip.id)"
              :aria-label="`${clip.label}${clip.alt ? `: ${clip.alt}` : ''}, starts ${clip.start.toFixed(1)} seconds, lasts ${clip.duration.toFixed(1)} seconds`"
              :title="clip.label"
              @click="select(track.id, clip.id)"
              @pointerdown="beginDrag($event, 'move', track, clip)"
              @pointermove="onPointerMove"
              @pointerup="endDrag"
              @pointercancel="endDrag"
            >
              <span class="inline-flex max-w-full items-center gap-1 rounded bg-canvas/70 px-1 py-0.5">
                <!-- Origin glyph: the badge is never colour alone (section 13). -->
                <span v-if="originOf(clip)" class="text-[10px]" aria-hidden="true">
                  {{ originOf(clip).glyph }}
                </span>
                <span class="truncate text-[11px] font-medium text-ink">{{ clip.label }}</span>
              </span>
            </button>

            <!-- Trim handle: a separate control, so dragging a clip's body
                 always means "move" and never accidentally shortens it. -->
            <button
              v-for="clip in track.clips"
              v-show="isSelected(track.id, clip.id)"
              :key="`${clip.id}-trim`"
              type="button"
              class="tl-trim absolute inset-y-0.5 z-10 w-2 rounded-r bg-accent"
              :style="{ left: `calc(${pct(clip.start)} + ${pct(clip.duration)} - 8px)` }"
              :aria-label="`Trim ${clip.label}. Use Shorter and Longer in the Inspector for keyboard editing.`"
              title="Drag to trim"
              @pointerdown="beginDrag($event, 'resize', track, clip)"
              @pointermove="onPointerMove"
              @pointerup="endDrag"
              @pointercancel="endDrag"
            />
          </div>
        </div>
      </div>

      <p class="mt-2 text-[11px] text-ink3">
        Select a clip, then move or trim it from the Inspector with the keyboard.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* Clips are draggable surfaces, so signal it — but keep the pointer crisp. */
.tl-clip {
  touch-action: none;
  cursor: grab;
}
.tl-clip:active {
  cursor: grabbing;
}

.tl-trim {
  touch-action: none;
  cursor: ew-resize;
}

/* The native range input keeps its own thumb as the scrubber. */
.tl-scrub {
  appearance: none;
  height: 4px;
  border-radius: 999px;
  background: var(--color-line);
}
.tl-scrub::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-accent);
}
.tl-scrub::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: 0;
  border-radius: 50%;
  background: var(--color-accent);
}
</style>
