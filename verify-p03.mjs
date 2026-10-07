import {
  SYNTHESIS_MODES,
  buildAlternatives,
  buildBranches,
  buildPreview,
  buildStabilizedConcept,
  buildStoryboard,
  buildSynthesis,
  generateInitialUniverse,
} from './src/prototypes/03-creative-signal/signalAi.js'
import { createSignal } from './src/prototypes/03-creative-signal/signalModels.js'
import { createUniverseStore } from './src/prototypes/03-creative-signal/universeStore.js'

function buildSignal(content, type = 'text') {
  return createSignal({ content, type, source: type, label: content, chips: [] })
}

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail })
}

const s1 = createSignal({ content: 'What if a city was alive?', label: 'What if a city was alive?', type: 'text', source: 'text' })

const u1 = await generateInitialUniverse(s1)
const u2 = await generateInitialUniverse(s1)
check('universe-root-plus-four', u1.length === 5, u1.map((n) => n.title).join(' | '))
check('universe-deterministic', u1.map((n) => n.title).join('|') === u2.map((n) => n.title).join('|'))
check('universe-ring-layout', u1[0].position.x === 0 && u1[1].position.x !== 0)
check('universe-seven-modes', SYNTHESIS_MODES.length === 7, SYNTHESIS_MODES.map((m) => m.id).join(','))

const syn = buildSynthesis([u1[1], u1[2]], 'unexpected')
check('synthesis-built', Boolean(syn && syn.node && syn.node.title), syn ? syn.node.title : 'null')
const syn2 = buildSynthesis([u1[1], u1[2]], 'unexpected')
check('synthesis-deterministic', syn.node.title === syn2.node.title, syn.node.title)

const alt = buildAlternatives(u1[1])
check('alternatives-count', alt.nodes.length === 3, `${alt.nodes.length} nodes`)
check('alternatives-reason', alt.reason.length > 0)
check('alternatives-keep-parent-id', alt.nodes.every((n) => n.parentId === u1[1].id))
check('alternatives-one-recommended', alt.nodes.filter((n) => n.recommended).length === 1)

const branches = buildBranches(u1[1])
check('branches-count', branches.length === 3, branches.map((b) => b.direction).join(','))

const stab = buildStabilizedConcept(u1[1], u1)
check('stabilized-metrics', Boolean(stab.metrics.coherence && stab.metrics.potential), JSON.stringify(stab.metrics))

const sb = await buildStoryboard(stab)
check('storyboard-uses-shared-scenes', sb.scenes.length === 4, `${sb.scenes.length} scenes`)
check('storyboard-shared-shape', sb.scenes.every((s) => s.id && s.title && typeof s.duration === 'number'))

const pv = buildPreview(sb)
check('preview-frames', pv.frames.length === 4 && pv.duration > 0, `duration ${pv.duration}`)
check('preview-null-guard', buildPreview(null).frames.length === 0)

// Store-level regression: deleting a leaf must shrink the universe, undo must
// restore it, and deleting the root must remove the whole subtree.
const store = createUniverseStore()
await store.initializeSignal({ type: 'text', content: 'What if a city was alive?' })
check('store-leaf-remove', (() => {
  const before = store.state.nodes.length
  const leaf = store.state.nodes[store.state.nodes.length - 1]
  store.removeNode(leaf.id)
  return store.state.nodes.length === before - 1
})(), `${store.state.nodes.length} nodes`)
store.runUndo()
check('store-leaf-undo', store.state.nodes.length === 5, `${store.state.nodes.length} nodes`)
check('store-root-subtree-remove', (() => {
  const root = store.state.nodes.find((n) => !n.parentId)
  store.removeNode(root.id)
  return store.state.nodes.length === 0
})(), `${store.state.nodes.length} nodes`)
store.runUndo()
check('store-root-subtree-undo', store.state.nodes.length === 5, `${store.state.nodes.length} nodes`)

// Character signal: seeds a character-rooted universe (bug list item 4).
const sc = createSignal({
  content: 'The last gardener on a dead planet, still talking to the seeds.',
  label: 'The last gardener on a dead planet, still talking to the seeds.',
  type: 'character',
  source: 'character',
})
const uc = await generateInitialUniverse(sc)
check(
  'character-universe',
  uc.length === 5 && uc.every((n) => n.signals.includes('CHARACTER')),
  uc.map((n) => n.title).join(' | '),
)
check(
  'character-directions',
  uc.slice(1).some((n) => /A DAY IN THE LIFE|BEFORE |LAST ONE|DREAMS ABOUT/.test(n.title)),
  uc.slice(1).map((n) => n.title).join(' | '),
)

// Timeline swap: guard without a storyboard, then a real reorder (bug item 5).
check('swap-scenes-guard', (() => {
  store.swapScenes('nope', 'nada') // no storyboard yet — must not throw
  return true
})())
const storeE = createUniverseStore()
await storeE.initializeSignal({ type: 'text', content: 'What if a city was alive?' })
const rootE = storeE.state.nodes.find((n) => !n.parentId)
await storeE.stabilize(rootE.id)
await storeE.turnIntoVideo()
const scenesE = storeE.state.storyboard.scenes
const aId = scenesE[0].id
const bId = scenesE[2].id
storeE.swapScenes(aId, bId)
check(
  'swap-scenes',
  storeE.state.storyboard.scenes[0].id === bId && storeE.state.storyboard.scenes[2].id === aId,
  storeE.state.storyboard.scenes.map((s) => s.title).join(' | '),
)
check(
  'swap-scenes-persists-concept',
  Boolean(storeE.state.concept),
  storeE.state.concept ? storeE.state.concept.title : 'concept cleared',
)

const failed = results.filter((r) => !r.ok)
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name} ${r.detail}`)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)
