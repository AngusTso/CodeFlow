<script setup>
/**
 * VideoPreview.vue — the composed video, with simulated playback
 * (AGENTS.md "VideoPreview"; assignment module 4).
 * ---------------------------------------------------------------------------
 * There is no real video file — that would require a backend and encoding, both
 * explicitly out of scope. Instead we SIMULATE playback: a timer advances a
 * playhead, and the frame shown is whichever scene the playhead is inside.
 * This demonstrates the composition (order, durations, transitions) honestly,
 * which is what the assignment asks a prototype to prove.
 *
 * ACCESSIBILITY
 *   • The playhead is a native <input type="range">, so it is keyboard
 *     operable and announced correctly by screen readers.
 *   • Playback changes are announced through a polite live region.
 *   • The running timer is cleared on unmount, so nothing leaks.
 */

import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { formatClock } from '../../../../shared/utils/format.js'
import AppIcon from '../ui/AppIcon.vue'
import PlaceholderArt from '../ui/PlaceholderArt.vue'

const props = defineProps({
  /** Scenes in order. */
  scenes: { type: Array, required: true },
  /** The composed video model (aspect ratio, resolution, metadata). */
  composition: { type: Object, required: true },
  /** Disables playback until the video has been composed. */
  disabled: { type: Boolean, default: false },
})

/** Total length in seconds, derived from the scenes themselves. */
const total = computed(() => props.scenes.reduce((sum, scene) => sum + (scene.duration || 0), 0))

/** Whether playback is currently running. */
const playing = ref(false)

/** Playhead position, in seconds. */
const currentTime = ref(0)

/** Interval id for the simulated playback loop. */
let timerId = null

/** The scene currently under the playhead (falls back to the last). */
const currentScene = computed(() => {
  if (props.scenes.length === 0) return null

  let elapsed = 0
  for (const scene of props.scenes) {
    elapsed += scene.duration || 0
    if (currentTime.value < elapsed) return scene
  }
  return props.scenes[props.scenes.length - 1]
})

/** Index of the current scene, used for the "now playing" caption. */
const currentIndex = computed(() =>
  Math.max(
    0,
    props.scenes.findIndex((scene) => scene.id === currentScene.value?.id),
  ),
)

/** Stop the playback timer. */
function pause() {
  playing.value = false
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

/** Start (or resume) the simulated playback loop. */
function play() {
  if (props.disabled || total.value === 0) return

  // Restart from the beginning if the playhead is already at the end.
  if (currentTime.value >= total.value) currentTime.value = 0

  playing.value = true
  const startedAt = performance.now() - currentTime.value * 1000

  timerId = setInterval(() => {
    const next = (performance.now() - startedAt) / 1000
    if (next >= total.value) {
      currentTime.value = total.value
      pause()
      return
    }
    currentTime.value = next
  }, 80)
}

/** Toggle between play and pause. */
function toggle() {
  if (playing.value) pause()
  else play()
}

/** Scrub to a position (and stop, like a real player). */
function scrubTo(event) {
  pause()
  currentTime.value = Number(event.target.value)
}

// Never leave a timer running against a stale scene list.
watch(total, () => {
  pause()
  currentTime.value = 0
})

// Clean up when the component is removed from the DOM.
onBeforeUnmount(pause)
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-line bg-surface p-3 shadow-sm">
    <!-- ================================================================ -->
    <!-- Video frame (vertical, for short-video platforms)                  -->
    <!-- ================================================================ -->
    <div
      class="relative mx-auto w-full max-w-[16rem] overflow-hidden rounded-2xl bg-ink"
      :style="{ aspectRatio: (props.composition.aspectRatio || '9:16').replace(':', ' / ') }"
    >
      <PlaceholderArt
        v-if="currentScene"
        :image-url="currentScene.imageUrl || ''"
        :gradient="currentScene.gradient"
        :alt="`Now playing: ${currentScene.alt}`"
        rounded="rounded-none"
        class="size-full"
      />

      <!-- Empty state before the video has been composed. -->
      <div v-else class="grid size-full place-items-center text-center text-white/80">
        <div class="px-6">
          <AppIcon name="image" :size="34" />
          <p class="mt-3 text-sm">Your video preview will appear here.</p>
        </div>
      </div>

      <!-- "Now playing" caption. -->
      <p
        v-if="currentScene"
        class="absolute inset-x-2 bottom-2 rounded-xl bg-ink/70 px-3 py-2 text-xs text-white backdrop-blur"
      >
        <span class="font-semibold">Scene {{ currentIndex + 1 }}</span> ·
        {{ currentScene.title }} · {{ currentScene.duration }}s
      </p>

      <!-- Playback badge -->
      <p
        v-if="playing"
        class="absolute left-2 top-2 rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white"
      >
        ● Playing
      </p>
    </div>

    <!-- ================================================================ -->
    <!-- Transport controls                                                -->
    <!-- ================================================================ -->
    <div class="mt-3 flex items-center gap-3">
      <button
        type="button"
        class="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="props.disabled || total === 0"
        :aria-label="playing ? 'Pause preview' : 'Play preview'"
        @click="toggle"
      >
        <AppIcon :name="playing ? 'pause' : 'play'" :size="20" />
      </button>

      <div class="min-w-0 flex-1">
        <!-- A native range input gives keyboard-accessible scrubbing for free. -->
        <label class="sr-only" for="preview-scrubber">Playhead position</label>
        <input
          id="preview-scrubber"
          type="range"
          min="0"
          :max="total || 1"
          step="0.1"
          :value="currentTime"
          :disabled="props.disabled || total === 0"
          class="h-2 w-full cursor-pointer accent-brand"
          @input="scrubTo"
        />

        <div class="mt-1.5 flex justify-between text-xs text-muted">
          <span>{{ formatClock(currentTime) }}</span>
          <span>{{ formatClock(total) }}</span>
        </div>
      </div>
    </div>

    <!-- Announce playback changes without stealing focus. -->
    <p class="sr-only" aria-live="polite">
      {{ playing ? `Playing scene ${currentIndex + 1} of ${props.scenes.length}` : 'Playback paused' }}
    </p>
  </div>
</template>
