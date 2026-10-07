/**
 * UniverseCanvas.vue — the pan/zoom mind map (brief sections 13, 15, 16).
 * ---------------------------------------------------------------------------
 * THE SIGNATURE SCREEN. It must feel like a visual mind map combined with an
 * interactive world map, so the universe occupies most of the screen and the
 * controls float around it (brief section 49).
 *
 * HOW THE TRANSFORM WORKS
 *   Nodes live in UNIVERSE coordinates. One wrapper carries the pan/zoom
 *   transform, so panning and zooming never re-render a node - a single style
 *   change moves the whole map. That keeps it cheap enough to also run on a
 *   tablet (brief section 65).
 *
 * INPUT, AND WHY EVERY GESTURE HAS A BUTTON EQUIVALENT (brief section 46)
 *   wheel          -> zoom    -> ZOOM IN / ZOOM OUT / RESET buttons
 *   drag on empty  -> pan     -> the universe is keyboard-pannable
 *   drag a node    -> move    -> position is stored, not required
 *   drag A onto B  -> combine -> SELECT A + SELECT B + COMBINE
 *   pinch          -> zoom    -> the +/- buttons
 *
 * The drag-to-combine gesture is deliberately an ACCELERATOR. Selecting two
 * nodes and pressing COMBINE does exactly the same thing, so the prototype is
 * fully usable with a keyboard, a switch device, or a screen reader.
 */
<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useStore } from '../../composables.js'
import UniverseNode from './UniverseNode.vue'
import SigIcon from '../ui/SigIcon.vue'

const store = useStore()

const viewportEl = ref(null)

/* ------------------------------------------------------------------ */
/* Drag state                                                          */
/* ------------------------------------------------------------------ */

/** Node currently being dragged, if any. */
const drag = ref(null)
/** Node id the dragged node is hovering over - drives the collision state. */
const collideId = ref(null)
/** Pan drag (started on empty space), distinct from node drag. */
const panning = ref(null)
/** Two-finger pinch baseline. */
let pinch = null

/** The wrapper transform. One string, applied to one element. */
const transformStyle = computed(() => ({
  transform: `translate3d(${store.state.view.x}px, ${store.state.view.y}px, 0) scale(${store.state.view.zoom})`,
}))

/** Connection lines, drawn centre-to-centre (nodes are centred on their
 *  position via negative margins, so no half-size offset is needed). */
const edges = computed(() =>
  store.connections.value.map((edge) => ({
    id: edge.id,
    x1: edge.from.x,
    y1: edge.from.y,
    x2: edge.to.x,
    y2: edge.to.y,
  })),
)

/** Canvas padding, so edge lines are never clipped at the boundary. */
const PAD = 900

/* ------------------------------------------------------------------ */
/* Pan + node drag                                                     */
/* ------------------------------------------------------------------ */

/** Start a pan when the press lands on empty space rather than a node
 *  or one of the floating controls (the zoom buttons must keep their click —
 *  pointer capture would retarget it away from them). */
function onViewportPointerDown(event) {
  if (event.target.closest('.unode, button, a, input, select, textarea')) return
  panning.value = { x: event.clientX, y: event.clientY }
  viewportEl.value?.setPointerCapture?.(event.pointerId)
}

/** Handle both pan and node drag with a single move handler. */
function onPointerMove(event) {
  if (panning.value) {
    store.panBy(event.clientX - panning.value.x, event.clientY - panning.value.y)
    // Re-base on every move so deltas stay relative, never cumulative.
    panning.value = { x: event.clientX, y: event.clientY }
    return
  }
  if (!drag.value) return

  // Convert the screen delta into universe coordinates (undo the zoom).
  const dx = (event.clientX - drag.value.sx) / store.state.view.zoom
  const dy = (event.clientY - drag.value.sy) / store.state.view.zoom
  store.moveNode(drag.value.id, { x: drag.value.ox + dx, y: drag.value.oy + dy })
  detectCollision()
}

/** Has the dragged node landed on top of another one? */
function detectCollision() {
  const node = store.nodes.value.find((item) => item.id === drag.value?.id)
  if (!node) return

  const halfW = store.bounds.nodeW / 2
  const halfH = store.bounds.nodeH / 2
  collideId.value =
    store.nodes.value.find((candidate) => {
      if (candidate.id === node.id) return false
      return (
        Math.abs(candidate.position.x - node.position.x) < halfW * 1.2 &&
        Math.abs(candidate.position.y - node.position.y) < halfH * 1.2
      )
    })?.id || null
}

/** @param {{id: string, event: PointerEvent}} payload */
function onNodeDragStart({ id, event }) {
  const node = store.nodes.value.find((item) => item.id === id)
  if (!node) return
  store.state.draggingId = id
  drag.value = {
    id,
    sx: event.clientX,
    sy: event.clientY,
    ox: node.position.x,
    oy: node.position.y,
  }
}

/** Finish a drag; commit the collision as a synthesis (brief section 16.1). */
function onNodeDragEnd() {
  // Always end a pending pan here too: pointerup lands on the shared handler,
  // and leaving panning set made the map follow the cursor after every click.
  panning.value = null
  const dragged = drag.value
  const target = collideId.value
  drag.value = null
  collideId.value = null
  store.state.draggingId = null

  if (!dragged || !target) return

  // SIGNAL COLLISION -> synthesis, via the same path the COMBINE button uses.
  store.selectOnly(target)
  store.toggleSelect(dragged.id)
  store.openSynthesis(true)
}

/**
 * Click to select. Shift/Ctrl multi-selects, matching the
 * "select A + select B + COMBINE" alternative from brief section 46.
 * @param {string} id
 * @param {MouseEvent} event
 */
function onSelect(id, event) {
  if (event.shiftKey || event.metaKey || event.ctrlKey) {
    store.toggleSelect(id)
    return
  }
  if (store.state.selectedIds.length > 1 && store.state.selectedIds.includes(id)) {
    store.selectOnly(id)
    return
  }
  store.selectOnly(id)
}

/* ------------------------------------------------------------------ */
/* Zoom                                                                */
/* ------------------------------------------------------------------ */

/** @param {WheelEvent} event */
function onWheel(event) {
  event.preventDefault()
  const rect = viewportEl.value?.getBoundingClientRect()
  const origin = rect
    ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
    : undefined
  store.zoomBy(event.deltaY < 0 ? 1.12 : 0.89, origin)
}

/** Two-pointer pinch to zoom (brief section 16.1). */
function onTouchStart(event) {
  if (event.touches.length !== 2) return
  const [a, b] = event.touches
  pinch = {
    dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
    zoom: store.state.view.zoom,
  }
}

function onTouchMove(event) {
  if (!pinch || event.touches.length !== 2) return
  const [a, b] = event.touches
  const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  store.zoomBy(dist / pinch.dist)
  pinch.dist = dist
}

function onTouchEnd() {
  pinch = null
}

onBeforeUnmount(() => {
  drag.value = null
  panning.value = null
  pinch = null
})
</script>

<template>
  <!--
    The viewport. It is a labelled region so screen-reader users know there is
    an explorable map here, and it is the target for wheel/pinch/pan.
  -->
  <div
    ref="viewportEl"
    class="universe"
    role="region"
    aria-label="Creative Universe. Use the actions panel to explore, combine, branch and stabilise possibilities."
    :data-dragging="Boolean(drag)"
    @pointerdown="onViewportPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onNodeDragEnd"
    @pointercancel="onNodeDragEnd"
    @wheel="onWheel"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend.passive="onTouchEnd"
    @touchcancel.passive="onTouchEnd"
  >
    <!-- Substrate: faint grid + vignette, so the map sits in a space. -->
    <div class="universe__bg cs-grid" aria-hidden="true" />
    <div class="universe__vignette cs-vignette" aria-hidden="true" />

    <!-- The transformed layer: connections then nodes, both in the same space. -->
    <div class="universe__world" :style="transformStyle">
      <!--
        Connections are one SVG rather than per-node elements: a single path
        per edge, scaled with the world. Cheap, and it never fights the layout.
      -->
      <svg
        class="universe__edges"
        :style="{ width: `${PAD * 2}px`, height: `${PAD * 2}px`, '--pad': `${PAD}px` }"
        :viewBox="`-${PAD} -${PAD} ${PAD * 2} ${PAD * 2}`"
        aria-hidden="true"
      >
        <path
          v-for="edge in edges"
          :key="edge.id"
          :d="`M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`"
          class="universe__edge animate-cs-dash"
        />
      </svg>

      <!-- The nodes themselves. -->
      <div
        v-for="node in store.nodes.value"
        :key="node.id"
        class="universe__node"
        :style="{
          transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0)`,
          '--node-w': `${store.bounds.nodeW}px`,
          '--node-h': `${store.bounds.nodeH}px`,
        }"
      >
        <UniverseNode
          :node="node"
          :selected="store.state.selectedIds.includes(node.id)"
          :active="node.id === store.state.activeId"
          :dragging="node.id === store.state.draggingId"
          :colliding="node.id === collideId"
          :child-count="node.children.length"
          @select="onSelect"
          @dragstart="onNodeDragStart"
          @dragend="onNodeDragEnd"
        />
      </div>
    </div>

    <!-- ===================== Collision notice (s. 16.1) ===================== -->
    <p v-if="collideId" class="universe__collision" role="status">
      <SigIcon name="merge" :size="14" />
      SIGNAL COLLISION DETECTED — RELEASE TO SYNTHESIZE
    </p>

    <!-- ===================== Zoom controls (s. 15) ===================== -->
    <!-- Buttons mirror every gesture, so zoom is never gesture-only (s. 46). -->
    <div class="universe__zoom" role="group" aria-label="Universe zoom controls">
      <button
        type="button"
        class="universe__zoombtn"
        aria-label="Zoom in"
        title="Zoom in"
        @click="store.zoomBy(1.2)"
      >
        <SigIcon name="plus" :size="16" />
      </button>
      <span class="universe__zoomval tnum" aria-live="off">
        {{ Math.round(store.state.view.zoom * 100) }}%
      </span>
      <button
        type="button"
        class="universe__zoombtn"
        aria-label="Zoom out"
        title="Zoom out"
        @click="store.zoomBy(0.83)"
      >
        <SigIcon name="minus" :size="16" />
      </button>
      <button
        type="button"
        class="universe__zoombtn"
        aria-label="Reset the view"
        title="Reset view"
        @click="store.resetView()"
      >
        <SigIcon name="reset" :size="16" />
      </button>
    </div>

    <!-- ===================== Keyboard panning (s. 42) ===================== -->
    <p class="universe__tip">
      Drag to move the map · wheel to zoom · drag one node onto another to combine
    </p>
  </div>
</template>

<style scoped>
/* ==========================================================================
   Creative Universe
   --------------------------------------------------------------------------
   The world layer uses transform-only animation, so panning and zooming stay on
   the compositor and never trigger layout (brief section 65).
   ========================================================================== */
.universe {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 20rem;
  overflow: hidden;
  background: var(--color-space);
  cursor: grab;
  touch-action: none;
}

.universe[data-dragging='true'] {
  cursor: grabbing;
}

.universe__bg,
.universe__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* The single transformed layer. */
.universe__world {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform-origin: 0 0;
  /* No transition while dragging: the node must track the pointer exactly. */
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.universe[data-dragging='true'] .universe__world {
  transition: none;
}

/* ---- Connections --------------------------------------------------------- */
/*
  The SVG is PAD-sized on every side and positioned at -PAD, so universe
  coordinates from -900 to +900 land inside its viewBox. Edges therefore never
  need to be recalculated when the map pans or zooms - the whole SVG is part of
  the transformed world layer.
*/
.universe__edges {
  position: absolute;
  left: calc(-1 * var(--pad));
  top: calc(-1 * var(--pad));
  overflow: visible;
  pointer-events: none;
}

.universe__edge {
  fill: none;
  stroke: rgb(0 229 255 / 0.35);
  stroke-width: 1.5;
  stroke-dasharray: 6 4;
}

/* ---- Nodes --------------------------------------------------------------- */
/*
  A node is CENTRED on its universe coordinate, which is what makes the tree
  read as a mind map rather than a top-left-anchored scatter. The half-size
  offsets are CSS variables supplied inline from the store's single source of
  truth (bounds.nodeW / nodeH) so the layout maths is never duplicated.
*/
.universe__node {
  position: absolute;
  top: 0;
  left: 0;
  margin-left: calc(-1 * var(--node-w) / 2);
  margin-top: calc(-1 * var(--node-h) / 2);
}

/* ---- Collision notice ---------------------------------------------------- */
.universe__collision {
  position: absolute;
  top: 1rem;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.6rem 1rem;
  transform: translateX(-50%);
  background: color-mix(in srgb, var(--color-magenta) 18%, var(--color-panel));
  border: 1px solid var(--color-magenta);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--color-ink);
  pointer-events: none;
}

/* ---- Zoom controls ------------------------------------------------------- */
/* Floating around the content rather than dominating it (brief section 49). */
.universe__zoom {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  background: color-mix(in srgb, var(--color-panel) 90%, transparent);
  border: 1px solid var(--color-line);
}

.universe__zoombtn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-ink2);
  cursor: pointer;
  transition:
    color 140ms ease,
    border-color 140ms ease;
}
.universe__zoombtn:hover {
  color: var(--color-cyan);
  border-color: var(--color-cyan);
}

.universe__zoomval {
  min-width: 3.2rem;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-ink3);
}

/* ---- Hint ---------------------------------------------------------------- */
.universe__tip {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  margin: 0;
  max-width: 18rem;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.5;
  letter-spacing: 0.06em;
  color: var(--color-ink3);
  pointer-events: none;
}

@media (max-width: 767px) {
  .universe__tip {
    display: none;
  }
}
</style>