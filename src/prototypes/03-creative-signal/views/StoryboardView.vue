<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter, useStore } from '../composables.js'
import { useReducedMotion } from '../composables.js'
import AiStatus from '../components/ui/AiStatus.vue'
import SigButton from '../components/ui/SigButton.vue'
import SigIcon from '../components/ui/SigIcon.vue'

const store = useStore()
const router = useRouter()
const reducedMotion = useReducedMotion()

const storyboard = computed(() => store.state.storyboard)
const frames = computed(() => store.frames.value)
const preview = computed(() => store.state.preview)
const busy = computed(() => store.state.ai.busy)
const task = computed(() => store.state.generating)

const index = computed(() => {
  const total = frames.value.length || 1
  return Math.min(preview.value.frameIndex, total - 1)
})
const frame = computed(() => frames.value[index.value] || null)

/** Advance the playhead through the storyboard's own durations. */
let timer = null
function tick() {
  clearTimeout(timer)
  if (!preview.value.playing) return
  const current = frames.value[preview.value.frameIndex]
  const wait = reducedMotion.value ? 4000 : Math.max(2200, (current?.duration || 6) * 620)
  timer = setTimeout(() => {
    const next = (preview.value.frameIndex + 1) % (frames.value.length || 1)
    store.seekFrame(next)
    tick()
  }, wait)
}

function toggle() {
  store.togglePreview()
  tick()
}

function seek(i) {
  store.seekFrame(i)
  if (preview.value.playing) tick()
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section class="sb" aria-labelledby="sb-title">
    <header class="sb__head">
      <p class="eyebrow">CONTRACTED SEQUENCE // FROM POSSIBILITY TO FRAMES</p>
      <h1 id="sb-title" class="sb__title">THE UNIVERSE, CONTRACTED</h1>
    </header>

    <AiStatus v-if="busy && task === 'storyboard'" />

    <div v-if="!storyboard" class="sb__empty cs-corners">
      <p class="sb__emptytitle">NO SEQUENCE YET</p>
      <p class="sb__emptybody">Stabilise a possibility and turn it into video first.</p>
      <SigButton tone="primary" icon="arrowLeft" @click="router.navigate('/universe')">
        BACK TO UNIVERSE
      </SigButton>
    </div>

    <template v-else>
      <p class="sb__logline">{{ storyboard.logline }}</p>

      <div class="sb__stage cs-corners" :style="{ backgroundImage: frame?.gradient }">
        <p class="sb__frametag">FRAME {{ String(index + 1).padStart(2, '0') }} / {{ String(frames.length).padStart(2, '0') }}</p>
        <h2 class="sb__frametitle">{{ frame?.title }}</h2>
        <p class="sb__frameprompt">{{ frame?.prompt }}</p>
        <div class="sb__controls">
          <SigButton tone="primary" :icon="preview.playing ? 'pause' : 'play'" size="lg" @click="toggle">
            {{ preview.playing ? 'PAUSE' : 'PLAY SEQUENCE' }}
          </SigButton>
          <p class="sb__hint">SPACE toggles playback.</p>
        </div>
      </div>

      <ol class="sb__frames">
        <li v-for="(item, i) in frames" :key="item.id">
          <button type="button" class="sb__thumb" :data-active="i === index" @click="seek(i)">
            <span class="sb__thumbart" :style="{ backgroundImage: item.gradient }" aria-hidden="true" />
            <span class="sb__thumbtext">
              <span class="sb__thumbtitle">{{ String(i + 1).padStart(2, '0') }} · {{ item.title }}</span>
              <span class="sb__thumbmeta tnum">{{ item.duration }}S · {{ item.transition }}</span>
            </span>
            <span v-if="i === index" class="sb__now">NOW SHOWING</span>
          </button>
        </li>
      </ol>

      <div class="sb__actions">
        <SigButton tone="secondary" icon="archive" @click="router.navigate('/archive')">OPEN ARCHIVE</SigButton>
        <SigButton tone="primary" icon="export" @click="router.navigate('/export')">GO TO EXPORT</SigButton>
      </div>
    </template>
  </section>
</template>
<style scoped>
.sb { max-width: 62rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
.sb__head { margin-bottom: 1rem; }
.sb__title { margin: 0.4rem 0 0; font-size: clamp(1.2rem, 3.5vw, 1.8rem); color: var(--color-ink); }
.sb__logline { margin: 0 0 1.25rem; font-size: 13px; line-height: 1.6; color: var(--color-ink2); }
.sb__empty { padding: 1.5rem; background: var(--color-panel); border: 1px solid var(--color-line); display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }
.sb__emptytitle { margin: 0; font-size: 14px; color: var(--color-ink); }
.sb__emptybody { margin: 0; font-size: 13px; color: var(--color-ink2); }
.sb__stage { position: relative; overflow: hidden; min-height: 22rem; display: flex; flex-direction: column; justify-content: flex-end; gap: 0.5rem; padding: 1.5rem; background-size: cover; background-position: center; border: 1px solid var(--color-line); }
.sb__stage::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgb(4 6 10 / 0.9) 10%, transparent 65%); pointer-events: none; }
.sb__stage > * { position: relative; z-index: 1; }
.sb__frametag { margin: 0; font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.16em; color: var(--color-cyan); }
.sb__frametitle { margin: 0; font-size: clamp(1.4rem, 4vw, 2.2rem); color: var(--color-ink); text-shadow: 0 2px 16px rgb(0 0 0 / 0.8); }
.sb__frameprompt { margin: 0; max-width: 40rem; font-size: 13px; line-height: 1.6; color: var(--color-ink2); }
.sb__controls { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.5rem; }
.sb__hint { margin: 0; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; color: var(--color-ink3); }
.sb__frames { list-style: none; margin: 1.25rem 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 0.75rem; }
.sb__thumb { display: flex; gap: 0.7rem; align-items: center; width: 100%; min-height: 64px; padding: 0.6rem; background: var(--color-panel); border: 1px solid var(--color-line); cursor: pointer; text-align: left; color: var(--color-ink); }
.sb__thumb[data-active='true'] { border-color: var(--color-cyan); box-shadow: 0 0 16px -8px var(--color-cyan); }
.sb__thumbart { flex: 0 0 3.2rem; width: 3.2rem; height: 3.2rem; border: 1px solid var(--color-line); }
.sb__thumbtext { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.sb__thumbtitle { font-size: 12px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.sb__thumbmeta { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; color: var(--color-ink3); }
.sb__now { margin-left: auto; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; color: var(--color-cyan); }
.sb__actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.5rem; }
@media (max-width: 480px) { .sb { padding: 1.25rem 0.85rem 3rem; } }
</style>

