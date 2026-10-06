<script setup>
/**
 * UniverseNode.vue — one possibility in the Creative Universe (brief s. 14).
 * ---------------------------------------------------------------------------
 * A node is the atom of Prototype 03: an image, a short title, small metadata
 * and a branch indicator. The visual richness is what makes the product feel
 * like discovery rather than a form (brief section 13).
 *
 * THE SIX STATES (brief section 14) map to data attributes, so the CSS owns the
 * treatment and the markup stays readable:
 *   normal        subtle glow
 *   hover         the image scales and metadata appears
 *   selected      strong neon outline + RGB edge
 *   generated     short signal animation
 *   recommended   an "AI" marker
 *   branch root   a distinct corner treatment
 *
 * DRAGGING AND KEYBOARD (brief sections 15, 16, 42, 46)
 *   The node is a real `<button>`, so Enter/Space select it and Tab reaches it.
 *   Dragging is an ENHANCEMENT layered on top - the same outcome is always
 *   reachable by clicking two nodes and pressing COMBINE.
 *
 * Long press opens the same actions as the panel on touch (brief section 16.1).
 */
import { computed, ref } from 'vue'
import SigIcon from '../ui/SigIcon.vue'

const props = defineProps({
  /** The node being rendered. */
  node: { type: Object, required: true },
  /** True when this node is in the multi-select set. */
  selected: { type: Boolean, default: false },
  /** True when it is the actively inspected node. */
  active: { type: Boolean, default: false },
  /** Number of children, shown as the branch indicator. */
  childCount: { type: Number, default: 0 },
  /** True while this node is being dragged. */
  dragging: { type: Boolean, default: false },
  /** True when another node is colliding with this one. */
  colliding: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'dragstart', 'dragend', 'actions'])

/** Long-press timer for touch devices (brief section 16.1). */
const pressTimer = ref(null)

/** Placeholder is decorative art; the title and metadata carry the meaning. */
const artStyle = computed(() => ({ backgroundImage: props.node.gradient }))

/** How many children branch away - "3 branches" on the metadata line. */
const branchLabel = computed(() =>
  props.childCount > 0
    ? `${props.childCount} ${props.childCount === 1 ? 'branch' : 'branches'}`
    : 'no branches',
)

/** Signal codes shown on the node, e.g. "SIG 01" (brief section 14). */
const signalCode = computed(() => {
  const index = (props.node.signals?.length || 0)
  return index > 0 ? `SIG ${String(index).padStart(2, '0')}` : 'ROOT'
})

/**
 * Begin a pointer drag. We do NOT preventDefault, so a plain click still
 * produces a click event and keyboard activation remains untouched.
 * @param {PointerEvent} event
 */
function onPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return
  emit('dragstart', { id: props.node.id, event })

  // Touch long press (450ms) reveals the node's actions.
  if (event.pointerType !== 'mouse') {
    pressTimer.value = setTimeout(() => emit('actions', props.node.id), 450)
  }
}

/** Clear the long-press timer. */
function onPointerUp() {
  clearTimeout(pressTimer.value)
}
</script>

<template>
  <button
    type="button"
    class="unode"
    :class="{
      'unode--selected': props.selected,
      'unode--active': props.active,
      'unode--dragging': props.dragging,
      'unode--collision': props.colliding,
      'animate-cs-rise': props.node.status === 'generated',
    }"
    :data-status="props.node.status"
    :aria-pressed="props.selected"
    :aria-label="`${props.node.title}. ${props.node.description} ${branchLabel}.`"
    @click="emit('select', props.node.id)"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerUp"
  >
    <!-- ======================= Artwork ======================= -->
    <span class="unode__art" :style="artStyle" aria-hidden="true">
      <!-- Recommended marker (section 14): a small AI tag, not just a colour. -->
      <span v-if="props.node.recommended" class="unode__ai" aria-hidden="true">AI</span>
      <!-- Signal synthesis pulse: only while a result has just appeared. -->
      <span
        v-if="props.node.status === 'generated'"
        class="unode__pulse animate-cs-pulse"
        aria-hidden="true"
      />
    </span>

    <!-- ======================= Metadata ======================= -->
    <span class="unode__meta">
      <span class="unode__title">{{ props.node.title }}</span>
      <span class="unode__sub">
        <span class="unode__code">{{ signalCode }}</span>
        <span class="unode__branch">{{ branchLabel }}</span>
      </span>
    </span>

    <!-- Branch indicator: children exist beneath this node. -->
    <span v-if="props.childCount > 0" class="unode__branchdot" aria-hidden="true">
      <SigIcon name="branch" :size="11" />
    </span>

    <!-- Selected state is marked by a word, not only neon (brief section 44). -->
    <span v-if="props.selected" class="unode__sel">SELECTED</span>
  </button>
</template>
<style scoped>
/* ==========================================================================
   Universe node
   --------------------------------------------------------------------------
   Sized by the canvas (store bounds.nodeW / nodeH) so layout maths lives in one
   place. Section 35: neon marks SELECTION, not every node at once.
   ========================================================================== */
.unode {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  background: var(--color-panel);
  border: 1px solid var(--color-line);
  text-align: left;
  cursor: grab;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.unode:hover {
  border-color: #33445a;
  transform: translateY(-2px);
}

/* ---- Artwork ------------------------------------------------------------- */
.unode__art {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* Hover expands the image slightly (brief section 14). */
.unode:hover .unode__art {
  transform: scale(1.06);
}

.unode__ai {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 1px 5px;
  background: rgb(7 8 12 / 0.82);
  border: 1px solid var(--color-solar);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--color-solar);
}

.unode__pulse {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 0 2px var(--color-magenta);
}

/* ---- Metadata ------------------------------------------------------------ */
.unode__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.5rem 0.6rem;
  background: var(--color-terminal);
  border-top: 1px solid var(--color-line);
}

.unode__title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1.25;
  color: var(--color-ink);
  /* Long concept titles must not blow out the card. */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unode__sub {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--color-ink3);
}

.unode__branch {
  white-space: nowrap;
}

/* ---- Branch indicator ---------------------------------------------------- */
.unode__branchdot {
  position: absolute;
  right: -8px;
  bottom: 44px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
  color: var(--color-cyan);
}

/* ---- States -------------------------------------------------------------- */
.unode--selected {
  border-color: var(--color-cyan);
  box-shadow:
    0 0 0 1px var(--color-cyan),
    0 0 22px -6px var(--color-cyan);
}

/* Active node adds the RGB edge (brief section 78). */
.unode--active {
  box-shadow:
    0 0 0 1px var(--color-cyan),
    -2px 0 0 rgb(255 43 214 / 0.5),
    2px 0 0 rgb(0 229 255 / 0.5),
    0 0 26px -6px var(--color-cyan);
}

.unode--dragging {
  cursor: grabbing;
  opacity: 0.85;
  transform: scale(1.04);
}

/* Collision: the target of a drag-to-combine (brief section 16.1). */
.unode--collision {
  border-color: var(--color-magenta);
  box-shadow:
    0 0 0 2px var(--color-magenta),
    0 0 28px -4px var(--color-magenta);
}

/* Stabilised node becomes visually dominant (brief section 39). */
.unode[data-status='stabilised'] {
  border-color: var(--color-green);
  box-shadow:
    0 0 0 1px var(--color-green),
    0 0 26px -6px var(--color-green);
}

/* Selection is confirmed with a word as well as neon (brief section 44). */
.unode__sel {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 1px 5px;
  background: rgb(7 8 12 / 0.82);
  border: 1px solid var(--color-cyan);
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.12em;
  color: var(--color-cyan);
}
</style>