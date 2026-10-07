/**
 * scripts/verify-p02.mjs - behavioural check for the Prototype 02 bug fixes
 * listed in bugs_prototype2.md. Run with: node scripts/verify-p02.mjs
 */
import { createWorkspaceStore } from '../src/prototypes/02-professional-workspace/workspaceStore.js'

const failures = []
function check(label, ok, detail = '') {
  if (ok) console.log(`  ok   ${label}`)
  else {
    failures.push(label)
    console.log(`FAIL   ${label} ${detail}`)
  }
}

const store = createWorkspaceStore()

// --- P2 <768px: timeline collapsed by default (no window in node => false)
check('timeline collapse flag exists', typeof store.state.timeline.collapsed === 'boolean')

// --- timeline drag: seconds are converted to scene positions
const ids0 = store.scenes.value.map((s) => s.id)
let track = store.state.project.tracks.find((t) => t.kind === 'video')
let clip = track.clips[1]
const movedRight = store.moveClipBySeconds(track.id, clip.id, Math.round(clip.duration + 1))
const ids1 = store.scenes.value.map((s) => s.id)
check(
  'dragging scene 2 to the right reorders the sequence',
  movedRight && ids1[2] === ids0[1],
  JSON.stringify({ ids0, ids1, movedRight }),
)

track = store.state.project.tracks.find((t) => t.kind === 'video')
clip = track.clips[2]

const movedLeft = store.moveClipBySeconds(track.id, clip.id, -Math.round(clip.duration))
const ids2 = store.scenes.value.map((s) => s.id)
check(
  'dragging left moves the dragged scene towards the start',
  movedLeft && ids2.indexOf(ids1[2]) < ids1.indexOf(ids1[2]) && ids2.indexOf(ids1[2]) !== -1,
  JSON.stringify({ ids0, ids2, movedLeft }),
)

track = store.state.project.tracks.find((t) => t.kind === 'video')
clip = track.clips[1]
const nudge = store.moveClipBySeconds(track.id, clip.id, 1)
check('a sub-half-clip drag does not jump positions', nudge === false, `nudge=${nudge}`)

// --- renames
check('project can be renamed', store.setProjectTitle('New working title') === true)
check('project name applied', store.state.project.title === 'New working title')
check('blank project name ignored', store.setProjectTitle('   ') === false)

const firstScene = store.scenes.value[0]
check('scene can be renamed', store.setSceneName(firstScene.id, 'Renamed shot') === true)
check('scene name applied', store.scenes.value[0].title === 'Renamed shot')
check('blank scene name ignored', store.setSceneName(firstScene.id, '') === false)

// --- undo still covers the new edits
store.undo()
check('undo reverts the scene rename', store.scenes.value[0].title !== 'Renamed shot')

// --- add scene
const count0 = store.scenes.value.length
const created = await store.addScene()
check('addScene returns a scene', Boolean(created))
check('addScene appends/inserts exactly one scene', store.scenes.value.length === count0 + 1)
check('addScene selects the new scene', store.state.selection.id === created?.id)
check('addScene keeps lanes in sync',
  store.state.project.tracks.find((t) => t.kind === 'video').clips.length === store.scenes.value.length)

// --- variations belong to one scene only, original stays listed
const sceneA = store.scenes.value[0]
store.selectScene(sceneA.id)
await store.requestVariation()
check('a variation was generated', store.state.variations.list.length >= 1)
check('variation is tagged with its own scene',
  store.state.variations.list.every((v) => v.sceneId === sceneA.id),
  JSON.stringify(store.state.variations.list.map((v) => v.sceneId)))

const sceneB = store.scenes.value[1]
store.selectScene(sceneB.id)
check('selecting another scene clears the active variation',
  store.state.variations.activeId === null || store.state.variations.activeId === undefined,
  `activeId=${store.state.variations.activeId}`)
check('scene B does not inherit scene A takes',
  store.state.variations.list.every((v) => v.sceneId !== sceneB.id))
check('the baseline scene object is untouched',
  sceneA.origin !== 'ai-variation')

// previewing the synthetic "original" id resolves to no active variation
store.selectScene(sceneA.id)
store.previewVariation('original')
check('previewing the original clears the variation preview',
  store.activeVariation.value === null)

console.log(failures.length ? `\n${failures.length} FAILURES` : '\nAll Prototype 02 checks passed.')
process.exit(failures.length ? 1 : 0)
