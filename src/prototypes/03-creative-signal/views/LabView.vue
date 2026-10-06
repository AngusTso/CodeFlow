<script setup>
/**
 * LabView.vue — the controlled experimentation area (brief section 27).
 * ---------------------------------------------------------------------------
 * The brief is precise about what the Lab is and is not:
 *
 *   "What happens if I push this?"
 *   NOT "Let me manually edit every production parameter."
 *
 * That is why there are seven single-select direction controls and nothing
 * else. No sliders, no numeric fields, no technical values - just seven ways to
 * push an idea. Prototype 02 owns parameter editing; if this screen tried to
 * duplicate it, the three prototypes would stop being distinguishable
 * (brief section 70).
 *
 * Each change is applied immediately and is described in words on the node, so
 * the effect of pushing is legible even when the visual shift is subtle.
 */
import { computed, watch } from 'vue'
import { useRouter, useStore } from '../composables.js'
import { LAB_CONTROLS } from '../navigation.js'
import SigButton from '../components/ui/SigButton.vue'
import SigIcon from '../components/ui/SigIcon.vue'

const store = useStore()
const router = useRouter()

const active = computed(() => store.activeNode.value)
const lab = computed(() => store.state.lab)

/** Keep the controls in step with whichever node is inspected. */
watch(active, (node) => store.loadLabFor(node), { immediate: true })

/**
 * Apply a Lab direction.
 * @param {string} id
 * @param {string} value
 */
function push(id, value) {
  store.setLabValue(id, value)
}

/** Count how many directions have been pushed - feedback without a percentage. */
const pushedCount = computed(() => Object.values(lab.value).filter(Boolean).length)
</script>

<template>
  <section class="lab" aria-labelledby="lab-title">
    <header class="lab__head">
      <p class="eyebrow">LAB // CONTROLLED EXPERIMENTATION</p>
      <h1 id="lab-title" class="lab__title">WHAT HAPPENS IF I PUSH THIS?</h1>
    </header>

    <!-- ===================== No selection (s. 62) ===================== -->
    <div v-if="!active" class="lab__empty cs-corners">
      <p class="lab__emptytitle">NO POSSIBILITY SELECTED</p>
      <p class="lab__emptybody">
        Select a possibility in the universe, then push it here.
      </p>
      <SigButton tone="primary" icon="arrowLeft" @click="router.navigate('/universe')">
        BACK TO UNIVERSE
      </SigButton>
    </div>

    <div v-if="active" class="lab__body">
      <!-- ===================== The subject ===================== -->
      <div class="lab__subject cs-corners">
        <span class="lab__art" :style="{ backgroundImage: active.gradient }" aria-hidden="true" />
        <div class="lab__subjecttext">
          <h2 class="lab__subjecttitle">{{ active.title }}</h2>
          <p class="lab__subjectdesc">{{ active.description }}</p>
          <p class="lab__pushed">
            <span class="tnum">{{ pushedCount }}</span> of
            <span class="tnum">{{ LAB_CONTROLS.length }}</span> directions pushed
          </p>
        </div>
      </div>

      <!-- ===================== The controls ===================== -->
      <!--
        Each control is a fieldset of radio buttons: exactly one direction
        applies per control, so radio semantics are the honest choice and give
        keyboard arrow-key navigation for free (brief section 42).
      -->
      <div class="lab__controls">
        <fieldset v-for="control in LAB_CONTROLS" :key="control.id" class="lab__control">
          <legend class="eyebrow">{{ control.label }}</legend>
          <div class="lab__options">
            <label
              v-for="option in control.options"
              :key="option"
              class="lab__option"
              :data-active="lab[control.id] === option"
            >
              <input
                type="radio"
                :name="control.id"
                :value="option"
                :checked="lab[control.id] === option"
                class="sr-only"
                @change="push(control.id, option)"
              />
              <span>{{ option }}</span>
            </label>
          </div>
        </fieldset>
      </div>

      <div class="lab__actions">
        <SigButton tone="secondary" icon="reset" @click="store.loadLabFor(active)">
          RESET DIRECTIONS
        </SigButton>
        <SigButton tone="primary" icon="arrowRight" @click="router.navigate('/universe')">
          RETURN TO UNIVERSE
        </SigButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lab {
  max-width: 62rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}

.lab__head {
  margin-bottom: 1.5rem;
}

.lab__title {
  margin: 0.4rem 0 0;
  font-size: clamp(1.2rem, 3.5vw, 1.8rem);
  color: var(--color-ink);
}

/* ---- Subject ------------------------------------------------------------- */
.lab__subject {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
}

.lab__art {
  flex: 0 0 auto;
  width: 5rem;
  height: 5rem;
  border: 1px solid var(--color-line);
}

.lab__subjecttitle {
  margin: 0;
  font-size: 15px;
  line-height: 1.3;
  color: var(--color-ink);
}

.lab__subjectdesc {
  margin: 0.35rem 0 0.5rem;
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-ink2);
}

.lab__pushed {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-cyan);
}

/* ---- Controls ------------------------------------------------------------ */
.lab__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}

.lab__control {
  margin: 0;
  padding: 0.85rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
}

.lab__control legend {
  padding: 0 0.35rem;
}

.lab__options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.lab__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.45rem 0.8rem;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--color-ink2);
  cursor: pointer;
  transition:
    color 140ms ease,
    border-color 140ms ease;
}

/* Focus ring stays visible even though the input is visually hidden. */
.lab__option:has(:focus-visible) {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}

.lab__option:hover {
  color: var(--color-ink);
  border-color: #2c3948;
}

.lab__option[data-active='true'] {
  color: var(--color-cyan);
  border-color: var(--color-cyan);
  box-shadow: 0 0 14px -6px var(--color-cyan);
  font-weight: 700;
}

/* ---- Actions ------------------------------------------------------------- */
.lab__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

/* ---- Empty --------------------------------------------------------------- */
.lab__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
}

.lab__emptytitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-ink);
}

.lab__emptybody {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-ink2);
}

@media (max-width: 480px) {
  .lab {
    padding: 1.25rem 0.85rem 3rem;
  }
  .lab__subject {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>