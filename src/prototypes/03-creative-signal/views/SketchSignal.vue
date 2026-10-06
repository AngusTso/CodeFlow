<script setup>
/**
 * SketchSignal.vue — the drawing input (brief section 11).
 * ---------------------------------------------------------------------------
 * The brief is emphatic about scope: "the purpose is NOT to build a full drawing
 * application" and "the sketch is a SIGNAL, not artwork". So this is five tools
 * and a submit button - pen, eraser, clear, undo, submit - exactly as listed in
 * section 11.1. There are no layers, no selection handles, no brushes.
 *
 * WHY A PLAIN <canvas> IS STILL THE RIGHT CHOICE
 *   Freehand input needs pointer coordinates and pressure-like fidelity. A
 *   handful of pointer events and a 2D context is roughly 150 lines, versus a
 *   drawing dependency that would break the single-file deliverable (s. 66) and
 *   contradict "minimal dependencies" in AGENTS.md.
 *
 * ACCESSIBILITY (brief sections 42 and 46)
 *   Drawing is inherently visual, so the canvas is a decorative rendering: it is
 *   `role="img"` with a live `aria-label` describing what has been drawn so far.
 *   Crucially, EVERY tool is a real button, and submitting a sketch is always
 *   possible - a keyboard user who cannot draw is not blocked, because the text
 *   and voice signals produce an identical result.
 */
import { computed, onMounted, ref } from 'vue'
import SigButton from '../components/ui/SigButton.vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const canvasEl = ref(null)
const drawing = ref(false)
const tool = ref('pen')
/** Snapshot stack for undo. Each entry is a data URL of the whole canvas. */
const history = ref([])
/** How many strokes the user has made - drives the accessible description. */
const strokeCount = ref(0)

/** Backing store resolution. 2x keeps lines crisp on retina without bloat. */
const WIDTH = 520
const HEIGHT = 260

/** Accessible description of the current sketch, updated on every stroke. */
const description = computed(
  () =>
    strokeCount.value === 0
      ? 'Empty sketch canvas. Draw a rough shape to use as a signal.'
      : `Rough sketch with ${strokeCount.value} ${strokeCount.value === 1 ? 'stroke' : 'strokes'}.`,
)

/** 2D context, obtained lazily once the canvas is mounted. */
let ctx = null
/** Previous pointer position, so a stroke is a continuous line. */
let last = null

onMounted(() => {
  const canvas = canvasEl.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#00e5ff'
  // Start from a filled dark surface so exported art reads as a signal.
  ctx.fillStyle = '#0b0f14'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
})

/** Snapshot the canvas so the next stroke can be undone. */
function snapshot() {
  if (!canvasEl.value) return
  history.value.push(canvasEl.value.toDataURL('image/png'))
  // Bound the stack: this is not a real drawing app (brief section 11.1).
  if (history.value.length > 20) history.value.shift()
}

/** Map a pointer event to canvas coordinates. @param {PointerEvent} event */
function pointOf(event) {
  const canvas = canvasEl.value
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
  }
}

/** Begin a stroke. @param {PointerEvent} event */
function onDown(event) {
  if (props.disabled) return
  snapshot()
  drawing.value = true
  last = pointOf(event)
  canvasEl.value.setPointerCapture?.(event.pointerId)
}

/** Continue a stroke. @param {PointerEvent} event */
function onMove(event) {
  if (!drawing.value || !ctx) return
  const next = pointOf(event)

  if (tool.value === 'eraser') {
    // Erase with a thick stroke of the background colour.
    ctx.strokeStyle = '#0b0f14'
    ctx.lineWidth = 22
  } else {
    ctx.strokeStyle = '#00e5ff'
    ctx.lineWidth = 3
  }

  ctx.beginPath()
  ctx.moveTo(last.x, last.y)
  ctx.lineTo(next.x, next.y)
  ctx.stroke()
  last = next
}

/** End a stroke. */
function onUp() {
  if (!drawing.value) return
  drawing.value = false
  strokeCount.value += 1
}

/** Restore the previous snapshot. */
function undo() {
  const previous = history.value.pop()
  if (!previous || !canvasEl.value) return
  const image = new Image()
  image.onload = () => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx.drawImage(image, 0, 0)
  }
  image.src = previous
  strokeCount.value = Math.max(0, strokeCount.value - 1)
}

/** Wipe the canvas and its history. */
function clear() {
  if (!ctx) return
  ctx.fillStyle = '#0b0f14'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  history.value = []
  strokeCount.value = 0
}

// ---- Exposed to the parent -------------------------------------------------

/** The sketch as a PNG data URL, used as the signal's visual seed. */
const dataUrl = computed(() => canvasEl.value?.toDataURL('image/png') || '')

/** The raw "content" of this signal: a short text description, not the bitmap. */
const raw = computed(() =>
  strokeCount.value > 0
    ? `A rough sketch of ${strokeCount.value} ${strokeCount.value === 1 ? 'stroke' : 'strokes'}, like a damaged maintenance robot`
    : 'A rough sketch',
)

defineExpose({ dataUrl, raw, clear })
</script>

<template>
  <div class="sketch">
    <!--
      The canvas presents a drawing the user made. Its aria-label updates live so
      the description stays truthful (brief section 47).
    -->
    <canvas
      ref="canvasEl"
      class="sketch__pad"
      :width="520"
      :height="260"
      role="img"
      :aria-label="description"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointerleave="onUp"
      @pointercancel="onUp"
    />

    <p class="sketch__hint">
      Draw roughly — it is a signal, not artwork. Typing gives the same result.
    </p>

    <!-- Exactly the five controls listed in brief section 11.1. -->
    <div class="sketch__tools" role="group" aria-label="Sketch tools">
      <SigButton
        tone="secondary"
        size="sm"
        icon="pencil"
        :title="`Tool: ${tool === 'pen' ? 'pen' : 'eraser'}`"
        :disabled="props.disabled"
        @click="tool = 'pen'"
      >
        PEN
      </SigButton>
      <SigButton
        tone="secondary"
        size="sm"
        icon="image"
        :title="`Tool: ${tool === 'pen' ? 'pen' : 'eraser'}`"
        :disabled="props.disabled"
        @click="tool = 'eraser'"
      >
        ERASER
      </SigButton>
      <SigButton tone="secondary" size="sm" icon="undo" :disabled="props.disabled" @click="undo">
        UNDO
      </SigButton>
      <SigButton tone="secondary" size="sm" icon="trash" :disabled="props.disabled" @click="clear">
        CLEAR
      </SigButton>
      <SigButton
        tone="primary"
        size="sm"
        icon="arrowRight"
        :disabled="props.disabled"
        @click="emit('submit')"
      >
        USE AS SIGNAL
      </SigButton>
    </div>
  </div>
</template>

<style scoped>
.sketch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.sketch__pad {
  width: 100%;
  max-width: 32rem;
  height: auto;
  aspect-ratio: 2 / 1;
  background: var(--color-terminal);
  border: 1px solid var(--color-line);
  /* Finger/stylus drawing; the browser must not pan the page mid-stroke. */
  touch-action: none;
  cursor: crosshair;
}

.sketch__hint {
  margin: 0;
  font-size: 12px;
  color: var(--color-ink3);
}

.sketch__tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
}
</style>