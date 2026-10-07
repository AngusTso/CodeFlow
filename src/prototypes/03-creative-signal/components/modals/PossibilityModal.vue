<script setup>
/**
 * PossibilityModal.vue — alternatives + the AI recommendation (brief s. 23, 25).
 * ---------------------------------------------------------------------------
 * GENERATE 3 ALTERNATIVES produces three nearby but distinct concepts. One may
 * carry a recommendation, which the brief is emphatic about:
 *
 *   "The recommendation should never automatically overwrite the user's
 *    creative direction."
 *
 * So nothing is applied until the user explicitly picks one. Choosing an
 * alternative ADDS it to the universe beside its parent; the original node is
 * untouched and still there afterwards.
 */
import { computed } from 'vue'
import { useStore } from '../../composables.js'
import SigConsole from '../ui/SigConsole.vue'
import SigButton from '../ui/SigButton.vue'
import SigIcon from '../ui/SigIcon.vue'

const store = useStore()

const open = computed(() => store.state.alternatives.open)
const nodes = computed(() => store.state.alternatives.nodes)
const reason = computed(() => store.state.alternatives.reason)
const title = computed(() => `NEW POSSIBILITY // ${String(nodes.value.length).padStart(2, '0')}`)

/** The node the alternatives were generated from. */
const parentTitle = computed(() => {
  const parentId = nodes.value[0]?.parentId
  return store.nodes.value.find((node) => node.id === parentId)?.title || 'THIS POSSIBILITY'
})
</script>

<template>
  <SigConsole
    :open="open"
    :title="title"
    :subtitle="`Alternatives to ${parentTitle}`"
    wide
    @close="store.closeAlternatives()"
  >
    <!-- The recommendation states WHY, and offers a choice (s. 23). -->
    <p v-if="reason" class="pos__reason">
      <span class="pos__whylabel">RECOMMENDED</span>
      {{ reason }}
    </p>

    <ul class="pos__list">
      <li v-for="(node, index) in nodes" :key="node.id">
        <div class="pos__card" :data-recommended="node.recommended">
          <span
            class="pos__art"
            :style="{ backgroundImage: node.imageUrl ? `url('${node.imageUrl}')` : node.gradient, backgroundSize: 'cover', backgroundPosition: 'center' }"
            aria-hidden="true"
          />

          <div class="pos__body">
            <p class="pos__index">
              {{ String(index + 1).padStart(2, '0') }}
              <!-- Recommendation is a visible word, not just a marker (s. 44). -->
              <span v-if="node.recommended" class="pos__rec">AI</span>
            </p>
            <h3 class="pos__title">{{ node.title }}</h3>
            <p class="pos__desc">{{ node.description }}</p>
          </div>

          <SigButton
            tone="primary"
            size="sm"
            icon="check"
            :title="`Add ${node.title} to the universe`"
            @click="store.acceptAlternative(node.id)"
          >
            EXPLORE
          </SigButton>
        </div>
      </li>
    </ul>

    <template #footer>
      <SigButton tone="ghost" @click="store.closeAlternatives()">KEEP CURRENT</SigButton>
    </template>
  </SigConsole>
</template>

<style scoped>
.pos__reason {
  margin: 0 0 1rem;
  padding: 0.6rem 0.7rem;
  background: color-mix(in srgb, var(--color-solar) 8%, transparent);
  border-left: 2px solid var(--color-solar);
  font-size: 12px;
  line-height: 1.55;
  color: var(--color-ink2);
}

.pos__whylabel {
  display: inline-block;
  margin-right: 0.4rem;
  padding: 1px 5px;
  border: 1px solid var(--color-solar);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--color-solar);
}

.pos__list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pos__card {
  display: grid;
  grid-template-columns: 4rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.7rem;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
}

.pos__card[data-recommended='true'] {
  border-color: var(--color-solar);
  box-shadow: 0 0 20px -8px var(--color-solar);
}

.pos__art {
  width: 4rem;
  height: 4rem;
  border: 1px solid var(--color-line);
}

.pos__index {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--color-ink3);
}

.pos__rec {
  padding: 1px 5px;
  border: 1px solid var(--color-solar);
  color: var(--color-solar);
}

.pos__title {
  margin: 0.2rem 0;
  font-size: 13px;
  line-height: 1.3;
  color: var(--color-ink);
}

.pos__desc {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-ink2);
}

/* Stack the card on narrow screens so the EXPLORE button keeps a full target. */
@media (max-width: 560px) {
  .pos__card {
    grid-template-columns: 3rem minmax(0, 1fr);
  }
  .pos__art {
    width: 3rem;
    height: 3rem;
  }
  .pos__card > :last-child {
    grid-column: 1 / -1;
  }
}
</style>