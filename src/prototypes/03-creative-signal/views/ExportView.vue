<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { useRouter, useStore, useReducedMotion } from "../composables.js";
import SigButton from "../components/ui/SigButton.vue";
import SigIcon from "../components/ui/SigIcon.vue";
import AiStatus from "../components/ui/AiStatus.vue";

const store = useStore();
const router = useRouter();
const reducedMotion = useReducedMotion();

const concept = computed(() => store.state.concept);
const frames = computed(() => store.frames.value);
const exp = computed(() => store.state.export);
const settings = computed(() => exp.value.settings);
const result = computed(() => exp.value.result);
const options = computed(() => store.exportOptions);
const total = computed(() =>
  frames.value.reduce((s, f) => s + (f.duration || 0), 0),
);

/* ------------------------------------------------------------------ */
/* Mock video player (same preview state as the storyboard screen)     */
/* ------------------------------------------------------------------ */

const storyboard = computed(() => store.state.storyboard);
const preview = computed(() => store.state.preview);

const index = computed(() => {
  const count = frames.value.length || 1;
  return Math.min(preview.value.frameIndex, count - 1);
});
const frame = computed(() => frames.value[index.value] || null);

/** Advance the playhead through the storyboard's own durations. */
let timer = null;
function tick() {
  clearTimeout(timer);
  if (!preview.value.playing) return;
  const current = frames.value[preview.value.frameIndex];
  const wait = reducedMotion.value
    ? 4000
    : Math.max(2200, (current?.duration || 6) * 620);
  timer = setTimeout(() => {
    const next = (preview.value.frameIndex + 1) % (frames.value.length || 1);
    store.seekFrame(next);
    tick();
  }, wait);
}

function toggle() {
  store.togglePreview();
  tick();
}

function seek(i) {
  store.seekFrame(i);
  if (preview.value.playing) tick();
}

onBeforeUnmount(() => clearTimeout(timer));

/* ------------------------------------------------------------------ */
/* Timeline editor — node-based swap (select two scenes, then SWAP)    */
/* ------------------------------------------------------------------ */

/** The two scene nodes selected for a swap (mirrors select-2-to-combine). */
const timelineSel = ref([]);

function pickScene(id) {
  if (timelineSel.value.includes(id)) {
    timelineSel.value = timelineSel.value.filter((item) => item !== id);
    return;
  }
  timelineSel.value = [...timelineSel.value, id].slice(-2);
}

const canSwap = computed(() => timelineSel.value.length === 2);

function swap() {
  if (!canSwap.value) return;
  const [a, b] = timelineSel.value;
  store.swapScenes(a, b);
  timelineSel.value = [];
}

async function deliver() {
  await store.runExport();
}
</script>

<template>
  <section class="exp" aria-labelledby="exp-title">
    <header class="exp__head">
      <p class="eyebrow">EXPORT // SIMULATED DELIVERY</p>
      <h1 id="exp-title" class="exp__title">DELIVER THE SEQUENCE</h1>
    </header>

    <div v-if="!concept" class="exp__empty cs-corners">
      <p class="exp__emptytitle">NOTHING TO DELIVER YET</p>
      <p class="exp__emptybody">Stabilise a possibility first.</p>
      <SigButton
        tone="primary"
        icon="arrowLeft"
        @click="router.navigate('/universe')"
        >BACK TO UNIVERSE</SigButton
      >
    </div>

    <template v-else>
      <div class="exp__summary cs-corners">
        <p class="eyebrow">SEQUENCE</p>
        <h2 class="exp__concept">{{ concept.title }}</h2>
        <p class="exp__meta tnum">
          {{ frames.length }} FRAMES · {{ total }}S TOTAL
        </p>
      </div>

      <!-- ===================== Before conversion (s. 29) ===================== -->
      <div v-if="!storyboard" class="exp__noboard cs-corners">
        <p class="exp__noboardtitle">NO SEQUENCE YET</p>
        <p class="exp__noboardbody">
          The concept is stabilised. Turn it into a video to preview the mock
          sequence, edit the timeline and deliver.
        </p>
        <SigButton
          tone="primary"
          icon="film"
          :disabled="exp.busy"
          @click="store.turnIntoVideo()"
        >
          TURN INTO VIDEO
        </SigButton>
        <AiStatus
          v-if="
            exp.busy ||
            (store.state.ai.busy && store.state.generating === 'storyboard')
          "
        />
      </div>

      <template v-else>
        <!-- ===================== Mock video (s. 31) ===================== -->
        <div
          class="exp__video cs-corners"
          :style="{
            backgroundImage: frame?.imageUrl
              ? `url('${frame.imageUrl}')`
              : frame?.gradient,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
        >
          <p class="exp__videotag tnum">
            MOCK VIDEO · FRAME {{ String(index + 1).padStart(2, "0") }} /
            {{ String(frames.length).padStart(2, "0") }}
          </p>
          <h3 class="exp__videotitle">{{ frame?.title }}</h3>
          <p class="exp__videoprompt">{{ frame?.prompt }}</p>
          <div class="exp__playerctl">
            <SigButton
              tone="primary"
              size="lg"
              :icon="preview.playing ? 'pause' : 'play'"
              @click="toggle"
            >
              {{ preview.playing ? "PAUSE" : "PLAY MOCK VIDEO" }}
            </SigButton>
            <SigButton
              tone="ghost"
              icon="arrowLeft"
              :disabled="index === 0"
              aria-label="Previous frame"
              @click="seek(index - 1)"
            >
              PREV
            </SigButton>
            <SigButton
              tone="ghost"
              icon="arrowRight"
              :disabled="index >= frames.length - 1"
              aria-label="Next frame"
              @click="seek(index + 1)"
            >
              NEXT
            </SigButton>
            <p class="exp__playerhint tnum">SPACE toggles playback.</p>
          </div>
        </div>

        <!-- ===================== Sequence strip (s. 30) ===================== -->
        <ol
          class="exp__seq"
          aria-label="Scene sequence — select a frame to preview it"
        >
          <li v-for="(item, i) in frames" :key="item.id">
            <button
              type="button"
              class="exp__seqchip"
              :data-active="i === index"
              @click="seek(i)"
            >
              <span class="exp__seqnum tnum">{{
                String(i + 1).padStart(2, "0")
              }}</span>
              <span class="exp__seqtitle">{{ item.title }}</span>
              <span class="exp__seqdur tnum">{{ item.duration }}S</span>
            </button>
          </li>
        </ol>

        <!-- ===================== Timeline editor (node swap) ===================== -->
        <section
          class="exp__timeline cs-corners"
          aria-labelledby="exp-tl-title"
        >
          <header class="exp__tlhead">
            <div>
              <p class="eyebrow">TIMELINE EDITOR</p>
              <h3 id="exp-tl-title" class="exp__tltitle">
                REORDER THE SEQUENCE
              </h3>
            </div>
            <p class="exp__tlstatus" role="status">
              <template v-if="timelineSel.length === 2"
                >2 SELECTED — READY TO SWAP</template
              >
              <template v-else-if="timelineSel.length === 1"
                >1 SELECTED — PICK ONE MORE</template
              >
              <template v-else>SELECT TWO SCENES TO SWAP</template>
            </p>
          </header>

          <ol class="exp__track">
            <li v-for="(item, i) in frames" :key="item.id">
              <button
                type="button"
                class="exp__node"
                :data-active="timelineSel.includes(item.id)"
                :aria-pressed="timelineSel.includes(item.id)"
                :aria-label="`Scene ${i + 1}: ${item.title}. Select for swap.`"
                @click="pickScene(item.id)"
              >
                <span
                  class="exp__nodeart"
                  :style="{
                    backgroundImage: item.imageUrl
                      ? `url('${item.imageUrl}')`
                      : item.gradient,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }"
                  aria-hidden="true"
                />
                <span class="exp__nodeinfo">
                  <span class="exp__nodenum tnum"
                    >SC {{ String(i + 1).padStart(2, "0") }}</span
                  >
                  <span class="exp__nodetitle">{{ item.title }}</span>
                </span>
                <span v-if="timelineSel.includes(item.id)" class="exp__nodesel"
                  >SELECTED</span
                >
              </button>
            </li>
          </ol>

          <div class="exp__tlactions">
            <SigButton
              tone="primary"
              icon="merge"
              :disabled="!canSwap"
              @click="swap"
            >
              SWAP SELECTED
            </SigButton>
            <p class="exp__tlhint">
              Node-based swap: pick two scene nodes, then swap their place in
              the order.
            </p>
          </div>
        </section>
      </template>

      <div class="exp__grid">
        <fieldset class="exp__group">
          <legend class="eyebrow">PLATFORM</legend>
          <div class="exp__opts">
            <label
              v-for="p in options.platforms"
              :key="p.id"
              class="exp__opt"
              :data-active="settings.platform === p.id"
            >
              <input
                type="radio"
                name="exp-platform"
                class="sr-only"
                :value="p.id"
                :checked="settings.platform === p.id"
                @change="store.setExportPlatform(p.id)"
              />
              <span>{{ p.label }}</span>
            </label>
          </div>
        </fieldset>
        <fieldset class="exp__group">
          <legend class="eyebrow">RESOLUTION</legend>
          <div class="exp__opts">
            <label
              v-for="r in options.resolutions"
              :key="r"
              class="exp__opt"
              :data-active="settings.resolution === r"
            >
              <input
                type="radio"
                name="exp-res"
                class="sr-only"
                :value="r"
                :checked="settings.resolution === r"
                @change="store.setExportOption('resolution', r)"
              />
              <span class="tnum">{{ r }}</span>
            </label>
          </div>
        </fieldset>
        <fieldset class="exp__group">
          <legend class="eyebrow">FORMAT</legend>
          <div class="exp__opts">
            <label
              v-for="f in options.formats"
              :key="f"
              class="exp__opt"
              :data-active="settings.format === f"
            >
              <input
                type="radio"
                name="exp-fmt"
                class="sr-only"
                :value="f"
                :checked="settings.format === f"
                @change="store.setExportOption('format', f)"
              />
              <span class="tnum">{{ f }}</span>
            </label>
          </div>
        </fieldset>
      </div>

      <AiStatus v-if="exp.busy" />

      <div class="exp__actions">
        <SigButton
          tone="secondary"
          icon="film"
          @click="router.navigate('/storyboard')"
          >REVIEW SEQUENCE</SigButton
        >
        <SigButton
          tone="primary"
          icon="download"
          :disabled="exp.busy"
          @click="deliver"
          >Export Video</SigButton
        >
      </div>

      <div v-if="result" class="exp__result cs-corners" role="status">
        <p class="exp__resulttitle">
          <SigIcon name="check" :size="14" /> Export Video
        </p>
        <p class="exp__resultbody">
          {{ result.filename }} — no file was written. This prototype simulates
          delivery only.
        </p>
      </div>
    </template>
  </section>
</template>
<style scoped>
.exp {
  max-width: 62rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}
.exp__head {
  margin-bottom: 1.5rem;
}
.exp__title {
  margin: 0.4rem 0 0;
  font-size: 1.4rem;
  color: var(--color-ink);
}
.exp__empty {
  padding: 1.5rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}
.exp__emptytitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-ink);
}
.exp__emptybody {
  margin: 0;
  font-size: 13px;
  color: var(--color-ink2);
}
.exp__summary {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
}
.exp__concept {
  margin: 0.3rem 0 0.2rem;
  font-size: 1.1rem;
  color: var(--color-ink);
}
.exp__meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-cyan);
}
.exp__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}
.exp__group {
  margin: 0;
  padding: 0.85rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
}
.exp__opts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}
.exp__opt {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  padding: 0.45rem 0.8rem;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink2);
  cursor: pointer;
}
.exp__opt[data-active="true"] {
  color: var(--color-cyan);
  border-color: var(--color-cyan);
  font-weight: 700;
}
.exp__opt:has(:focus-visible) {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
.exp__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}
.exp__result {
  margin-top: 1.25rem;
  padding: 1rem;
  background: var(--color-panel);
  border: 1px solid var(--color-green);
}
.exp__resulttitle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-green);
}
.exp__resultbody {
  margin: 0.5rem 0 0;
  font-size: 13px;
  color: var(--color-ink2);
}

/* ---- Before conversion ---------------------------------------------------- */
.exp__noboard {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1.25rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
}
.exp__noboardtitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-ink);
}
.exp__noboardbody {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-ink2);
}

/* ---- Mock video ----------------------------------------------------------- */
.exp__video {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.4rem;
  min-height: 16rem;
  margin-bottom: 1rem;
  padding: 1.25rem;
  background-size: cover;
  background-position: center;
  border: 1px solid var(--color-line);
}
.exp__video::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(4 6 10 / 0.92) 12%, transparent 70%);
  pointer-events: none;
}
.exp__video > * {
  position: relative;
  z-index: 1;
}
.exp__videotag {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  color: var(--color-cyan);
}
.exp__videotitle {
  margin: 0;
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  color: var(--color-ink);
  text-shadow: 0 2px 14px rgb(0 0 0 / 0.85);
}
.exp__videoprompt {
  margin: 0;
  max-width: 42rem;
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-ink2);
}
.exp__playerctl {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
}
.exp__playerhint {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--color-ink3);
}

/* ---- Sequence strip ------------------------------------------------------- */
.exp__seq {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0 0 1.25rem;
  padding: 0;
}
.exp__seqchip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  max-width: 100%;
  padding: 0.4rem 0.7rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  color: var(--color-ink2);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition:
    border-color 140ms ease,
    color 140ms ease;
}
.exp__seqchip:hover {
  border-color: var(--color-cyan);
  color: var(--color-ink);
}
.exp__seqchip[data-active="true"] {
  border-color: var(--color-cyan);
  color: var(--color-cyan);
  font-weight: 700;
}
.exp__seqnum {
  letter-spacing: 0.1em;
  color: var(--color-ink3);
}
.exp__seqchip[data-active="true"] .exp__seqnum {
  color: var(--color-cyan);
}
.exp__seqtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 12rem;
}
.exp__seqdur {
  color: var(--color-ink3);
}

/* ---- Timeline editor ------------------------------------------------------ */
.exp__timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
}
.exp__tlhead {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.exp__tltitle {
  margin: 0.2rem 0 0;
  font-size: 13px;
  color: var(--color-ink);
}
.exp__tlstatus {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-cyan);
}
.exp__track {
  list-style: none;
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0.5rem;
  overflow-x: auto;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
}
.exp__node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 0 0 auto;
  min-height: 56px;
  max-width: 14rem;
  padding: 0.45rem 0.6rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  color: var(--color-ink);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 140ms ease,
    box-shadow 140ms ease;
}
.exp__node:hover {
  border-color: var(--color-cyan);
}
.exp__node[data-active="true"] {
  border-color: var(--color-cyan);
  box-shadow:
    0 0 0 1px var(--color-cyan),
    0 0 18px -8px var(--color-cyan);
}
.exp__nodeart {
  flex: 0 0 2.4rem;
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid var(--color-line);
}
.exp__nodeinfo {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.exp__nodenum {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--color-ink3);
}
.exp__nodetitle {
  font-size: 11px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 8rem;
}
.exp__nodesel {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 1px 4px;
  background: rgb(7 8 12 / 0.85);
  border: 1px solid var(--color-cyan);
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.1em;
  color: var(--color-cyan);
}
.exp__tlactions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.exp__tlhint {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.5;
  letter-spacing: 0.05em;
  color: var(--color-ink3);
}

@media (max-width: 480px) {
  .exp__video {
    min-height: 13rem;
    padding: 1rem 0.85rem;
  }
  .exp__seqtitle {
    max-width: 7rem;
  }
  .exp__node {
    max-width: 11rem;
  }
}
</style>
