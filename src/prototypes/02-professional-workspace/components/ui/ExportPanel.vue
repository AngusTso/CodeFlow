<script setup>
/**
 * ExportPanel.vue — the finishing step of the workflow.
 * ---------------------------------------------------------------------------
 * A modal, because export is a decision rather than a place: pick a destination,
 * read what it will produce, and confirm.
 *
 * Two things it deliberately does NOT do:
 *
 *   - It never shows a fake percentage. While exporting it reports the named
 *     composition stages the store is actually on.
 *   - It never pretends a file was written. The prototype has no encoder, so
 *     the result step says so plainly and offers the one real affordance
 *     available: copying the file name.
 *
 * Escape closes the dialog from App.vue's global handler.
 */

import { computed, onMounted, ref } from 'vue'
import { useStore } from '../../composables.js'
import { EXPORT_PLATFORMS } from '../../../../shared/data/mockData.js'
import { formatClock } from '../../../../shared/utils/format.js'
import Btn from './Btn.vue'
import Icon from './Icon.vue'

const emit = defineEmits(['close'])

const store = useStore()

const settings = computed(() => store.state.project.export)
const result = computed(() => store.state.exportPanel.result)
const project = computed(() => store.state.project)
const sceneCount = computed(() => store.scenes.value.length)
const total = computed(() => store.duration.value)

/** The sequence length written the way a tool shows time, e.g. "0:34". */
const runtimeLabel = computed(() => formatClock(store.duration.value))

/** Export has its own in-flight flag; the shared AI flag is used elsewhere. */
const busy = ref(false)
const notice = ref('')
const copied = ref(false)

const closeBtn = ref(null)

// Modal focus management: land on the dismiss control, not mid-form.
onMounted(() => closeBtn.value?.focus())

/** The composition stages the store is working through, for the live status. */
const stages = computed(() => store.state.ai.stages)
const stageIndex = computed(() => store.state.ai.stageIndex)
const stage = computed(() => stages.value[stageIndex.value] || 'Assembling composition')

/** Choose a destination; this re-writes the export settings as one undo step. */
function choose(platformId) {
  if (busy.value || platformId === settings.value.platform) return
  store.setExportPlatform(platformId)
  notice.value = ''
}

/** A result only belongs to the destination it was made for. */
const resultIsCurrent = computed(
  () => Boolean(result.value) && result.value.settings.platform === settings.value.platform,
)

/** True when an export exists but the destination has changed since. */
const resultIsStale = computed(() => Boolean(result.value) && !resultIsCurrent.value)

/** Run the simulated export. */
async function run() {
  if (busy.value) return
  busy.value = true
  notice.value = ''
  try {
    const outcome = await store.runExport()
    if (!outcome) notice.value = 'Export stopped before it finished.'
  } finally {
    busy.value = false
  }
}

/** Copy the produced file name — the only real artefact a prototype can give. */
async function copyName() {
  if (!result.value) return
  try {
    await navigator.clipboard.writeText(result.value.filename)
    copied.value = true
    notice.value = `Copied “${result.value.filename}”.`
  } catch {
    notice.value = 'This browser blocked clipboard access — copy the name by hand.'
  }
}
</script>

<template>
  <!-- Overlay: dimmed, with the workspace still visible behind it. Clicking the
       backdrop is enough to dismiss — nothing here is destructive. -->
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-canvas/85 p-4"
    @click.self="emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-title"
      class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
    >
      <!-- ============================ Header ============================ -->
      <header class="flex items-center gap-3 border-b border-line px-4 py-3">
        <span class="grid size-8 shrink-0 place-items-center rounded bg-raised text-accent" aria-hidden="true">
          <Icon name="download" :size="16" />
        </span>
        <div class="min-w-0 flex-1">
          <h2 id="export-title" class="text-[14px] font-semibold text-ink">Export</h2>
          <p class="truncate text-[11px] text-ink3">
            {{ project.title }} · {{ sceneCount }} scenes · {{ runtimeLabel }} ·
            {{ project.aspectRatio }}
          </p>
        </div>
        <button
          ref="closeBtn"
          type="button"
          class="grid size-8 shrink-0 place-items-center rounded text-ink2 hover:bg-elevated hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Close the export dialog"
          @click="emit('close')"
        >
          <Icon name="close" :size="16" />
        </button>
      </header>

      <!-- ============================= Body ============================= -->
      <div class="grid min-h-0 flex-1 gap-4 overflow-y-auto scroll p-4 md:grid-cols-[1.25fr_1fr]">
        <!-- ---------------- Destination ---------------- -->
        <section aria-labelledby="export-destination">
          <h3 id="export-destination" class="eyebrow mb-2">Destination</h3>
          <ul class="space-y-2">
            <li v-for="platform in EXPORT_PLATFORMS" :key="platform.id">
              <button
                type="button"
                class="w-full rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45"
                :class="
                  settings.platform === platform.id
                    ? 'border-accent bg-elevated'
                    : 'border-line bg-surface hover:border-[#3a4552] hover:bg-elevated'
                "
                :aria-pressed="settings.platform === platform.id"
                :disabled="busy"
                @click="choose(platform.id)"
              >
                <span class="flex items-center gap-2">
                  <span class="text-[13px] font-semibold text-ink">{{ platform.label }}</span>
                  <span class="ml-auto font-mono text-[10px] text-ink3">{{ platform.aspectRatio }}</span>
                  <Icon
                    v-if="settings.platform === platform.id"
                    name="check"
                    :size="14"
                    class="text-accent"
                  />
                </span>
                <span class="mt-0.5 block text-[11px] text-ink3">
                  {{ platform.resolution }} · {{ platform.format }} · {{ platform.fps }}fps
                </span>
                <span class="mt-0.5 block text-[11px] text-ink3">{{ platform.note }}</span>
              </button>
            </li>
          </ul>
        </section>

        <!-- ---------------- Summary ---------------- -->
        <section class="space-y-3" aria-labelledby="export-summary">
          <h3 id="export-summary" class="eyebrow">What will be produced</h3>

          <dl class="overflow-hidden rounded-lg border border-line text-[11px]">
            <div class="flex gap-2 border-b border-line px-2.5 py-1.5">
              <dt class="w-24 shrink-0 text-ink3">Aspect ratio</dt>
              <dd class="flex-1 text-ink">{{ project.aspectRatio }}</dd>
            </div>
            <div class="flex gap-2 border-b border-line px-2.5 py-1.5">
              <dt class="w-24 shrink-0 text-ink3">Resolution</dt>
              <dd class="flex-1 text-ink">{{ settings.resolution }}</dd>
            </div>
            <div class="flex gap-2 border-b border-line px-2.5 py-1.5">
              <dt class="w-24 shrink-0 text-ink3">Format</dt>
              <dd class="flex-1 text-ink">{{ settings.format }}</dd>
            </div>
            <div class="flex gap-2 border-b border-line px-2.5 py-1.5">
              <dt class="w-24 shrink-0 text-ink3">Frame rate</dt>
              <dd class="flex-1 text-ink">{{ settings.fps }} fps</dd>
            </div>
            <div class="flex gap-2 px-2.5 py-1.5">
              <dt class="w-24 shrink-0 text-ink3">Length</dt>
              <dd class="flex-1 text-ink">{{ runtimeLabel }} · {{ sceneCount }} scenes</dd>
            </div>
          </dl>
          <!-- Live, stage-based status. Never a percentage. -->
          <div
            v-if="busy"
            class="rounded-lg border border-line bg-raised p-3"
            role="status"
            aria-live="polite"
          >
            <p class="flex items-center gap-2 text-[12px] text-ink">
              <span
                class="size-3.5 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent"
                aria-hidden="true"
              />
              {{ stage }}
            </p>
            <ol class="mt-2 space-y-0.5">
              <li
                v-for="(entry, index) in stages"
                :key="entry"
                class="text-[11px]"
                :class="index <= stageIndex ? 'text-ink2' : 'text-ink3'"
              >
                {{ entry }}
              </li>
            </ol>
          </div>

          <!-- Result, shown only while it still matches the chosen destination. -->
          <div v-else-if="resultIsCurrent" class="rounded-lg border border-accent bg-raised p-3">
            <p class="eyebrow mb-1 text-accent">Export complete</p>
            <p class="break-all font-mono text-[12px] text-ink">{{ result.filename }}</p>
            <p class="mt-1 text-[11px] text-ink2">
              {{ result.size }} · {{ result.settings.resolution }}
            </p>
            <p class="mt-2 text-[11px] text-ink3">
              Simulated result: this prototype ships no encoder, so nothing is written to disk.
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <Btn size="sm" variant="ghost" icon="copy" @click="copyName">
                {{ copied ? 'Copied' : 'Copy file name' }}
              </Btn>
              <Btn size="sm" variant="quiet" icon="refresh" @click="run">Export again</Btn>
            </div>
          </div>

          <p
            v-else-if="resultIsStale"
            class="rounded-lg border border-dashed border-line p-3 text-[11px] text-ink3"
          >
            The destination changed since the last export — export again for a matching result.
          </p>

          <p v-if="notice" class="text-[11px] text-ink2" role="status" aria-live="polite">
            {{ notice }}
          </p>
        </section>
      </div>

      <!-- ============================ Footer ============================ -->
      <footer class="flex items-center gap-2 border-t border-line px-4 py-3">
        <p class="hidden flex-1 text-[11px] text-ink3 sm:block">
          In a shipped tool this is also where captions, credits and audio levels would be confirmed.
        </p>
        <Btn variant="ghost" @click="emit('close')">Close</Btn>
        <Btn variant="primary" icon="download" :loading="busy" :disabled="busy" @click="run">
          {{ resultIsCurrent ? 'Export again' : 'Export video' }}
        </Btn>
      </footer>
    </div>
  </div>
</template>

