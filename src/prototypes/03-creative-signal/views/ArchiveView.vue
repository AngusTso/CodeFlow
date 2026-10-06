<script setup>
import { computed } from 'vue'
import { useRouter, useStore } from '../composables.js'
import SigButton from '../components/ui/SigButton.vue'
import SigIcon from '../components/ui/SigIcon.vue'

const store = useStore()
const router = useRouter()

const entries = computed(() => store.state.archive)
const kinds = { signal: 'SIGNAL', branch: 'BRANCH', synthesis: 'SYNTHESIS', stabilized: 'STABILIZED' }

/** Jump back to a universe node an entry remembers. */
function revisit(entry) {
  if (!entry.nodeId) return
  const exists = store.nodes.value.some((node) => node.id === entry.nodeId)
  if (exists) {
    store.selectOnly(entry.nodeId)
    router.navigate('/universe')
  } else {
    store.notify('THAT POSSIBILITY WAS REMOVED — the memory stays in the archive')
  }
}
</script>

<template>
  <section class="arc" aria-labelledby="arc-title">
    <header class="arc__head">
      <p class="eyebrow">ARCHIVE // MEMORY OF THE CREATIVE JOURNEY</p>
      <h1 id="arc-title" class="arc__title">NOTHING CREATIVE IS EVER LOST</h1>
    </header>

    <div v-if="!entries.length" class="arc__empty cs-corners">
      <p class="arc__emptytitle">ARCHIVE EMPTY</p>
      <p class="arc__emptybody">Every signal, branch, synthesis and stabilisation is remembered here.</p>
      <SigButton tone="primary" icon="arrowLeft" @click="router.navigate('/signal')">SEND A SIGNAL</SigButton>
    </div>

    <ol v-else class="arc__list">
      <li v-for="entry in entries" :key="entry.id" class="arc__item cs-corners">
        <span class="arc__art" :style="{ backgroundImage: entry.gradient }" :role="entry.alt ? 'img' : undefined" :aria-label="entry.alt || undefined" aria-hidden="entry.alt ? undefined : 'true'" />
        <div class="arc__text">
          <p class="arc__code">{{ entry.code }} · {{ kinds[entry.kind] || entry.kind }} · <span class="tnum">{{ entry.stamp }}</span></p>
          <h2 class="arc__entrytitle">{{ entry.title }}</h2>
        </div>
        <SigButton v-if="entry.nodeId" tone="secondary" size="sm" icon="target" @click="revisit(entry)">REVISIT</SigButton>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.arc { max-width: 62rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
.arc__head { margin-bottom: 1.5rem; }
.arc__title { margin: 0.4rem 0 0; font-size: clamp(1.2rem, 3.5vw, 1.8rem); color: var(--color-ink); }
.arc__empty { padding: 1.5rem; background: var(--color-panel); border: 1px solid var(--color-line); display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }
.arc__emptytitle { margin: 0; font-size: 14px; color: var(--color-ink); }
.arc__emptybody { margin: 0; font-size: 13px; color: var(--color-ink2); }
.arc__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.arc__item { display: flex; align-items: center; gap: 0.9rem; padding: 0.8rem; background: var(--color-panel); border: 1px solid var(--color-line); }
.arc__art { flex: 0 0 3rem; width: 3rem; height: 3rem; border: 1px solid var(--color-line); }
.arc__text { flex: 1 1 auto; min-width: 0; }
.arc__code { margin: 0; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; color: var(--color-ink3); }
.arc__entrytitle { margin: 0.25rem 0 0; font-size: 14px; color: var(--color-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 480px) { .arc { padding: 1.25rem 0.85rem 3rem; } .arc__entrytitle { white-space: normal; } }
</style>
