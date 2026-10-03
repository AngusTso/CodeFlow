/**
 * vite.config.js — shared Vite configuration for ALL three prototypes.
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   We author the prototypes with real tooling (Vue SFCs + Tailwind), but the
 *   deliverable must be ONE self-contained HTML file per prototype that opens
 *   by double-clicking (no server, no build step for the reviewer).
 *
 *   `vite-plugin-singlefile` inlines every bundled JS/CSS asset into the
 *   output HTML. It CANNOT inline multiple HTML inputs in a single build
 *   (it forces `output.inlineDynamicImports = true`, which Rollup rejects for
 *   multi-input builds — the plugin maintainer marked that request "wontfix").
 *
 *   Therefore: ONE PROTOTYPE PER BUILD. Which one is chosen by the
 *   `PROTOTYPE` environment variable, set by `scripts/build.mjs`.
 *
 * ENTRY NAMING
 *   The input HTML filename becomes the output filename, so we name the entry
 *   descriptively (the assignment asks for descriptive names such as
 *   `prototype-01-minimalist-mobile.html`).
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

/** Absolute path to this repository's root folder. */
const repoRoot = dirname(fileURLToPath(import.meta.url))

/**
 * The prototype registry. `entry` is the HTML file that Vite builds and that
 * also becomes the final deliverable's filename inside `dist/`.
 *
 * Prototypes 02 and 03 are declared but their entry files do not exist yet.
 * The build script skips any prototype whose entry file has not been created,
 * so the repository stays buildable while only Prototype 01 is implemented.
 */
export const PROTOTYPES = {
  '01': {
    entry: 'prototype-01-minimalist-mobile.html',
    title: 'Code Flow — minimalist, mobile-first (casual creator)',
  },
  '02': {
    entry: 'prototype-02-professional-workspace.html',
    title: 'Code Flow Pro - professional AI video workspace (desktop-first)',
  },
  '03': {
    entry: 'prototype-03-cyberpunk-experimental.html',
    title: 'Prototype 03 - experimental / exploratory (direction tentative)',
  },
}

export default defineConfig(() => {
  // Which prototype are we building? Defaults to 01 for convenience.
  const id = process.env.PROTOTYPE || '01'
  const meta = PROTOTYPES[id]

  if (!meta) {
    throw new Error(
      `Unknown PROTOTYPE "${id}". Valid values: ${Object.keys(PROTOTYPES).join(', ')}`,
    )
  }

  const entryPath = resolve(repoRoot, meta.entry)
  if (!existsSync(entryPath)) {
    throw new Error(
      `Entry file not found: ${meta.entry}. Create it before building prototype ${id}.`,
    )
  }

  return {
    root: repoRoot,
    // Relative asset base so the built file works from `file://`.
    base: './',

    plugins: [
      vue(),
      tailwindcss(),
      viteSingleFile({
        // Strip Vite's module-preload helper — everything is inlined anyway.
        removeViteModuleLoader: true,
      }),
    ],

    build: {
      outDir: 'dist',
      // Do NOT wipe dist between builds, otherwise building 02 would delete
      // the already-built prototype-01 HTML file.
      emptyOutDir: false,
      // Inline even large assets as base64 so nothing is emitted as a
      // separate file (singlefile does not inline emitted asset files).
      assetsInlineLimit: 100_000_000,
      // One CSS file, inlined into the HTML.
      cssCodeSplit: false,
      target: 'es2019',
      rollupOptions: {
        input: entryPath,
      },
    },
  }
})
