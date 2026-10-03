/**
 * scripts/build.mjs — cross-platform build / dev runner.
 * ---------------------------------------------------------------------------
 * WHY A SCRIPT INSTEAD OF PLAIN npm SCRIPTS?
 *   Selecting a prototype requires an environment variable (`PROTOTYPE`).
 *   Setting env vars differs between Windows (`set X=1`) and POSIX (`X=1`),
 *   which breaks npm scripts across platforms and requires `cross-env`.
 *   This tiny Node script sets `process.env.PROTOTYPE` in-process before
 *   invoking Vite, so `npm run build:02` behaves identically everywhere.
 *
 * USAGE
 *   node scripts/build.mjs --dev        # dev server for prototype 01
 *   node scripts/build.mjs 01           # build prototype 01
 *   node scripts/build.mjs all          # build every prototype that exists
 */

import { build, createServer } from 'vite'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PROTOTYPES } from '../vite.config.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// ---- Parse CLI arguments -------------------------------------------------
const args = process.argv.slice(2)
const isDev = args.includes('--dev')
// First non-flag argument is the prototype id (defaults to '01').
const target = args.find((arg) => !arg.startsWith('--')) || '01'

/** Build exactly one prototype. Skips gracefully when its entry is missing. */
async function buildPrototype(id) {
  const meta = PROTOTYPES[id]

  if (!meta) {
    console.error(`✖ Unknown prototype "${id}". Valid: ${Object.keys(PROTOTYPES).join(', ')}`)
    process.exitCode = 1
    return
  }

  if (!existsSync(resolve(repoRoot, meta.entry))) {
    console.warn(`⏭  Skipping prototype ${id} — "${meta.entry}" has not been created yet.`)
    return
  }

  process.env.PROTOTYPE = id
  console.log(`\n🔨 Building prototype ${id}\n   ${meta.title}\n   → dist/${meta.entry}\n`)
  await build()
}

// ---- Dispatch ------------------------------------------------------------
if (isDev) {
  // Dev server always serves prototype 01 for now.
  process.env.PROTOTYPE = '01'
  const server = await createServer()
  await server.listen()
  server.printUrls()
  console.log('\n   Tip: open the URL above with /prototype-01-minimalist-mobile.html\n')
} else if (target === 'all') {
  for (const id of Object.keys(PROTOTYPES)) {
    await buildPrototype(id)
  }
  console.log('\n✅ All existing prototypes built into ./dist\n')
} else {
  await buildPrototype(target)
  console.log('\n✅ Done. Open ./dist/ in your browser by double-clicking the HTML file.\n')
}
