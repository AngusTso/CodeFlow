<script setup>
/**
 * StabilizeModal.vue — the hand-off point (brief section 28).
 * ---------------------------------------------------------------------------
 * Once a possibility is interesting the user can stabilise it. This is the
 * moment the brief calls "an important transition point", and the terminal
 * wording makes that explicit:
 *
 *     POSSIBILITY STABILIZED
 *     THE CITY THAT REMEMBERS
 *     Signal coherence: HIGH
 *     Visual potential: HIGH
 *     Branch depth: 04
 *     [ KEEP EXPLORING ]   [ TURN INTO VIDEO ]
 *
 * HONESTY (brief section 82)
 * The metrics are DERIVED from the node's real state - how many directions it
 * has been explored in, how deep it sits - not invented. A concept with no
 * branches reports MEDIUM, because that is genuinely true.
 *
 * The two paths are equally weighted on purpose: stabilising is not a
 * commitment. KEEP EXPLORING returns to the universe with nothing lost.
 */
import { computed } from 'vue'
import { useRouter, useStore } from '../../composables.js'
import SigConsole from '../ui/SigConsole.vue'
import SigButton from '../ui/SigButton.vue'
import SigIcon from '../ui/SigIcon.vue'
import AiStatus from '../ui/AiStatus.vue'

const store = useStore()
const router = useRouter()

const concept = computed(() => store.state.concept)
const busy = computed(() => store.state.ai.busy)
const open = computed(() => Boolean(concept.value))

/** The stabilised node, for its artwork. */
const node = computed(() => store.nodes.value.find((item) => item.id === concept.value?.nodeId) || null)

/**
 * Leave stabilisation and go back to exploring.
 * This must not lose the node, so it is cleared rather than removed.
 */
function keepExploring() {
  store.keepExploring()
}

/** Build the storyboard and move to the video stage (brief sections 29, 30). */
async function turnIntoVideo() {
  await store.turnIntoVideo()
  store.keepExploring()
  router.navigate('/export')
}
</script>

<template>
  <SigConsole
    :open="open"
    title="POSSIBILITY STABILIZED"
    subtitle="This concept is ready to become a cinematic sequence."
    :busy="busy"
    @close="keepExploring"
  >
    <div v-if="concept" class="stz">
      <!-- The concept becomes visually dominant (brief section 39). -->
      <div class="stz__art animate-cs-lock" :style="{ backgroundImage: node?.gradient }">
        <h3 class="stz__title">{{ concept.title }}</h3>
      </div>

      <p class="stz__summary">{{ concept.summary }}</p>

      <!-- Metrics: each is a labelled value, not a bare colour swatch. -->
      <dl class="stz__metrics">
        <div>
          <dt>Signal coherence</dt>
          <dd :data-level="concept.metrics.coherence">{{ concept.metrics.coherence }}</dd>
        </div>
        <div>
          <dt>Visual potential</dt>
          <dd :data-level="concept.metrics.potential">{{ concept.metrics.potential }}</dd>
        </div>
        <div>
          <dt>Branch depth</dt>
          <dd class="tnum">{{ concept.metrics.depth }}</dd>
        </div>
      </dl>

      <AiStatus v-if="busy" />
    </div>

    <template #footer>
      <SigButton tone="ghost" :disabled="busy" @click="keepExploring">
        KEEP EXPLORING
      </SigButton>
      <SigButton
        tone="primary"
        icon="film"
        :disabled="busy"
        :title="busy ? 'Building the sequence...' : 'Convert this concept into a storyboard'"
        @click="turnIntoVideo"
      >
        TURN INTO VIDEO
      </SigButton>
    </template>
  </SigConsole>
</template>

<style scoped>
.stz {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.stz__art {
  display: grid;
  place-items: center;
  min-height: 9rem;
  padding: 1.5rem 1rem;
  border: 1px solid var(--color-green);
  box-shadow: 0 0 30px -10px var(--color-green);
}

.stz__title {
  margin: 0;
  font-size: clamp(1rem, 3.5vw, 1.4rem);
  text-align: center;
  color: var(--color-ink);
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.85);
}

.stz__summary {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-ink2);
}

/* ---- Metrics ------------------------------------------------------------- */
.stz__metrics {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
}

.stz__metrics > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 0.6rem;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
}

.stz__metrics dt {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-ink3);
}

.stz__metrics dd {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--color-ink);
}

/* Level is stated as a WORD, with colour only reinforcing it (brief s. 44). */
.stz__metrics dd[data-level='HIGH'] {
  color: var(--color-green);
}
.stz__metrics dd[data-level='MEDIUM'] {
  color: var(--color-solar);
}
</style>