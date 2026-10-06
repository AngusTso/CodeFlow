<script setup>
/**
 * SynthesisModal.vue — THE STRONGEST VISUAL MOMENT (brief sections 18, 19, 20).
 * ---------------------------------------------------------------------------
 * "This should be one of the strongest visual moments in the prototype."
 *
 * It is built on <SigConsole>, so it inherits the shared console chrome (corner
 * brackets, scanlines, focus trap, Escape). This component supplies only what is
 * unique to synthesis:
 *
 *   1. SOURCE SIGNALS LOCK  - the sources list with a lock marker
 *   2. SYNTHESIS MODE        - seven modes, a single choice (section 20)
 *   3. THE REVEAL            - the staged pulse, then the new possibility
 *
 * HONESTY (brief section 82)
 * The processing stages are named steps the simulation genuinely walks through,
 * not a fake percentage. The modal never claims a real model ran.
 *
 * THE RESULT IS ADDED, NOT REPLACED (brief section 4.3)
 * Executing a synthesis appends a node to the universe. Nothing is overwritten,
 * so the previous line of exploration stays intact and recoverable.
 */
import { computed } from 'vue'
import { useStore } from '../../composables.js'
import { SYNTHESIS_MODES } from '../../signalAi.js'
import SigConsole from '../ui/SigConsole.vue'
import SigButton from '../ui/SigButton.vue'
import SigIcon from '../ui/SigIcon.vue'
import AiStatus from '../ui/AiStatus.vue'

const store = useStore()

const open = computed(() => store.state.synthesis.open)
const record = computed(() => store.state.synthesis.record)
const phase = computed(() => store.state.synthesis.phase)
const busy = computed(() => store.state.ai.busy)
const mode = computed(() => store.state.synthesis.mode)

/** The console title carries the number of combined sources (brief section 18). */
const title = computed(() => {
  const count = record.value?.sourceNodeIds.length || 0
  return `SIGNAL SYNTHESIS // ${String(count).padStart(2, '0')}`
})

/**
 * The revealed node, so the result can show its own artwork.
 *
 * The synthesis RECORD only stores the title and the rationale; the live node
 * lives in the universe (section 4.3). Reading it back from there keeps one
 * source of truth rather than duplicating the node into the record.
 */
const resultNode = computed(() => {
  const nodeId = record.value?.result?.nodeId
  return store.nodes.value.find((node) => node.id === nodeId) || null
})
</script>

<template>
  <SigConsole
    :open="open"
    :title="title"
    subtitle="Two or more signals meeting in one frame."
    :busy="busy && phase === 'processing'"
    wide
    @close="store.closeSynthesis()"
  >
    <!-- ======================= 1. SOURCE SIGNALS ======================= -->
    <ol class="syn__sources">
      <li v-for="(source, index) in record?.sourceTitles || []" :key="source + index">
        <span class="syn__slabel">SOURCE {{ String.fromCharCode(65 + index) }}</span>
        <span class="syn__stitle">{{ source }}</span>
        <!-- "Locked" is a word plus an icon, not only a colour (s. 44). -->
        <span v-if="phase !== 'idle'" class="syn__lock" aria-hidden="true">LOCKED</span>
      </li>
    </ol>

    <div class="syn__plus" aria-hidden="true">
      <span>+</span>
      <span v-if="(record?.sourceTitles.length || 0) > 2">+ more</span>
    </div>

    <!-- ======================= 2. SYNTHESIS MODE ======================= -->
    <fieldset class="syn__modes" :disabled="phase !== 'idle' || busy">
      <legend class="eyebrow">SYNTHESIS MODE</legend>
      <!--
        A radiogroup is the honest control here: exactly one mode applies to a
        synthesis, so radio semantics beat a row of independent buttons.
      -->
      <div class="syn__modegrid" role="radiogroup" aria-label="Synthesis mode">
        <label
          v-for="option in SYNTHESIS_MODES"
          :key="option.id"
          class="syn__mode"
          :data-active="mode === option.id"
        >
          <input
            type="radio"
            name="synthesis-mode"
            :value="option.id"
            :checked="mode === option.id"
            class="sr-only"
            @change="store.setSynthesisMode(option.id)"
          />
          <span class="syn__modelabel">{{ option.label }}</span>
          <span class="syn__modehint">{{ option.hint }}</span>
        </label>
      </div>
    </fieldset>

    <!-- ======================= 3. PROCESSING ======================= -->
    <div v-if="phase === 'processing'" class="syn__processing">
      <p class="syn__pulse animate-cs-pulse" aria-hidden="true">◉</p>
      <AiStatus />
    </div>

    <!-- ======================= 4. THE REVEAL (s. 19) ======================= -->
    <div v-else-if="phase === 'revealed' && record?.result" class="syn__reveal">
      <p class="syn__detected">
        <SigIcon name="spark" :size="14" />
        NEW POSSIBILITY DETECTED
      </p>

      <!-- Image reveal: the generated possibility, revealed gradually (s. 39). -->
      <div class="syn__art animate-cs-reveal">
        <span class="syn__artfill" :style="{ backgroundImage: resultNode?.gradient }" aria-hidden="true" />
        <h3 class="syn__resulttitle">{{ record.result.title }}</h3>
      </div>

      <p class="syn__reason">{{ record.result.reason }}</p>
    </div>

    <template #footer>
      <!-- The result is already in the universe; closing just returns to it. -->
      <SigButton
        v-if="phase === 'revealed'"
        tone="primary"
        icon="arrowRight"
        @click="store.closeSynthesis()"
      >
        CONTINUE EXPLORING
      </SigButton>

      <template v-else>
        <SigButton tone="ghost" @click="store.closeSynthesis()">CANCEL</SigButton>
        <SigButton
          tone="primary"
          icon="merge"
          :disabled="busy || phase !== 'idle'"
          :title="phase !== 'idle' ? 'Synthesis already running' : ''"
          @click="store.executeSynthesis()"
        >
          EXECUTE SYNTHESIS
        </SigButton>
      </template>
    </template>
  </SigConsole>
</template>

<style scoped>
/* ==========================================================================
   Synthesis console
   --------------------------------------------------------------------------
   Section 78 permits the RGB edge here specifically, so this is one of the few
   places in the app that uses it - it marks a genuine state change.
   ========================================================================== */
.syn__sources {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.syn__sources li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
}

.syn__slabel {
  min-width: 5.5rem;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--color-ink3);
}

.syn__stitle {
  flex: 1 1 auto;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-ink);
}

.syn__lock {
  padding: 1px 6px;
  border: 1px solid var(--color-cyan);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--color-cyan);
}

.syn__plus {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--color-magenta);
}

/* ---- Modes --------------------------------------------------------------- */
.syn__modes {
  margin: 0.75rem 0 0;
  padding: 0;
  border: none;
}

.syn__modes legend {
  margin-bottom: 0.5rem;
  padding: 0;
}

.syn__modegrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.4rem;
}

.syn__mode {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.55rem 0.6rem;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
  cursor: pointer;
  transition: border-color 140ms ease;
}

/* The focus ring must be visible even though the input is visually hidden. */
.syn__mode:has(:focus-visible) {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}

.syn__mode:hover {
  border-color: #2c3948;
}

.syn__mode[data-active='true'] {
  border-color: var(--color-magenta);
  box-shadow: 0 0 16px -6px var(--color-magenta);
}

.syn__modelabel {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--color-ink);
}

.syn__mode[data-active='true'] .syn__modelabel {
  color: var(--color-magenta);
}

.syn__modehint {
  font-size: 10px;
  line-height: 1.4;
  color: var(--color-ink3);
}

/* ---- Processing ---------------------------------------------------------- */
.syn__processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
}

.syn__pulse {
  margin: 0;
  font-size: 2rem;
  color: var(--color-magenta);
}

/* ---- The reveal ---------------------------------------------------------- */
.syn__reveal {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.syn__detected {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--color-green);
}

.syn__art {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 12rem;
  padding: 1.5rem;
  overflow: hidden;
  border: 1px solid var(--color-line);
}

.syn__artfill {
  position: absolute;
  inset: 0;
}

.syn__resulttitle {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(1rem, 3.5vw, 1.5rem);
  text-align: center;
  color: var(--color-ink);
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.85);
}

.syn__reason {
  margin: 0;
  padding: 0.6rem 0.7rem;
  background: var(--color-terminal);
  border-left: 2px solid var(--color-cyan);
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-ink2);
}
</style>