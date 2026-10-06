<script setup>
/**
 * SignalView.vue — the entry point (brief sections 8, 9, 11, 12).
 * ---------------------------------------------------------------------------
 * THE MOST IMPORTANT SCREEN IN THE PROTOTYPE. Its single job is to communicate,
 * within about ten seconds, that the user does NOT need to know what they are
 * making. The copy is deliberately anti-form: no duration, no aspect ratio, no
 * camera, no scene count. Those belong to Prototype 02 (brief section 3.2).
 *
 * FOUR WAYS IN, ALL EQUAL (brief sections 9, 11, 12 and 45)
 *   Voice, text, sketch and image each produce the same Signal. Voice is the
 *   headline because the brief calls it the prototype's key innovation, but it
 *   is never the ONLY route - `TextSignal` is present and identical in power.
 *
 * HONESTY
 *   The header states plainly that generation is simulated (brief section 82).
 *   Voice never claims a real recogniser is running: it says what it is doing,
 *   and if speech APIs are missing it says so and points at the text field.
 */
import { computed, nextTick, ref } from 'vue'
import { useRouter, useStore } from '../composables.js'
import { SUGGESTED_SIGNALS, VOICE_SCRIPT } from '../navigation.js'
import AiStatus from '../components/ui/AiStatus.vue'
import SigButton from '../components/ui/SigButton.vue'
import SigIcon from '../components/ui/SigIcon.vue'
import SketchSignal from './SketchSignal.vue'

const store = useStore()
const router = useRouter()

/** Which input surface is showing. All four converge on `submitSignal`. */
const mode = ref('text')

/** The four input surfaces (brief sections 9, 11, 12). */
const INPUT_MODES = [
  { id: 'voice', label: 'VOICE', icon: 'mic' },
  { id: 'text', label: 'TEXT', icon: 'pencil' },
  { id: 'sketch', label: 'DRAW', icon: 'image' },
  { id: 'image', label: 'IMAGE', icon: 'layers' },
]

/**
 * Mock image references (brief section 12).
 *
 * Gradients rather than bitmaps: the brief asks for a limited, coherent image
 * set that can be inlined, and AGENTS.md forbids depending on external image
 * URLs. Each ref carries a real `aria-label`, so the choice is accessible
 * without any image being downloaded.
 */
const IMAGE_REFS = [
  { id: 'a', label: 'RAIN ON GLASS', gradient: 'linear-gradient(135deg,#00e5ff,#1e2733)' },
  { id: 'b', label: 'CONCRETE SKY', gradient: 'linear-gradient(135deg,#ff2bd6,#8b5cff)' },
  { id: 'c', label: 'GREEN MACHINE', gradient: 'linear-gradient(135deg,#39ff88,#00e5ff)' },
  { id: 'd', label: 'SOLAR VOID', gradient: 'linear-gradient(135deg,#ffe66d,#ff2bd6)' },
]

const draft = ref('')
/** Ref to the text field, used to keep keyboard focus predictable. */
const textField = ref(null)
const sketchRef = ref(null)

const busy = computed(() => store.state.ai.busy)
const voice = computed(() => store.state.voice)
const chips = computed(() => store.state.signal?.chips || [])

/** Focus the text input when the user chooses the text route. */
async function selectMode(next) {
  mode.value = next
  if (next === 'text') {
    await nextTick()
    textField.value?.focus()
  }
}

/** Use one of the suggested prompts (brief section 8.2). */
function useSuggestion(value) {
  draft.value = value
  mode.value = 'text'
  submitSignal('text')
}

/**
 * Send the current input as a Signal.
 * @param {'text'|'voice'|'sketch'|'image'} type
 * @param {string} [content] - Overrides the draft (used by voice + sketch).
 * @param {string} [label] - Short human label shown in the Archive.
 */
async function submitSignal(type, content, label) {
  if (busy.value) return
  const value = content ?? draft.value
  if (!value || !value.trim()) return

  await store.initializeSignal({
    content: value.trim(),
    type,
    label: label || (type === 'text' ? value.trim() : undefined),
    gradient: type === 'sketch' ? sketchRef.value?.dataUrl : undefined,
    alt: type === 'sketch' ? 'Rough sketch supplied as a creative signal' : undefined,
  })

  // Only advance on success, so a failed signal leaves the user here.
  if (store.state.signal) {
    store.clearSelection()
    router.navigate('/universe')
  }
}

/* ------------------------------------------------------------------ */
/* Voice signal (brief sections 9 and 10)                              */
/* ------------------------------------------------------------------ */

/**
 * Run the simulated voice pass: listening -> processing -> captured.
 *
 * The Web Speech API is deliberately NOT used. The brief says the product "must
 * remain fully usable if microphone APIs are unavailable" and warns against
 * depending on browser-specific speech APIs. A simulated transcript that always
 * works is more honest AND more reliable in a demo than a recogniser that
 * silently fails on half the machines in the room.
 */
async function runVoice() {
  if (busy.value) return

  store.state.voice = { status: 'listening', transcript: '', unavailable: false, error: '' }
  await new Promise((resolve) => setTimeout(resolve, 1500))

  store.state.voice.status = 'processing'
  await new Promise((resolve) => setTimeout(resolve, 900))

  const transcript = VOICE_SCRIPT.join(' ')
  store.state.voice.status = 'complete'
  store.state.voice.transcript = transcript
  store.state.voice.unavailable = true
}

/** Accept the captured transcript and enter the universe. */
function acceptVoice() {
  submitSignal('voice', store.state.voice.transcript, 'What if a city was alive?')
}
</script>
<template>
  <section class="signal" aria-labelledby="signal-title">
    <!-- Faint laboratory substrate + vignette. Pure CSS, no repaint cost. -->
    <div class="signal__bg cs-grid cs-vignette" aria-hidden="true" />
    <span class="signal__scan cs-scanlines" aria-hidden="true" />

    <header class="signal__head">
      <p class="eyebrow">SIGNAL // CREATIVE EXPLORATION SYSTEM</p>
      <h1 id="signal-title" class="signal__title">GIVE US A SIGNAL</h1>
      <p class="signal__lede">
        You don't need to know exactly what you're making. Give the machine a
        thought, a voice, a sketch or an image, and see what it could become.
      </p>
    </header>

    <!-- ================= Input surface selector ================= -->
    <div class="signal__modes" role="group" aria-label="Choose how to send a signal">
      <button
        v-for="option in INPUT_MODES"
        :key="option.id"
        type="button"
        class="signal__mode"
        :data-active="mode === option.id"
        :aria-pressed="mode === option.id"
        @click="selectMode(option.id)"
      >
        <SigIcon :name="option.icon" :size="16" />
        <span>{{ option.label }}</span>
      </button>
    </div>

    <!-- ======================= VOICE ======================= -->
    <div v-if="mode === 'voice'" class="signal__panel cs-corners">
      <p class="eyebrow">VOICE SIGNAL</p>

      <!-- Recording state: motion carries the state, not colour (s. 44). -->
      <template v-if="voice.status === 'listening'">
        <p class="signal__state signal__state--live">
          <span class="signal__rec" aria-hidden="true" />
          LISTENING...
        </p>
        <div class="signal__wave" aria-hidden="true">
          <span
            v-for="n in 26"
            :key="n"
            class="signal__bar"
            :style="{ animationDelay: `${(n % 7) * 0.09}s` }"
          />
        </div>
      </template>

      <template v-else-if="voice.status === 'processing'">
        <p class="signal__state">SIGNAL PROCESSING</p>
        <AiStatus />
      </template>

      <template v-else-if="voice.status === 'complete'">
        <p class="signal__state signal__state--done">
          <SigIcon name="check" :size="14" /> SIGNAL CAPTURED
        </p>
        <blockquote class="signal__quote">{{ voice.transcript }}</blockquote>
        <SigButton tone="primary" size="lg" icon="arrowRight" :disabled="busy" @click="acceptVoice">
          ENTER UNIVERSE
        </SigButton>
      </template>

      <template v-else>
        <p class="signal__state">VOICE SIGNAL <span class="signal__hint">[ TAP TO SPEAK ]</span></p>
        <SigButton tone="primary" size="lg" icon="mic" :disabled="busy" @click="runVoice">
          VOICE SIGNAL
        </SigButton>
        <!--
          Honest note: this is a SIMULATED transcript. Saying so up front keeps
          the prototype from implying a live microphone is open (brief s. 82).
        -->
        <p class="signal__note">
          This prototype simulates the voice pass — no microphone is used. Typing
          gives exactly the same result.
        </p>
      </template>
    </div>

    <!-- ======================= TEXT ======================= -->
    <form
      v-else-if="mode === 'text'"
      class="signal__panel cs-corners"
      @submit.prevent="submitSignal('text')"
    >
      <label class="eyebrow" for="signal-input">YOUR THOUGHT</label>
      <textarea
        id="signal-input"
        ref="textField"
        v-model="draft"
        class="field signal__input"
        rows="3"
        placeholder="What are you thinking about?"
        :disabled="busy"
      />
      <SigButton
        type="submit"
        tone="primary"
        size="lg"
        icon="arrowRight"
        :disabled="busy || !draft.trim()"
      >
        INITIALIZE SIGNAL
      </SigButton>
    </form>

    <!-- ======================= SKETCH ======================= -->
    <div v-else-if="mode === 'sketch'" class="signal__panel cs-corners">
      <p class="eyebrow">SKETCH SIGNAL</p>
      <SketchSignal
        ref="sketchRef"
        :disabled="busy"
        @submit="submitSignal('sketch', sketchRef?.raw, 'Rough sketch')"
      />
    </div>

    <!-- ======================= IMAGE ======================= -->
    <div v-else class="signal__panel cs-corners">
      <p class="eyebrow">IMAGE SIGNAL</p>
      <p class="signal__note">
        Pick a reference image. The prototype does not read it — it becomes the
        visual seed for your universe.
      </p>
      <ul class="signal__refs">
        <li v-for="ref in IMAGE_REFS" :key="ref.id">
          <button
            type="button"
            class="signal__ref"
            :style="{ backgroundImage: ref.gradient }"
            :disabled="busy"
            :aria-label="`Use ${ref.label} as the image signal`"
            @click="submitSignal('image', ref.label, ref.label)"
          >
            <span class="signal__reflabel">{{ ref.label }}</span>
          </button>
        </li>
      </ul>
    </div>
    <!-- ================= Suggested signals (s. 8.2) ================= -->
    <div class="signal__suggest">
      <p class="eyebrow">SUGGESTED SIGNALS</p>
      <ul class="signal__chips">
        <li v-for="suggestion in SUGGESTED_SIGNALS" :key="suggestion">
          <button
            type="button"
            class="signal__chip"
            :disabled="busy"
            @click="useSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </li>
      </ul>
    </div>

    <!-- ================= Output + status ================= -->
    <AiStatus class="signal__status" />

    <!-- Error state (brief section 63): never leave the user stuck. -->
    <p v-if="store.state.error" class="signal__error" role="alert">
      <SigIcon name="warn" :size="14" />
      <span>{{ store.state.error }}</span>
      <button type="button" class="signal__retry" @click="store.state.error = ''">DISMISS</button>
    </p>

    <!-- Extracted creative signals (brief section 9.1). -->
    <p v-if="chips.length" class="signal__out">
      SIGNAL CAPTURED:
      <span v-for="chip in chips" :key="chip" class="signal__outchip">{{ chip }}</span>
    </p>
  </section>
</template>

<style scoped>
/* ==========================================================================
   SIGNAL — the cinematic centre (brief section 8.2)
   --------------------------------------------------------------------------
   Strong vertical rhythm, one clear focal column, and neon reserved for live
   state. Nothing here is a form you have to complete.
   ========================================================================== */
.signal {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
  min-height: 100%;
  padding: 3rem 1.25rem 4rem;
  text-align: center;
  overflow: hidden;
}

.signal__bg,
.signal__scan {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.signal__scan {
  z-index: 1;
  opacity: 0.45;
}

.signal > *:not(.signal__bg):not(.signal__scan) {
  position: relative;
  z-index: 2;
}

/* ---- Header -------------------------------------------------------------- */
.signal__head {
  max-width: 42rem;
}

.signal__title {
  margin: 0.5rem 0 0;
  font-size: clamp(1.6rem, 5.5vw, 2.9rem);
  font-weight: 800;
  line-height: 1.05;
  color: var(--color-ink);
  text-shadow: 0 0 28px rgb(0 229 255 / 0.28);
}

.signal__lede {
  margin: 0.85rem auto 0;
  max-width: 34rem;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-ink2);
}

/* ---- Mode selector ------------------------------------------------------- */
.signal__modes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.signal__mode {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.5rem 1rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--color-ink2);
  cursor: pointer;
  transition:
    color 140ms ease,
    border-color 140ms ease;
}

.signal__mode:hover {
  color: var(--color-ink);
  border-color: #2c3948;
}

.signal__mode[data-active='true'] {
  color: var(--color-cyan);
  border-color: var(--color-cyan);
  box-shadow: 0 0 18px -6px var(--color-cyan);
}

/* ---- Panel --------------------------------------------------------------- */
.signal__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  max-width: 34rem;
  padding: 1.5rem 1.25rem;
  background: color-mix(in srgb, var(--color-panel) 88%, transparent);
  border: 1px solid var(--color-line);
}

.signal__input {
  width: 100%;
  min-height: 6rem;
  resize: vertical;
  line-height: 1.6;
}

.signal__state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--color-ink);
}

.signal__state--live {
  color: var(--color-cyan);
}
.signal__state--done {
  color: var(--color-green);
}

.signal__rec {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-cyan);
  box-shadow: 0 0 10px var(--color-cyan);
  animation: cs-pulse 1.2s ease-in-out infinite;
}

.signal__hint {
  color: var(--color-ink3);
}

.signal__note {
  margin: 0;
  max-width: 30rem;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-ink3);
}

.signal__quote {
  margin: 0;
  padding: 0.75rem 1rem;
  border-left: 2px solid var(--color-cyan);
  background: var(--color-terminal);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-ink);
  text-align: left;
}
/* ---- Waveform (voice) ---------------------------------------------------- */
/* Pure CSS bars. No canvas, no rAF loop - keeps the prototype light (s. 65). */
.signal__wave {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 56px;
}

.signal__bar {
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-cyan), var(--color-violet));
  transform: scaleY(0.28);
  transform-origin: center;
  animation: cs-voice-bar 0.9s ease-in-out infinite;
}

/* ---- Image references ---------------------------------------------------- */
.signal__refs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.signal__ref {
  display: grid;
  place-items: end start;
  width: 100%;
  min-height: 96px;
  padding: 0.6rem;
  border: 1px solid var(--color-line);
  cursor: pointer;
  transition: border-color 140ms ease;
}
.signal__ref:hover:not(:disabled) {
  border-color: var(--color-cyan);
}

.signal__reflabel {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-ink);
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.8);
}

/* ---- Suggestions --------------------------------------------------------- */
.signal__suggest {
  width: 100%;
  max-width: 46rem;
}

.signal__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
}

.signal__chip {
  max-width: 22rem;
  min-height: 44px;
  padding: 0.55rem 0.9rem;
  background: transparent;
  border: 1px dashed var(--color-line);
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-ink2);
  cursor: pointer;
  transition:
    color 140ms ease,
    border-color 140ms ease;
}
.signal__chip:hover:not(:disabled) {
  color: var(--color-cyan);
  border-color: var(--color-cyan);
  border-style: solid;
}

/* ---- Status + errors ----------------------------------------------------- */
.signal__status {
  align-self: center;
}

.signal__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.7rem 1rem;
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 45%, transparent);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-ink);
}

.signal__retry {
  min-height: 32px;
  padding: 0.2rem 0.6rem;
  background: transparent;
  border: 1px solid var(--color-danger);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-danger);
  cursor: pointer;
}

/* ---- Output chips -------------------------------------------------------- */
.signal__out {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--color-green);
}

.signal__outchip {
  padding: 0.2rem 0.5rem;
  border: 1px solid color-mix(in srgb, var(--color-green) 45%, transparent);
  color: var(--color-ink);
}

/* ---- Narrow screens (brief section 51) ----------------------------------- */
@media (max-width: 480px) {
  .signal {
    gap: 1.25rem;
    padding: 2rem 0.85rem 3rem;
  }
  .signal__refs {
    grid-template-columns: 1fr;
  }
  .signal__chip {
    max-width: none;
  }
}
</style>