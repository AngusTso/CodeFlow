/**
 * 03-creative-signal/signalModels.js - Prototype 03's domain shapes.
 * ---------------------------------------------------------------------------
 * WHY THIS IS NOT IN shared/domain/models.js
 *   AGENTS.md asks the prototypes to share domain models, and they do: every
 *   SCENE, STORYBOARD and EXPORT object in this prototype is created by the
 *   shared factories in shared/domain/models.js and produced by the shared
 *   mock AI (see signalAi.js). What is NOT shared is the exploratory layer
 *   that only Prototype 03 has - signals, universe nodes, branches and
 *   stabilised concepts (brief sections 59 and 58).
 *
 *   Per brief section 74.2 Prototype 3 keeps its own interaction state and
 *   domain additions, so they live here rather than being pushed into a shared
 *   file that Prototypes 01 and 02 do not use. Neither prototype is refactored.
 *
 *   These are plain serialisable objects with no methods, matching the shared
 *   models' style: all behaviour lives in universeStore.js.
 */

import { uid } from '../../shared/utils/random.js'

/* ========================================================================== */
/* Signal (brief section 59)                                                   */
/* --------------------------------------------------------------------------- */
/* A Signal is the raw creative input: a sentence, a spoken thought, an image,   */
/* a rough sketch or a generated concept. `type` drives which input surface    */
/* produced it, and `chips` are the creative signals extracted from it           */
/* (section 9.1: CITY / LIFE / SECRECY / NEON / MYSTERY).                       */
/* ========================================================================== */

/**
 * @typedef {object} Signal
 * @property {string} id
 * @property {'text'|'voice'|'image'|'sketch'|'generated'} type
 * @property {string} content   Raw user content (transcript, sketch data URL...).
 * @property {string} label     Short human label, e.g. "What if a city was alive?"
 * @property {string} source    Where it came from: 'text' | 'voice' | 'sketch' | 'image' | 'ai'
 * @property {string[]} chips   Extracted creative signal keywords (section 9.1).
 * @property {string} gradient  Placeholder artwork for image/sketch signals.
 * @property {string} alt       Accessible description of any visual content.
 */

/**
 * Create a Signal.
 * @param {Partial<Signal>} [overrides]
 * @returns {Signal}
 */
export function createSignal(overrides = {}) {
  return {
    id: uid('signal'),
    type: 'text',
    content: '',
    label: '',
    source: 'text',
    chips: [],
    gradient: 'linear-gradient(135deg, #00e5ff 0%, #8b5cff 100%)',
    alt: '',
    ...overrides,
  }
}

/* ========================================================================== */
/* Creative Node (brief section 59)                                            */
/* --------------------------------------------------------------------------- */
/* Every idea in the Creative Universe is a node. Nodes form a TREE via         */
/* `parentId`, which is what makes the universe a mind map rather than a free   */
/* graph, and what lets "branch depth" be reported at stabilisation (section 28). */
/* ========================================================================== */

/**
 * Node lifecycle. `status` drives the node's visual treatment (section 14):
 *   'explored'    normal, subtle glow
 *   'selected'    strong neon outline
 *   'generated'   just created, short signal animation
 *   'recommended' carries the AI marker
 *   'stabilised'  locked in, visually dominant
 * @typedef {'explored'|'selected'|'generated'|'recommended'|'stabilised'} NodeStatus
 */

/**
 * @typedef {object} CreativeNode
 * @property {string} id
 * @property {string} title            e.g. "THE FOREST UNDER THE CITY"
 * @property {string} description      One line of what this possibility is.
 * @property {string} gradient         Placeholder artwork (visual continuity, s.54)
 * @property {string} alt              Accessible description of the artwork.
 * @property {string[]} signals        The signal titles this node was built from.
 * @property {string|null} parentId    Null for a root (the initial universe).
 * @property {string[]} children       Child node ids.
 * @property {NodeStatus} status
 * @property {{x: number, y: number}} position  Universe coordinates (pan/zoom space).
 * @property {number} depth            Distance from the root (branch depth).
 * @property {boolean} recommended     True when the AI proposed this direction.
 * @property {string} reason           Why the AI recommended it (section 23).
 * @property {string} createdFrom      'signal'|'synthesis'|'branch'|'alternative'
 * @property {object} [lab]            Lab adjustments applied to this node (s.27).
 */

/**
 * Create a Creative Node.
 * @param {Partial<CreativeNode>} [overrides]
 * @returns {CreativeNode}
 */
export function createNode(overrides = {}) {
  return {
    id: uid('node'),
    title: 'UNTITLED POSSIBILITY',
    description: '',
    gradient: 'linear-gradient(135deg, #10151c 0%, #1e2733 100%)',
    alt: '',
    signals: [],
    parentId: null,
    children: [],
    status: 'explored',
    position: { x: 0, y: 0 },
    depth: 0,
    recommended: false,
    reason: '',
    createdFrom: 'signal',
    ...overrides,
  }
}

/* ========================================================================== */
/* Branch (brief section 59)                                                   */
/* --------------------------------------------------------------------------- */
/* A Branch is the RECORD of an exploration, not a separate copy of the nodes.  */
/* Nodes are never mutated into a branch - they are added to the same universe  */
/* with a new parent, which is why "the creative history should not disappear"  */
/* (section 4.3). `snapshotIds` records what the branch contained at creation.   */
/* ========================================================================== */

/**
 * @typedef {object} Branch
 * @property {string} id
 * @property {string|null} parentNodeId
 * @property {string} direction    e.g. 'NOIR' | 'HORROR' | 'WONDER' (section 24)
 * @property {string} label        Human label, e.g. "Branch 03 // NOIR"
 * @property {string[]} snapshotIds  Node ids created under this branch.
 */

/**
 * Create a Branch record.
 * @param {Partial<Branch>} [overrides]
 * @returns {Branch}
 */
export function createBranch(overrides = {}) {
  return {
    id: uid('branch'),
    parentNodeId: null,
    direction: 'UNNAMED',
    label: 'BRANCH',
    snapshotIds: [],
    ...overrides,
  }
}

/* ========================================================================== */
/* Synthesis (brief section 59)                                                */
/* --------------------------------------------------------------------------- */
/* The record of one combination attempt. It is kept even when the user closes  */
/* the modal without executing, so the Archive can show what was tried.         */
/* ========================================================================== */

/**
 * @typedef {object} Synthesis
 * @property {string} id
 * @property {string[]} sourceNodeIds
 * @property {string[]} sourceTitles
 * @property {string} mode      A SYNTHESIS_MODES id (section 20)
 * @property {object|null} result  The generated possibility, once revealed.
 */

/**
 * Create a Synthesis record.
 * @param {Partial<Synthesis>} [overrides]
 * @returns {Synthesis}
 */
export function createSynthesis(overrides = {}) {
  return {
    id: uid('synthesis'),
    sourceNodeIds: [],
    sourceTitles: [],
    mode: 'unexpected',
    result: null,
    ...overrides,
  }
}

/* ========================================================================== */
/* Stabilised Concept (brief section 59)                                       */
/* --------------------------------------------------------------------------- */
/* The handoff point between exploration and video production (section 28). It  */
/* holds the metrics the terminal modal reports, and the storyboard the shared  */
/* mock AI derives from the chosen node.                                        */
/* ========================================================================== */

/**
 * @typedef {object} StabilizedConcept
 * @property {string} id
 * @property {string} nodeId
 * @property {string} title
 * @property {string} summary
 * @property {{coherence: string, potential: string, depth: string}} metrics
 * @property {import('../../shared/domain/models.js').Storyboard|null} storyboard
 */

/**
 * Create a Stabilised Concept.
 * @param {Partial<StabilizedConcept>} [overrides]
 * @returns {StabilizedConcept}
 */
export function createStabilizedConcept(overrides = {}) {
  return {
    id: uid('concept'),
    nodeId: '',
    title: '',
    summary: '',
    metrics: { coherence: 'HIGH', potential: 'HIGH', depth: '00' },
    storyboard: null,
    ...overrides,
  }
}

/* ========================================================================== */
/* Archive entry (brief section 26)                                            */
/* --------------------------------------------------------------------------- */
/* Archive is "the memory of the creative journey", not a file manager.         */
/* ========================================================================== */

/**
 * @typedef {object} ArchiveEntry
 * @property {string} id
 * @property {'signal'|'branch'|'synthesis'|'stabilized'} kind
 * @property {string} code       Display code, e.g. "SIGNAL 01"
 * @property {string} title
 * @property {string} gradient
 * @property {string} alt
 * @property {string} stamp      Short timestamp label.
 * @property {string|null} nodeId  Node to restore, when the entry maps to one.
 */

/**
 * Create an Archive entry.
 * @param {Partial<ArchiveEntry>} [overrides]
 * @returns {ArchiveEntry}
 */
export function createArchiveEntry(overrides = {}) {
  return {
    id: uid('archive'),
    kind: 'signal',
    code: 'MEMORY',
    title: '',
    gradient: 'linear-gradient(135deg, #10151c 0%, #1e2733 100%)',
    alt: '',
    stamp: '',
    nodeId: null,
    ...overrides,
  }
}