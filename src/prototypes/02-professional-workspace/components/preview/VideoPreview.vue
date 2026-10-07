<script setup>
/**
 * VideoPreview.vue — brief section 6: the visual focus of the workspace.
 * ---------------------------------------------------------------------------
 * Requirements covered here:
 *   - dark canvas with cinematic framing   - playback controls
 *   - play/pause                            - current time / duration
 *   - fullscreen                            - comparison mode
 *
 * Because there is no real video (frontend-only prototype, AGENTS.md), the
 * "frame" is the placeholder artwork of whichever scene the playhead is
 * currently inside, crossfaded with <Transition> so scrubbing still feels like
 * playback rather than a hard swap.
 *
 * ACCESSIBILITY
 *   - Native range input for scrubbing: keyboard-operable for free.
 *   - Playhead time is announced politely, not continuously (avoids flooding).
 *   - Fullscreen uses the real Fullscreen API, so the browser's own exit
 *     affordance and the Escape key behave normally.
 */

import { computed, onBeforeUnmount, ref, watch } from "vue";
import { formatClock } from "../../../../shared/utils/format.js";
import { useStore } from "../../composables.js";
import Icon from "../ui/Icon.vue";
import Btn from "../ui/Btn.vue";
import CompareView from "./CompareView.vue";

const store = useStore();

const rootEl = ref(null);
const compareOpen = ref(false);

const playing = computed(() => store.state.playback.playing);
const time = computed(() => store.state.playback.time);
const total = computed(() => store.duration.value);
const scene = computed(() => store.previewScene.value);
const aspectRatio = computed(() => store.state.project.aspectRatio || "9:16");
const scenes = computed(() => store.scenes.value);
/**
 * Frame width cap.
 *
 * The project ships 9:16, so letting the frame use the full 52rem made it
 * ~1480px tall and pushed the workspace into a permanent vertical scroll
 * ("canvas is a bit too big" / "empty space at the bottom"). Only the WIDTH is
 * constrained here - aspect-ratio then derives a height that can never exceed
 * ~48dvh - so the ratio itself always stays exact.
 */
const frameWidth = computed(() => {
  const [w, h] = (aspectRatio.value || "9:16").split(":").map(Number);
  const ratio = h > 0 ? w / h : 9 / 16;
  return `min(100%, 100rem, calc(48dvh * ${ratio}))`;
});

const ariaTime = computed(
  () => `${formatClock(time.value)} of ${formatClock(total.value)}`,
);

/* ------------------------------------------------------------------
 * Playback ticker
 * ------------------------------------------------------------------
 * The store owns play/pause state but not the clock, so this component
 * drives it: while `playing`, advance the playhead in 100ms steps. The
 * interval is cleared on unmount so a paused preview never leaks a timer.
 * ------------------------------------------------------------------ */
let timer = null;

function startTicker() {
  stopTicker();
  timer = window.setInterval(() => {
    const next = time.value + 0.1;
    if (next >= total.value) {
      store.seek(total.value);
      store.stopPlayback();
      return;
    }
    store.seek(next);
  }, 100);
}

function stopTicker() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

watch(playing, (value) => {
  if (value) startTicker();
  else stopTicker();
});

onBeforeUnmount(stopTicker);

/** Scrub from the range input (it fires on every step). */
function scrub(event) {
  store.seek(Number(event.target.value));
}

/** Fullscreen the frame; falls back silently where the API is unavailable. */
async function toggleFullscreen() {
  const el = rootEl.value;
  if (!el) return;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await el.requestFullscreen();
  } catch {
    /* Fullscreen is optional; never break the prototype over it. */
  }
}
</script>

<template>
  <section
    class="flex shrink-0 flex-col gap-2 border-b border-line p-3"
    aria-label="Video preview"
  >
    <!-- Comparison mode (brief section 16) replaces the single frame. -->
    <CompareView v-if="compareOpen" @close="compareOpen = false" />

    <div
      v-else
      ref="rootEl"
      class="relative mx-auto w-full max-w-[min(100%,100rem)] overflow-hidden rounded border border-line bg-black"
      :style="{
        width: frameWidth,
        aspectRatio: aspectRatio.replace(':', ' / '),
      }"
    >
      <!-- Double-buffered crossfade: the frame changes without a hard cut. -->
      <Transition name="pro-cross" mode="out-in">
        <div
          v-if="scene"
          :key="scene.id"
          class="absolute inset-0 grid place-items-center"
          :style="{
            backgroundImage: scene.imageUrl ? `url('${scene.imageUrl}')` : scene.gradient,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
          role="img"
          :aria-label="`${scene.alt} Scene preview: ${scene.title}.`"
        >
          <span class="absolute inset-0 bg-black/20" aria-hidden="true" />
          <p
            class="relative px-6 text-center text-[13px] font-medium text-white/90 drop-shadow"
          >
            {{ scene.title }}
          </p>
        </div>
      </Transition>

      <!-- Empty state: nothing generated yet. -->
      <div
        v-if="!scene"
        class="absolute inset-0 grid place-items-center px-6 text-center"
      >
        <div>
          <Icon name="film" :size="28" class="mx-auto text-ink3" />
          <p class="mt-2 text-[13px] text-ink3">
            Generate a storyboard to fill the preview.
          </p>
        </div>
      </div>

      <!-- Playhead progress across the frame. -->
      <div
        class="absolute inset-y-0 left-0 w-px bg-accent/70"
        :style="{ left: total ? `${(time / total) * 100}%` : '0%' }"
        aria-hidden="true"
      />
    </div>

    <!-- ================== Transport controls ================== -->
    <div
      class="mx-auto flex w-full max-w-[min(100%,52rem)] items-center gap-2"
      :style="{ width: frameWidth }"
    >
      <button
        type="button"
        class="grid size-8 shrink-0 place-items-center rounded bg-accent text-canvas transition-colors hover:bg-[#72a0f7] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:opacity-40"
        :disabled="total === 0"
        :aria-label="playing ? 'Pause preview' : 'Play preview'"
        @click="store.togglePlay()"
      >
        <Icon :name="playing ? 'pause' : 'play'" :size="15" />
      </button>

      <span
        class="shrink-0 font-mono text-[12px] tabular-nums text-ink2"
        aria-live="polite"
      >
        {{ formatClock(time)
        }}<span class="hidden sm:inline"> / {{ formatClock(total) }}</span>
      </span>
      <span class="sr-only">{{ ariaTime }}</span>

      <label class="sr-only" for="pro-playhead">Playhead position</label>
      <input
        id="pro-playhead"
        type="range"
        class="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-line accent-accent"
        min="0"
        :max="total || 1"
        step="0.1"
        :value="time"
        :disabled="total === 0"
        @input="scrub"
      />

      <span
        class="hidden shrink-0 text-[12px] tabular-nums text-ink3 sm:inline"
      >
        {{ scenes.length ? `${scene?.order || 1} / ${scenes.length}` : "—" }}
      </span>

      <Btn
        variant="quiet"
        size="md"
        icon="compare"
        aria-label="Compare"
        @click="compareOpen = true"
      >
        <span class="hidden sm:inline">Compare</span>
      </Btn>
      <Btn
        variant="quiet"
        size="md"
        icon="fullscreen"
        title="Fullscreen"
        aria-label="Toggle fullscreen"
        @click="toggleFullscreen"
      />
    </div>
  </section>
</template>
