/**
 * App.vue - Prototype 03 shell: header, terminal nav, view region, feedback.
 * Routes: signal, universe, lab, archive, storyboard, export.
 */
<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useReducedMotion, useRouter, useStore } from './composables.js'
import TerminalNav from './components/shell/TerminalNav.vue'
import SynthesisModal from './components/modals/SynthesisModal.vue'
import PossibilityModal from './components/modals/PossibilityModal.vue'
import StabilizeModal from './components/modals/StabilizeModal.vue'
import SigButton from './components/ui/SigButton.vue'
import SigIcon from './components/ui/SigIcon.vue'
import SignalView from './views/SignalView.vue'
import UniverseView from './views/UniverseView.vue'
import LabView from './views/LabView.vue'
import StoryboardView from './views/StoryboardView.vue'
import ArchiveView from './views/ArchiveView.vue'
import ExportView from './views/ExportView.vue'

const router = useRouter()
const store = useStore()
const reducedMotion = useReducedMotion()

const routeName = computed(() => router.route.value?.name || 'signal')
const toast = computed(() => store.state.toast)
const error = computed(() => store.state.error)

/** True when the keystroke started inside an editable control. */
function typingTarget(event) {
  const el = event.target
  if (!el || !el.tagName) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable
}

/** Global accelerators - optional duplicates of visible controls (s. 79). */
function onKeydown(event) {
  if (typingTarget(event)) return
  if (event.ctrlKey || event.metaKey || event.altKey) return

  if (event.key === 'Escape') {
    if (store.state.synthesis.open) store.closeSynthesis()
    else if (store.state.alternatives.open) store.closeAlternatives()
    else if (router.route.value?.name !== 'universe') router.navigate('/universe')
    return
  }

  if (event.key === ' ') {
    if (store.state.storyboard) {
      event.preventDefault()
      store.togglePreview()
    }
    return
  }

  const jumps = { 1: '/signal', 2: '/universe', 3: '/lab', 4: '/archive', 5: '/export' }
  if (jumps[event.key]) {
    const item = jumps[event.key]
    if (item === '/export' && !store.state.concept) return
    router.navigate(item)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

/** Dismiss the error banner explicitly - errors never vanish silently. */
function dismissError() {
  store.state.error = ''
}
</script>

<template>
  <div class="cs-app" :data-motion="reducedMotion.value ? 'reduced' : 'full'">
    <a class="cs-skip" href="#cs-main">Skip to the creative surface</a>

    <header class="cs-head">
      <p class="cs-brand">
        <span class="cs-brand__mark" aria-hidden="true">◉</span>
        <span class="cs-brand__name">CREATIVE&nbsp;SIGNAL</span>
        <span class="cs-brand__sub">AI CREATIVE EXPLORATION SYSTEM</span>
      </p>
      <p class="cs-demo">
        <SigIcon name="flask" :size="12" />
        SIMULATED AI GENERATION · DEMO MODE
      </p>
    </header>

    <TerminalNav />

    <main id="cs-main" class="cs-main" tabindex="-1">
      <SignalView v-if="routeName === 'signal'" />
      <UniverseView v-else-if="routeName === 'universe'" />
      <LabView v-else-if="routeName === 'lab'" />
      <StoryboardView v-else-if="routeName === 'storyboard'" />
      <ArchiveView v-else-if="routeName === 'archive'" />
      <ExportView v-else-if="routeName === 'export'" />
      <div v-else class="cs-unknown cs-corners">
        <p class="eyebrow">UNKNOWN SECTION</p>
        <p>This path does not exist in the Creative Signal system.</p>
        <SigButton tone="primary" @click="router.navigate('/signal')">RETURN TO SIGNAL</SigButton>
      </div>
    </main>

    <div v-if="error" class="cs-error" role="alert">
      <SigIcon name="warn" :size="14" />
      <p>{{ error }}</p>
      <SigButton tone="ghost" size="sm" @click="dismissError">DISMISS</SigButton>
    </div>

    <div v-if="toast.visible" class="cs-toast" role="status">
      <p>{{ toast.message }}</p>
      <SigButton v-if="toast.undo" tone="secondary" size="sm" icon="undo" @click="store.runUndo()">
        {{ toast.action || 'UNDO' }}
      </SigButton>
    </div>

    <SynthesisModal />
    <PossibilityModal />
    <StabilizeModal />
  </div>
</template>
<style scoped>
.cs-app { position: relative; min-height: 100vh; display: flex; flex-direction: column; background: var(--color-space); }
.cs-app::before { content: ''; position: fixed; inset: 0; z-index: 60; pointer-events: none; background: repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.022) 0 1px, transparent 1px 4px); }
.cs-skip { position: absolute; top: -4rem; left: 0.5rem; z-index: 100; padding: 0.6rem 1rem; background: var(--color-cyan); color: #06121a; font-family: var(--font-mono); font-size: 12px; font-weight: 700; text-decoration: none; }
.cs-skip:focus-visible { top: 0.5rem; }
.cs-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 0.7rem 1rem; border-bottom: 1px solid var(--color-line); background: var(--color-terminal); }
.cs-brand { display: flex; align-items: baseline; gap: 0.6rem; margin: 0; font-family: var(--font-display); letter-spacing: 0.14em; }
.cs-brand__mark { color: var(--color-cyan); }
.cs-brand__name { font-size: 14px; font-weight: 800; color: var(--color-ink); }
.cs-brand__sub { display: none; font-size: 9px; font-weight: 400; color: var(--color-ink3); }
.cs-demo { display: inline-flex; align-items: center; gap: 0.4rem; margin: 0; padding: 0.35rem 0.7rem; border: 1px dashed var(--color-solar); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; color: var(--color-solar); }
.cs-main { flex: 1 1 auto; width: 100%; max-width: 90rem; margin: 0 auto; outline: none; }
.cs-unknown { margin: 2rem auto; max-width: 30rem; padding: 1.5rem; background: var(--color-panel); border: 1px solid var(--color-line); text-align: center; }
.cs-error { position: sticky; bottom: 0; z-index: 70; display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1rem; background: #2a0e16; border-top: 2px solid var(--color-danger); color: var(--color-ink); font-size: 13px; }
.cs-error p { margin: 0; flex: 1 1 auto; }
.cs-toast { position: fixed; left: 50%; bottom: 1.25rem; z-index: 80; transform: translateX(-50%); display: flex; align-items: center; gap: 0.75rem; max-width: 92vw; padding: 0.7rem 1rem; background: var(--color-raised); border: 1px solid var(--color-cyan); font-family: var(--font-mono); font-size: 12px; color: var(--color-ink); }
.cs-toast p { margin: 0; }
@media (min-width: 768px) { .cs-brand__sub { display: inline; } }
</style>

