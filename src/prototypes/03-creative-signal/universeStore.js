/**
 * 03-creative-signal/universeStore.js - the Creative Universe state.
 * ---------------------------------------------------------------------------
 * WHY THIS IS THE ONLY PLACE THAT MUTATES THE UNIVERSE
 *   Brief section 58: "One source of truth for the Creative Universe." Views
 *   never write to state directly; they call the commands below. That keeps the
 *   AI, the presentation and the router completely decoupled, and it is why the
 *   universe can be restored, branched and synthesised without any view knowing
 *   how the others work.
 *
 * HOW IT DIFFERS FROM THE OTHER TWO STORES
 *   Prototype 01: a linear five-step wizard.       -> shared/store/creationStore
 *   Prototype 02: a workspace with an undo stack.  -> workspaceStore
 *   Prototype 03: a TREE that grows.               -> this file
 *
 *   There is no step index, no timeline and no full-project undo stack. The brief
 *   says Prototype 3 needs no professional undo system (section 60) - exploration
 *   should simply feel SAFE, which is achieved by keeping every discarded branch
 *   in the Archive plus a single-level undo for destructive node deletion.
 *
 * WHAT IS SHARED
 *   The stage labels come from signalAi.js; the scenes that end up in the
 *   storyboard are produced by the SHARED mock AI (brief section 55).
 */

import { computed, reactive } from 'vue'

import { delay } from '../../shared/utils/async.js'
import { createExportSettings } from '../../shared/domain/models.js'
import { EXPORT_PLATFORMS, RESOLUTIONS, FORMATS } from '../../shared/data/mockData.js'
import {
  createArchiveEntry,
  createBranch,
  createSignal,
  createSynthesis,
} from './signalModels.js'
import {
  AI_MESSAGES,
  buildAlternatives,
  buildBranchNode,
  buildBranches,
  buildInitialUniverse,
  buildPreview,
  buildStabilizedConcept,
  buildStoryboard,
  buildSynthesis,
  extractSignalChips,
  simulateExport,
} from './signalAi.js'

/** Wall-clock per stage. Short enough to demo, long enough to read (s. 19). */
const STAGE_MS = 420

/** Universe zoom bounds - keeps the map usable without trapping the user. */
const MIN_ZOOM = 0.4
const MAX_ZOOM = 2

/** Node footprint, used to keep newly added nodes from overlapping. */
const NODE_W = 176
const NODE_H = 150

/**
 * Walk a list of stage labels, updating `ai` as it goes.
 *
 * This is how the app reports progress WITHOUT faking a percentage (brief
 * section 61): the user is told which named stage the simulated pipeline is on.
 *
 * @param {object} state - The reactive state (mutated in place).
 * @param {keyof typeof AI_MESSAGES} task
 */
async function runStages(state, task) {
  const stages = AI_MESSAGES[task] || AI_MESSAGES.universe
  for (let index = 0; index < stages.length; index += 1) {
    state.ai.stages = stages
    state.ai.stageIndex = index
    state.ai.stage = stages[index]
    await delay(STAGE_MS)
  }
  state.ai.busy = false
}

/**
 * Create the Creative Universe store.
 * @returns {object} The store API consumed by every view.
 */
export function createUniverseStore() {
  /* ------------------------------------------------------------------ */
  /* State (brief section 58)                                           */
  /* ------------------------------------------------------------------ */

  const state = reactive({
    /** The current raw signal, or null before the first one is sent. */
    signal: null,

    /** Voice lifecycle (section 10): idle|listening|processing|complete|unavailable */
    voice: { status: 'idle', transcript: '', unavailable: false, error: '' },

    /** The universe: nodes form a tree via parentId. */
    nodes: [],
    /** Node ids currently chosen. One = inspect, two+ = combine (s. 46). */
    selectedIds: [],
    /** Primary inspected node id. */
    activeId: null,
    /** Node id being dragged, for the collision state (section 16.1). */
    draggingId: null,

    /** Pan / zoom state for the Creative Universe canvas. */
    view: { x: 0, y: 0, zoom: 1 },

    /** Synthesis modal state (section 18). */
    synthesis: { open: false, mode: 'unexpected', record: null, phase: 'idle', result: null },

    /** Alternatives / recommendation state (section 23). */
    alternatives: { open: false, nodes: [], reason: '' },

    /** Branch records created so far (section 24). */
    branches: [],

    /** Creative memory (section 26). */
    archive: [],

    /** The stabilised concept (section 28). */
    concept: null,

    /** Storyboard + cinematic preview (sections 30, 31). */
    storyboard: null,
    preview: { playing: false, frameIndex: 0, time: 0, duration: 0 },

    /** Lab adjustments applied to the active node (section 27). */
    lab: {
      mood: '',
      colour: '',
      style: '',
      environment: '',
      presence: '',
      intensity: '',
      cinema: '',
    },

    /** Shared AI feedback (section 61). */
    ai: { busy: false, stages: [], stageIndex: 0, stage: '' },

    /** Which task is currently running, so views can show the right label. */
    generating: null,

    /** Toast + undo for destructive actions (section 60). */
    toast: { visible: false, message: '', action: '', undo: null },

    /** Export panel (section 81). */
    export: { open: false, settings: createExportSettings(), busy: false, result: null },

    /** Error surface (section 63). */
    error: '',
  })

  /* ------------------------------------------------------------------ */
  /* Derived state                                                      */
  /* ------------------------------------------------------------------ */

  const nodes = computed(() => state.nodes)
  const activeNode = computed(() => state.nodes.find((node) => node.id === state.activeId) || null)
  const selectedNodes = computed(() =>
    state.nodes.filter((node) => state.selectedIds.includes(node.id)),
  )
  const hasSignal = computed(() => Boolean(state.signal))
  const isEmpty = computed(() => state.nodes.length === 0)

  /** Edges of the tree, derived from parentId - never stored twice. */
  const connections = computed(() =>
    state.nodes
      .filter((node) => node.parentId)
      .map((node) => {
        const parent = state.nodes.find((candidate) => candidate.id === node.parentId)
        return parent
          ? { id: `${parent.id}->${node.id}`, from: parent.position, to: node.position }
          : null
      })
      .filter(Boolean),
  )

  /** Preview frames come straight from the shared storyboard. */
  const frames = computed(() => (state.storyboard?.scenes ? state.storyboard.scenes : []))

  /** Root nodes have no parent - used by the tree helpers below. */
  const roots = computed(() => state.nodes.filter((node) => !node.parentId))

  /* ------------------------------------------------------------------ */
  /* Tree helpers                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * Collect a node and every descendant beneath it.
   *
   * This is what makes deletion correct: removing a node must remove its whole
   * subtree, not orphan its children (brief section 60).
   *
   * @param {string} id
   * @returns {import('./signalModels.js').CreativeNode[]}
   */
  function subtreeOf(id) {
    const collected = []
    const queue = [id]
    while (queue.length) {
      const currentId = queue.shift()
      const current = state.nodes.find((node) => node.id === currentId)
      if (!current) continue
      collected.push(current)
      current.children.forEach((childId) => queue.push(childId))
    }
    return collected
  }

  /**
   * Attach a child node to a parent, keeping `children` consistent.
   * @param {import('./signalModels.js').CreativeNode} child
   * @param {import('./signalModels.js').CreativeNode|null} parent
   */
  function attach(child, parent) {
    if (parent && !parent.children.includes(child.id)) parent.children.push(child.id)
    child.parentId = parent ? parent.id : null
    child.depth = parent ? parent.depth + 1 : 0
  }

  /**
   * Find an empty slot below `parent` so new nodes never overlap.
   * @param {import('./signalModels.js').CreativeNode|null} parent
   * @returns {{x: number, y: number}}
   */
  function slotUnder(parent) {
    const siblings = state.nodes.filter((node) => node.parentId === (parent ? parent.id : null))
    const index = siblings.length
    const columns = 3
    const column = index % columns
    const row = Math.floor(index / columns)
    // Start below the parent (or the centre when there is no parent).
    const originY = parent ? parent.position.y + NODE_H + 60 : 0
    return {
      x: Math.round((column - (columns - 1) / 2) * (NODE_W + 30)),
      y: Math.round(originY + row * (NODE_H + 30)),
    }
  }

  /* ------------------------------------------------------------------ */
  /* Archive (brief section 26)                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Record something worth remembering.
   * @param {Partial<import('./signalModels.js').ArchiveEntry>} entry
   */
  function remember(entry) {
    state.archive.unshift(
      createArchiveEntry({
        code: `${String(entry.kind || 'signal').toUpperCase()} ${String(state.archive.length + 1).padStart(2, '0')}`,
        stamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...entry,
      }),
    )
  }

  /* ------------------------------------------------------------------ */
  /* Toast + undo (brief section 60)                                     */
  /* ------------------------------------------------------------------ */

  let toastTimer = null

  /**
   * Show a transient message, optionally with an undo affordance.
   * @param {string} message
   * @param {() => void|null} [undo]
   */
  function notify(message, undo = null) {
    state.toast.message = message
    state.toast.undo = undo
    state.toast.action = undo ? 'UNDO' : ''
    state.toast.visible = true
    clearTimeout(toastTimer)
    // Generous dwell: the user must have time to actually reach UNDO.
    toastTimer = setTimeout(() => {
      state.toast.visible = false
      state.toast.undo = null
      state.toast.action = ''
    }, undo ? 7000 : 3200)
  }

  /** Run the pending undo action, if there is one. */
  function runUndo() {
    const action = state.toast.undo
    state.toast.visible = false
    state.toast.undo = null
    state.toast.action = ''
    clearTimeout(toastTimer)
    if (typeof action === 'function') action()
  }

  /* ------------------------------------------------------------------ */
  /* Signal -> Universe (brief sections 5 and 8)                           */
  /* ------------------------------------------------------------------ */

  /**
   * Send a signal and build the opening Creative Universe.
   *
   * @param {{content: string, type?: string, label?: string, gradient?: string, imageUrl?: string, alt?: string}} input
   * @returns {Promise<void>}
   */
  async function initializeSignal(input) {
    if (state.ai.busy) return

    const content = String(input.content || '').trim()
    // The error state is explicit rather than silent (brief section 63).
    if (!content) {
      state.error = 'SIGNAL PROCESSING FAILED — no content to interpret.'
      return
    }

    state.error = ''
    state.ai.busy = true
    state.generating = 'universe'

    const signal = createSignal({
      type: input.type || 'text',
      content,
      label: input.label || content,
      source: input.type || 'text',
      gradient: input.gradient || 'linear-gradient(135deg, #00e5ff 0%, #8b5cff 100%)',
      imageUrl: input.imageUrl || null,
      alt: input.alt || '',
    })

    await runStages(state, 'universe')

    try {
      // Chip extraction is shared with the voice path so both agree.
      signal.chips = extractSignalChips(content)

      const built = buildInitialUniverse(signal)

      // The first node is the root; satellites attach to it.
      const [root, ...satellites] = built
      state.nodes = [root, ...satellites]
      satellites.forEach((node) => attach(node, root))

      state.signal = signal
      state.selectedIds = []
      state.activeId = root.id
      state.branches = []
      state.concept = null
      state.storyboard = null
      state.preview = { playing: false, frameIndex: 0, time: 0, duration: 0 }
      state.view = { x: 0, y: 0, zoom: 1 }

      remember({
        kind: 'signal',
        title: signal.label,
        gradient: signal.gradient,
        imageUrl: signal.imageUrl,
        alt: signal.alt || `Signal: ${signal.label}`,
        nodeId: root.id,
      })
    } catch (error) {
      state.error = 'SIGNAL PROCESSING FAILED — the creative signal could not be interpreted.'
    } finally {
      state.ai.busy = false
      state.generating = null
    }
  }

  /** Clear everything and return to an empty universe (brief section 62). */
  function resetUniverse() {
    state.signal = null
    state.nodes = []
    state.selectedIds = []
    state.activeId = null
    state.branches = []
    state.concept = null
    state.storyboard = null
    state.preview = { playing: false, frameIndex: 0, time: 0, duration: 0 }
    state.alternatives = { open: false, nodes: [], reason: '' }
    state.synthesis = { open: false, mode: 'unexpected', record: null, phase: 'idle', result: null }
    state.view = { x: 0, y: 0, zoom: 1 }
    state.error = ''
  }

  /* ------------------------------------------------------------------ */
  /* Selection (brief sections 15, 46)                                    */
  /* ------------------------------------------------------------------ */

  /**
   * Toggle a node in the multi-select set.
   *
   * Selecting a second node is the KEYBOARD / BUTTON equivalent of the
   * drag-to-combine gesture. The brief is explicit that a gesture must never be
   * the only way to do something (section 46), so this is a first-class path.
   *
   * @param {string} id
   */
  function toggleSelect(id) {
    if (state.selectedIds.includes(id)) {
      state.selectedIds = state.selectedIds.filter((nodeId) => nodeId !== id)
    } else {
      // Cap the set so the modal stays readable.
      state.selectedIds = [...state.selectedIds, id].slice(-3)
    }
    if (state.activeId !== id) state.activeId = id
  }

  /** Inspect exactly one node (clears the multi-select). */
  function selectOnly(id) {
    state.selectedIds = [id]
    state.activeId = id
  }

  /** Empty the selection. */
  function clearSelection() {
    state.selectedIds = []
  }

  /* ------------------------------------------------------------------ */
  /* Synthesis (brief sections 17, 18, 19, 20)                            */
  /* ------------------------------------------------------------------ */

  /**
   * Open the terminal synthesis modal for the current selection.
   *
   * Requires at least TWO sources - combination is the product's central
   * mechanic (section 4.2), so combining a single node is not an error state
   * but a disabled action, explained rather than silently ignored.
   *
   * @param {boolean} [auto] Open in the executing state (used by drag-to-combine).
   */
  function openSynthesis(auto = false) {
    if (selectedNodes.value.length < 2) return
    state.synthesis.record = createSynthesis({
      sourceNodeIds: selectedNodes.value.map((node) => node.id),
      sourceTitles: selectedNodes.value.map((node) => node.title),
      mode: state.synthesis.mode,
    })
    state.synthesis.open = true
    state.synthesis.result = null
    state.synthesis.phase = auto ? 'processing' : 'idle'
  }

  /** Close the synthesis modal and reset it. */
  function closeSynthesis() {
    state.synthesis.open = false
    state.synthesis.result = null
    state.synthesis.phase = 'idle'
  }

  /** @param {string} mode - A SYNTHESIS_MODES id. */
  function setSynthesisMode(mode) {
    state.synthesis.mode = mode
    if (state.synthesis.record) state.synthesis.record.mode = mode
  }

  /**
   * Run the staged synthesis animation and add the result to the universe.
   *
   * The sequence follows the brief's section 19: sources lock, signals connect,
   * the terminal prints, the image reveals, the possibility is detected.
   *
   * @returns {Promise<void>}
   */
  async function executeSynthesis() {
    const record = state.synthesis.record
    if (!record || state.ai.busy) return

    state.ai.busy = true
    state.generating = 'synthesis'
    state.synthesis.phase = 'processing'

    await runStages(state, 'synthesis')

    const sources = record.sourceNodeIds
      .map((id) => state.nodes.find((node) => node.id === id))
      .filter(Boolean)

    const { node, reason } = buildSynthesis(sources, record.mode)

    // Place the result beside its sources, never on top of them.
    const anchor = sources[0]
    node.status = 'generated'

    // The result hangs off its first source - that is the edge the universe
    // draws. When only one source exists it is already attached, so this is
    // idempotent either way.
    attach(node, sources[0] || null)
    node.position = {
      x: Math.round((anchor?.position.x || 0) + 380),
      y: Math.round((anchor?.position.y || 0) + 190),
    }

    state.nodes.push(node)
    // The record stores the node ID (not a copy) so the modal can show the live
    // node's artwork without duplicating state (brief section 4.3).
    record.result = { title: node.title, reason, nodeId: node.id }
    state.synthesis.phase = 'revealed'

    remember({
      kind: 'synthesis',
      title: node.title,
      gradient: node.gradient,
      imageUrl: node.imageUrl,
      alt: node.alt,
      nodeId: node.id,
    })

    state.ai.busy = false
    state.generating = null
  }

  /* ------------------------------------------------------------------ */
  /* Alternatives (brief section 25)                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Generate three alternatives for a node and show them in the Possibility
   * modal. The AI recommends one but never applies it (section 23).
   *
   * @param {string} [id]
   */
  async function openAlternatives(id) {
    const node = state.nodes.find((candidate) => candidate.id === (id || state.activeId))
    if (!node || state.ai.busy) return

    state.ai.busy = true
    state.generating = 'branches'
    await runStages(state, 'branches')
    state.ai.busy = false
    state.generating = null

    const { nodes: alternatives, reason } = buildAlternatives(node)
    // Position them relative to their parent when they are revealed.
    alternatives.forEach((alternative) => {
      alternative.position = {
        x: node.position.x + alternative.position.x,
        y: node.position.y + alternative.position.y,
      }
    })

    state.alternatives = { open: true, nodes: alternatives, reason }
  }

  /** Close the possibilities modal. */
  function closeAlternatives() {
    state.alternatives = { open: false, nodes: [], reason: '' }
  }

  /**
   * Commit an alternative into the universe and inspect it.
   * @param {string} id
   */
  function acceptAlternative(id) {
    const alternative = state.alternatives.nodes.find((node) => node.id === id)
    if (!alternative) return
    const parent = state.nodes.find((node) => node.id === alternative.parentId)
    if (parent && !parent.children.includes(alternative.id)) parent.children.push(alternative.id)
    alternative.status = 'generated'
    state.nodes.push(alternative)
    selectOnly(alternative.id)
    state.alternatives = { open: false, nodes: [], reason: '' }
    remember({
      kind: 'branch',
      title: alternative.title,
      gradient: alternative.gradient,
      imageUrl: alternative.imageUrl,
      alt: alternative.alt,
      nodeId: alternative.id,
    })
  }

  /* ------------------------------------------------------------------ */
  /* Branching (brief section 24)                                         */
  /* ------------------------------------------------------------------ */

  /**
   * Create three directional branches under a node.
   *
   * The branch record and the new node are separate concerns: the RECORD is the
   * memory (Archive), the NODE is the live possibility. That separation is why
   * exploring a different branch never destroys the earlier one (section 4.3).
   *
   * @param {string} [id]
   * @returns {Promise<void>}
   */
  async function createBranches(id) {
    const parent = state.nodes.find((node) => node.id === (id || state.activeId))
    if (!parent || state.ai.busy) return

    state.ai.busy = true
    state.generating = 'branches'
    await runStages(state, 'branches')

    const branches = buildBranches(parent)
    branches.forEach((branch, index) => {
      const node = buildBranchNode(parent, branch, index)
      node.position = slotUnder(parent)
      attach(node, parent)
      branch.snapshotIds.push(node.id)
      state.nodes.push(node)
      state.branches.push(createBranch(branch))
      remember({
        kind: 'branch',
        title: node.title,
        gradient: node.gradient,
        imageUrl: node.imageUrl,
        alt: node.alt,
        nodeId: node.id,
      })
    })

    state.ai.busy = false
    state.generating = null
    notify(`BRANCH CREATED — 3 directions from ${parent.title}`)
  }

  /* ------------------------------------------------------------------ */
  /* Node mutation                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Move a node. Used by drag on desktop AND by drag on tablet (section 15).
   * @param {string} id
   * @param {{x: number, y: number}} position
   */
  function moveNode(id, position) {
    const node = state.nodes.find((candidate) => candidate.id === id)
    if (!node) return
    node.position = {
      x: Math.round(position.x),
      y: Math.round(position.y),
    }
  }

  /**
   * Delete a node and everything beneath it, with a single undo (section 60).
   *
   * Exploration should feel safe, so this is never final - the toast holds the
   * removed subtree until it times out.
   *
   * @param {string} id
   */
  function removeNode(id) {
    const node = state.nodes.find((candidate) => candidate.id === id)
    if (!node) return

    const removed = subtreeOf(id).map((candidate) => ({ ...candidate, children: [...candidate.children] }))
    const removedIds = removed.map((candidate) => candidate.id)

    // Detach from the parent so the tree stays consistent.
    if (node.parentId) {
      const parent = state.nodes.find((candidate) => candidate.id === node.parentId)
      if (parent) parent.children = parent.children.filter((childId) => !removedIds.includes(childId))
    }

    state.nodes = state.nodes.filter((candidate) => !removedIds.includes(candidate.id))
    state.selectedIds = state.selectedIds.filter((nodeId) => !removedIds.includes(nodeId))
    if (removedIds.includes(state.activeId)) state.activeId = state.nodes[0]?.id || null
    if (state.concept?.nodeId && removedIds.includes(state.concept.nodeId)) state.concept = null

    notify(`NODE REMOVED — ${node.title}`, () => {
      state.nodes.push(...removed)
      // Re-link the restored children to their restored parent.
      removed.forEach((candidate) => {
        if (!candidate.parentId) return
        const parent = state.nodes.find((item) => item.id === candidate.parentId)
        if (parent && !parent.children.includes(candidate.id)) parent.children.push(candidate.id)
      })
      selectOnly(id)
      notify('RESTORED — node returned to the universe')
    })
  }

  /** Centre the viewport on a node (the "focus" tertiary action). */
  function centerOn(id) {
    const node = state.nodes.find((candidate) => candidate.id === id)
    if (!node) return
    state.view = { x: -node.position.x * state.view.zoom, y: -node.position.y * state.view.zoom, zoom: state.view.zoom }
  }

  /* ------------------------------------------------------------------ */
  /* Pan / zoom (brief section 15)                                       */
  /* ------------------------------------------------------------------ */

  /** @param {number} x @param {number} y */
  function panBy(x, y) {
    state.view = { ...state.view, x: state.view.x + x, y: state.view.y + y }
  }

  /**
   * Zoom around a point, clamped so the map can never be lost or unusable.
   * @param {number} factor
   * @param {{x: number, y: number}} [origin] - Screen point to zoom about.
   */
  function zoomBy(factor, origin) {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, state.view.zoom * factor))
    const applied = next / state.view.zoom
    if (applied === 1) return

    if (origin) {
      // Keep the point under the cursor stationary.
      state.view = {
        zoom: next,
        x: origin.x - (origin.x - state.view.x) * applied,
        y: origin.y - (origin.y - state.view.y) * applied,
      }
    } else {
      state.view = { ...state.view, zoom: next }
    }
  }

  /** Reset pan and zoom to the origin. */
  function resetView() {
    state.view = { x: 0, y: 0, zoom: 1 }
  }

  /* ------------------------------------------------------------------ */
  /* Stabilisation (brief section 28)                                     */
  /* ------------------------------------------------------------------ */

  /**
   * Evaluate the active node and open the POSSIBILITY STABILIZED modal.
   * @param {string} [id]
   * @returns {Promise<void>}
   */
  async function stabilize(id) {
    const node = state.nodes.find((candidate) => candidate.id === (id || state.activeId))
    if (!node || state.ai.busy) return

    state.ai.busy = true
    state.generating = 'stabilize'
    await runStages(state, 'stabilize')
    state.ai.busy = false
    state.generating = null

    state.concept = buildStabilizedConcept(node, state.nodes)
    node.status = 'stabilised'

    remember({
      kind: 'stabilized',
      title: state.concept.title,
      gradient: node.gradient,
      imageUrl: node.imageUrl,
      alt: node.alt,
      nodeId: node.id,
    })
  }

  /** Discard a stabilised concept and keep exploring (section 28). */
  function keepExploring() {
    if (state.concept) {
      const node = state.nodes.find((candidate) => candidate.id === state.concept.nodeId)
      if (node && node.status === 'stabilised') node.status = 'explored'
    }
    state.concept = null
  }

  /* ------------------------------------------------------------------ */
  /* Video conversion (brief sections 29, 30, 31)                        */
  /* ------------------------------------------------------------------ */

  /**
   * Turn the stabilised concept into a storyboard, then resolve the preview.
   *
   * This is the dramatic hand-off from exploration to production: the universe
   * "contracts" into a sequence (section 39).
   *
   * @returns {Promise<void>}
   */
  async function turnIntoVideo() {
    if (!state.concept || state.ai.busy) return

    state.ai.busy = true
    state.generating = 'storyboard'
    await runStages(state, 'storyboard')

    // Delegates to the SHARED mock AI - the same generator P01 and P02 use.
    state.storyboard = await buildStoryboard(state.concept)

    state.ai.busy = false
    state.generating = null

    const { duration } = buildPreview(state.storyboard)
    state.preview = { playing: false, frameIndex: 0, time: 0, duration }
  }

  /** Play / pause the cinematic preview (also bound to SPACE, section 6). */
  function togglePreview() {
    if (!state.storyboard) return
    state.preview.playing = !state.preview.playing
  }

  /** Jump the preview to a specific frame. @param {number} index */
  function seekFrame(index) {
    const total = state.preview.duration || 1
    // Map the frame start time onto the playhead.
    const start = frames.value
      .slice(0, index)
      .reduce((sum, frame) => sum + (frame.duration || 0), 0)
    state.preview.frameIndex = index
    state.preview.time = Math.min(start, total)
  }

  /**
   * Swap two scenes in the storyboard order (export timeline editor).
   * The playhead returns to the start so the new order is what plays next.
   * @param {string} aId
   * @param {string} bId
   */
  function swapScenes(aId, bId) {
    const scenes = state.storyboard?.scenes
    if (!scenes) return
    const aIndex = scenes.findIndex((scene) => scene.id === aId)
    const bIndex = scenes.findIndex((scene) => scene.id === bId)
    if (aIndex < 0 || bIndex < 0 || aIndex === bIndex) return
    const next = [...scenes]
    const held = next[aIndex]
    next[aIndex] = next[bIndex]
    next[bIndex] = held
    state.storyboard.scenes = next
    seekFrame(0)
    notify(`SEQUENCE UPDATED — SCENE ${aIndex + 1} ↔ SCENE ${bIndex + 1}`)
  }

  /* ------------------------------------------------------------------ */
  /* Lab (brief section 27)                                              */
  /* ------------------------------------------------------------------ */

  /**
   * Apply a Lab adjustment to the active possibility.
   *
   * The Lab is exploratory, not authoritative: changing a control re-labels the
   * node so the effect of the change is visible in words as well as in colour.
   * This is what keeps it from becoming Prototype 02's parameter grid.
   *
   * @param {string} controlId
   * @param {string} value
   */
  function setLabValue(controlId, value) {
    if (!state.lab || !(controlId in state.lab)) return
    state.lab[controlId] = value

    const node = activeNode.value
    if (!node) return
    node.lab = { ...state.lab }
    node.description = `${node.title} pushed toward ${value.toLowerCase()}.`
  }

  /** Re-seed the Lab from a node so controls reflect the current selection. */
  function loadLabFor(node) {
    const blank = {
      mood: '',
      colour: '',
      style: '',
      environment: '',
      presence: '',
      intensity: '',
      cinema: '',
    }
    state.lab = node?.lab ? { ...blank, ...node.lab } : blank
  }

  /* ------------------------------------------------------------------ */
  /* Export (brief section 81)                                           */
  /* ------------------------------------------------------------------ */

  /** @param {string} platform - An EXPORT_PLATFORMS id. */
  function setExportPlatform(platform) {
    state.export.settings.platform = platform
    state.export.result = null
  }

  /** @param {'resolution'|'format'} key */
  function setExportOption(key, value) {
    state.export.settings[key] = value
    state.export.result = null
  }

  /**
   * Run the simulated export. It never claims a file was actually written.
   * @returns {Promise<object|null>}
   */
  async function runExport() {
    if (state.export.busy) return null
    state.export.busy = true
    try {
      state.export.result = await simulateExport(state.export.settings)
      return state.export.result
    } finally {
      state.export.busy = false
    }
  }

  /* ------------------------------------------------------------------ */
  /* Public API                                                          */
  /* ------------------------------------------------------------------ */

  return {
    state,
    // derived
    nodes,
    roots,
    activeNode,
    selectedNodes,
    connections,
    frames,
    hasSignal,
    isEmpty,
    // constants the views need
    bounds: { minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, nodeW: NODE_W, nodeH: NODE_H },
    exportOptions: { platforms: EXPORT_PLATFORMS, resolutions: RESOLUTIONS, formats: FORMATS },
    // signal + universe
    initializeSignal,
    resetUniverse,
    // selection
    toggleSelect,
    selectOnly,
    clearSelection,
    // synthesis
    openSynthesis,
    closeSynthesis,
    setSynthesisMode,
    executeSynthesis,
    // alternatives + branching
    openAlternatives,
    closeAlternatives,
    acceptAlternative,
    createBranches,
    // mutation + view
    moveNode,
    removeNode,
    centerOn,
    panBy,
    zoomBy,
    resetView,
    // stabilise + video
    stabilize,
    keepExploring,
    turnIntoVideo,
    togglePreview,
    seekFrame,
    swapScenes,
    // lab
    setLabValue,
    loadLabFor,
    // export
    setExportPlatform,
    setExportOption,
    runExport,
    // feedback
    notify,
    runUndo,
    remember,
  }
}