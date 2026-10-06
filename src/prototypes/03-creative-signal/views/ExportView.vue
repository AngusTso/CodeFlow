<script setup>
import { computed } from 'vue'
import { useRouter, useStore } from '../composables.js'
import SigButton from '../components/ui/SigButton.vue'
import SigIcon from '../components/ui/SigIcon.vue'
import AiStatus from '../components/ui/AiStatus.vue'

const store = useStore()
const router = useRouter()

const concept = computed(() => store.state.concept)
const frames = computed(() => store.frames.value)
const exp = computed(() => store.state.export)
const settings = computed(() => exp.value.settings)
const result = computed(() => exp.value.result)
const options = computed(() => store.exportOptions)
const total = computed(() => frames.value.reduce((s, f) => s + (f.duration || 0), 0))

async function deliver() {
  await store.runExport()
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
      <SigButton tone="primary" icon="arrowLeft" @click="router.navigate('/universe')">BACK TO UNIVERSE</SigButton>
    </div>

    <template v-else>
      <div class="exp__summary cs-corners">
        <p class="eyebrow">SEQUENCE</p>
        <h2 class="exp__concept">{{ concept.title }}</h2>
        <p class="exp__meta tnum">{{ frames.length }} FRAMES · {{ total }}S TOTAL</p>
      </div>

      <div class="exp__grid">
        <fieldset class="exp__group">
          <legend class="eyebrow">PLATFORM</legend>
          <div class="exp__opts">
            <label v-for="p in options.platforms" :key="p.id" class="exp__opt" :data-active="settings.platform === p.id">
              <input type="radio" name="exp-platform" class="sr-only" :value="p.id" :checked="settings.platform === p.id" @change="store.setExportPlatform(p.id)" />
              <span>{{ p.label }}</span>
            </label>
          </div>
        </fieldset>
        <fieldset class="exp__group">
          <legend class="eyebrow">RESOLUTION</legend>
          <div class="exp__opts">
            <label v-for="r in options.resolutions" :key="r" class="exp__opt" :data-active="settings.resolution === r">
              <input type="radio" name="exp-res" class="sr-only" :value="r" :checked="settings.resolution === r" @change="store.setExportOption('resolution', r)" />
              <span class="tnum">{{ r }}</span>
            </label>
          </div>
        </fieldset>
        <fieldset class="exp__group">
          <legend class="eyebrow">FORMAT</legend>
          <div class="exp__opts">
            <label v-for="f in options.formats" :key="f" class="exp__opt" :data-active="settings.format === f">
              <input type="radio" name="exp-fmt" class="sr-only" :value="f" :checked="settings.format === f" @change="store.setExportOption('format', f)" />
              <span class="tnum">{{ f }}</span>
            </label>
          </div>
        </fieldset>
      </div>

      <AiStatus v-if="exp.busy" />

      <div class="exp__actions">
        <SigButton tone="secondary" icon="film" @click="router.navigate('/storyboard')">REVIEW SEQUENCE</SigButton>
        <SigButton tone="primary" icon="download" :disabled="exp.busy" @click="deliver">SIMULATE DELIVERY</SigButton>
      </div>

      <div v-if="result" class="exp__result cs-corners" role="status">
        <p class="exp__resulttitle"><SigIcon name="check" :size="14" /> DELIVERY SIMULATED</p>
        <p class="exp__resultbody">{{ result.filename }} — no file was written. This prototype simulates delivery only.</p>
      </div>
    </template>
  </section>
</template>
<style scoped>
.exp { max-width: 62rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
.exp__head { margin-bottom: 1.5rem; }
.exp__title { margin: 0.4rem 0 0; font-size: 1.4rem; color: var(--color-ink); }
.exp__empty { padding: 1.5rem; background: var(--color-panel); border: 1px solid var(--color-line); display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }
.exp__emptytitle { margin: 0; font-size: 14px; color: var(--color-ink); }
.exp__emptybody { margin: 0; font-size: 13px; color: var(--color-ink2); }
.exp__summary { margin-bottom: 1.25rem; padding: 1rem; background: var(--color-panel); border: 1px solid var(--color-line); }
.exp__concept { margin: 0.3rem 0 0.2rem; font-size: 1.1rem; color: var(--color-ink); }
.exp__meta { margin: 0; font-family: var(--font-mono); font-size: 11px; color: var(--color-cyan); }
.exp__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem; }
.exp__group { margin: 0; padding: 0.85rem; background: var(--color-panel); border: 1px solid var(--color-line); }
.exp__opts { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
.exp__opt { display: inline-flex; min-height: 44px; align-items: center; padding: 0.45rem 0.8rem; background: var(--color-terminal); border: 1px solid var(--color-line); font-family: var(--font-mono); font-size: 11px; color: var(--color-ink2); cursor: pointer; }
.exp__opt[data-active='true'] { color: var(--color-cyan); border-color: var(--color-cyan); font-weight: 700; }
.exp__opt:has(:focus-visible) { outline: 2px solid var(--color-ink); outline-offset: 2px; }
.exp__actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.5rem; }
.exp__result { margin-top: 1.25rem; padding: 1rem; background: var(--color-panel); border: 1px solid var(--color-green); }
.exp__resulttitle { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-family: var(--font-mono); font-size: 12px; color: var(--color-green); }
.exp__resultbody { margin: 0.5rem 0 0; font-size: 13px; color: var(--color-ink2); }
</style>

