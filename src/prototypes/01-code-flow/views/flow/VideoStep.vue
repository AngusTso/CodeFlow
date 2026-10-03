<script setup>
/**
 * VideoStep.vue — step 5: composition, playback simulation and export
 * (assignment module 4).
 * ---------------------------------------------------------------------------
 * The assignment asks this module to provide:
 *   • "Basic timeline editor showing combined scenes, characters and audio"
 *   • "Playback simulation: auto-play generated video preview with transitions"
 *   • "Export/share options (simulated): resolution, format, platform
 *      optimization (TikTok, Instagram Reels, YouTube Shorts)"
 *
 * There is no real encoding (out of scope), so "export" returns a plausible
 * file descriptor instead of a real file — and says so, honestly, in the UI.
 *
 * IMPORTANT BEHAVIOUR: editing scenes upstream marks the composition stale
 * (the store clears `video.ready`). That is why this screen offers "Compose"
 * again rather than quietly showing an out-of-date preview.
 */

import { computed } from 'vue'
import { formatClock } from '../../../../shared/utils/format.js'
import {
  EXPORT_PLATFORMS,
  FORMATS,
  FPS_OPTIONS,
  RESOLUTIONS,
} from '../../../../shared/data/mockData.js'
import { useStore } from '../../composables.js'
import AppButton from '../../components/ui/AppButton.vue'
import AppIcon from '../../components/ui/AppIcon.vue'
import PlaceholderArt from '../../components/ui/PlaceholderArt.vue'
import VideoPreview from '../../components/video/VideoPreview.vue'

const store = useStore()

const busy = computed(() => store.state.isGenerating)
const scenes = computed(() => store.scenes.value)
const characters = computed(() => store.characters.value)
const video = computed(() => store.state.project.video)
const exportSettings = computed(() => store.state.project.export)
const exportResult = computed(() => store.state.exportResult)

/** Total length in seconds. */
const totalSeconds = computed(() =>
  scenes.value.reduce((sum, scene) => sum + (scene.duration || 0), 0),
)

/** The selected platform preset (for its friendly note). */
const platform = computed(
  () => EXPORT_PLATFORMS.find((entry) => entry.id === exportSettings.value.platform) || EXPORT_PLATFORMS[0],
)

/**
 * The timeline strip. Each scene gets a width proportional to its duration, and
 * the cumulative start time is shown so the strip reads like a real edit.
 */
const timeline = computed(() => {
  const total = totalSeconds.value || 1
  let elapsed = 0

  return scenes.value.map((scene) => {
    const start = elapsed
    elapsed += scene.duration || 0
    return {
      scene,
      start,
      widthPercent: ((scene.duration || 0) / total) * 100,
    }
  })
})

/** Compose (or recompose) the video. */
async function compose() {
  await store.composeVideo()
}

/** Apply a platform preset (also sets resolution/format/fps). */
function choosePlatform(platformId) {
  store.setExportPlatform(platformId)
}

/** Update a single export setting. */
function updateExport(patch) {
  store.updateExport(patch)
}

/** Run the simulated export. */
async function runExport() {
  await store.runExport()
}

/** A fake but clickable share link built from the simulated filename. */
const shareLink = computed(() =>
  exportResult.value ? `https://share.codeflow.example/${exportResult.value.filename}` : '',
)
</script>

<template>
  <div class="space-y-5">
    <!-- ================================================================ -->
    <!-- 1. Compose (or recompose) the video                               -->
    <!-- ================================================================ -->
    <section class="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <!-- Not composed yet (or invalidated because scenes changed). -->
      <template v-if="!video.ready">
        <h2 class="text-lg font-semibold tracking-tight">Ready to compose</h2>
        <p class="mt-1 text-sm text-muted">
          AI will join your {{ scenes.length }} scenes, apply the transitions and add a music bed.
        </p>
        <p class="mt-1 text-sm text-muted">
          Estimated length: {{ formatClock(totalSeconds) }}.
        </p>

        <AppButton
          class="mt-4"
          block
          variant="primary"
          size="lg"
          icon="wand"
          :loading="busy"
          :disabled="scenes.length === 0"
          @click="compose"
        >
          Compose video
        </AppButton>
      </template>

      <!-- Already composed. -->
      <template v-else>
        <div class="flex flex-wrap items-start gap-3">
          <div class="min-w-0 flex-1">
            <h2 class="text-lg font-semibold tracking-tight">Your video</h2>
            <p class="mt-1 text-sm text-muted">
              {{ video.resolution }} · {{ video.aspectRatio }} · {{ formatClock(totalSeconds) }}
            </p>
          </div>

          <AppButton variant="secondary" icon="refresh" :loading="busy" @click="compose">
            Recompose
          </AppButton>
        </div>
      </template>
    </section>

    <!-- ================================================================ -->
    <!-- 2. Playback simulation                                            -->
    <!-- ================================================================ -->
    <VideoPreview v-if="video.ready" :scenes="scenes" :composition="video" :disabled="busy" />

    <!-- ================================================================ -->
    <!-- 3. Timeline strip                                                 -->
    <!-- ================================================================ -->
    <section
      v-if="scenes.length"
      class="rounded-3xl border border-line bg-surface p-4 shadow-sm"
      aria-labelledby="video-timeline-heading"
    >
      <h2 id="video-timeline-heading" class="text-sm font-medium">Timeline</h2>

      <!-- Each block is as wide as its share of the total duration, so the
           strip reads like a real edit at a glance. -->
      <ol class="mt-3 flex gap-1" aria-label="Video timeline">
        <li
          v-for="entry in timeline"
          :key="entry.scene.id"
          class="min-w-0"
          :style="{ width: `${entry.widthPercent}%` }"
        >
          <div class="relative">
            <PlaceholderArt
              :gradient="entry.scene.gradient"
              :alt="entry.scene.alt"
              rounded="rounded-lg"
              class="h-14 w-full"
            />
            <span
              class="absolute inset-x-0 bottom-0 truncate rounded-b-lg bg-ink/75 px-1 py-0.5 text-[10px] text-white"
            >
              {{ entry.scene.order }} · {{ entry.scene.duration }}s
            </span>
          </div>
        </li>
      </ol>

      <p class="mt-2 text-xs text-muted">
        Starts at 0:00 · ends at {{ formatClock(totalSeconds) }}
      </p>
    </section>

    <!-- ================================================================ -->
    <!-- 4. What is in the composition                                     -->
    <!-- ================================================================ -->
    <section
      class="rounded-3xl border border-line bg-surface p-4 shadow-sm"
      aria-labelledby="video-contents-heading"
    >
      <h2 id="video-contents-heading" class="text-sm font-medium">In this video</h2>

      <dl class="mt-3 space-y-3 text-sm">
        <!-- Audio track -->
        <div class="flex items-start gap-3">
          <span class="mt-0.5 text-brand" aria-hidden="true">
            <AppIcon name="music" :size="18" />
          </span>
          <div class="min-w-0">
            <dt class="font-medium">Audio</dt>
            <dd class="text-muted">
              {{ video.ready ? video.audioTrack : 'Added when you compose' }}
            </dd>
          </div>
        </div>

        <!-- Characters -->
        <div class="flex items-start gap-3">
          <span class="mt-0.5 text-brand" aria-hidden="true">
            <AppIcon name="profile" :size="18" />
          </span>
          <div class="min-w-0">
            <dt class="font-medium">Characters</dt>
            <dd class="text-muted">
              {{
                characters.length
                  ? characters.map((character) => character.name).join(', ')
                  : 'None — this video is scene only'
              }}
            </dd>
          </div>
        </div>

        <!-- Output format -->
        <div class="flex items-start gap-3">
          <span class="mt-0.5 text-brand" aria-hidden="true">
            <AppIcon name="layers" :size="18" />
          </span>
          <div class="min-w-0">
            <dt class="font-medium">Output</dt>
            <dd class="text-muted">
              {{ exportSettings.resolution }} · {{ exportSettings.format }} ·
              {{ exportSettings.fps }}fps
            </dd>
          </div>
        </div>
      </dl>
    </section>

    <!-- ================================================================ -->
    <!-- 5. Export / share (simulated)                                     -->
    <!-- ================================================================ -->
    <section
      class="rounded-3xl border border-line bg-surface p-4 shadow-sm"
      aria-labelledby="video-export-heading"
    >
      <h2 id="video-export-heading" class="text-lg font-semibold tracking-tight">Publish</h2>
      <p class="mt-1 text-sm text-muted">
        Pick where this is going and the right settings are applied for you.
      </p>

      <!-- Platform presets (the assignment's "platform optimization"). -->
      <ul class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <li v-for="option in EXPORT_PLATFORMS" :key="option.id">
          <button
            type="button"
            class="flex min-h-11 w-full items-center justify-center rounded-2xl border px-3 text-center text-sm font-medium transition-colors"
            :class="
              exportSettings.platform === option.id
                ? 'border-brand bg-brand-soft text-brand-ink'
                : 'border-line bg-canvas text-muted hover:text-ink'
            "
            :aria-pressed="exportSettings.platform === option.id"
            @click="choosePlatform(option.id)"
          >
            {{ option.label }}
          </button>
        </li>
      </ul>

      <p class="mt-2 text-xs text-muted">{{ platform.note }}</p>

      <!-- Fine-grained settings (updated automatically by the preset). -->
      <div class="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label class="field-label" for="export-resolution">Resolution</label>
          <select
            id="export-resolution"
            class="field mt-1"
            :value="exportSettings.resolution"
            @change="updateExport({ resolution: $event.target.value })"
          >
            <option v-for="option in RESOLUTIONS" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div>
          <label class="field-label" for="export-format">Format</label>
          <select
            id="export-format"
            class="field mt-1"
            :value="exportSettings.format"
            @change="updateExport({ format: $event.target.value })"
          >
            <option v-for="option in FORMATS" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <div>
          <label class="field-label" for="export-fps">Frame rate</label>
          <select
            id="export-fps"
            class="field mt-1"
            :value="String(exportSettings.fps)"
            @change="updateExport({ fps: Number($event.target.value) })"
          >
            <option v-for="option in FPS_OPTIONS" :key="option" :value="option">
              {{ option }} fps
            </option>
          </select>
        </div>
      </div>

      <AppButton
        class="mt-4"
        block
        variant="primary"
        size="lg"
        icon="download"
        :loading="busy"
        :disabled="!video.ready"
        @click="runExport"
      >
        Export video
      </AppButton>

      <p v-if="!video.ready" class="mt-2 text-center text-xs text-muted">
        Compose your video first.
      </p>

      <!-- Export result (simulated). -->
      <div v-if="exportResult" class="mt-4 rounded-2xl border border-line bg-canvas p-4" role="status">
        <p class="flex items-center gap-2 text-sm font-medium text-success">
          <AppIcon name="check" :size="18" />
          Export ready
        </p>
        <p class="mt-1.5 text-sm text-ink">{{ exportResult.filename }}</p>
        <p class="text-xs text-muted">{{ exportResult.size }} · simulated file</p>

        <!-- The share link is labelled as a demo so nobody mistakes this
             prototype for a working publishing tool. -->
        <p class="mt-2 break-all rounded-xl bg-surface p-2 text-xs text-muted">{{ shareLink }}</p>

        <p class="mt-2 text-xs text-muted">
          This is a front-end prototype: no file is created and nothing is uploaded.
        </p>
      </div>
    </section>
  </div>
</template>
