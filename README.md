# Code Flow — Prototype 01

A **front-end prototype** of an AI short-video creation platform, built for the
E-Song Intelligent take-home assignment.

This repository will eventually hold **three standalone HTML5 prototypes** that
share one codebase and one product logic but present three deliberately
different visual and interaction styles. **Prototype 01 is complete.**

| # | Name | Persona | Device | Visual direction | Status |
|---|------|---------|--------|------------------|--------|
| 01 | **Code Flow** | Casual creator | Mobile-first | Minimalist, friendly, low complexity | Built |
| 02 | **Code Flow Pro** | Professional filmmaker / marketer | Desktop-first | Professional creative studio (dark, cinematic) | Design doc ready |
| 03 | _to be decided_ | Creative explorer / innovator | TBD | Retro / cyberpunk (tentative) | Not started |

All three follow the same conceptual workflow:

```
Idea → Storyboard → Scenes → Character → Video Composition → Export
```

---

## Contents

1. [Quick start](#quick-start)
2. [What is built](#what-is-built)
3. [Architecture](#architecture)
4. [Component map](#component-map)
5. [How the data flows](#how-the-data-flows)
6. [Adding your own images](#adding-your-own-images)
7. [Build output — one self-contained HTML file](#build-output)
8. [Accessibility](#accessibility)
9. [Responsive strategy](#responsive-strategy)
10. [Motion](#motion)
11. [Verification](#verification)
12. [Adding Prototypes 02 and 03](#adding-prototypes-02-and-03)
13. [Known limitations](#known-limitations)

---

## Quick start

```bash
npm install          # once

npm run dev          # dev server with hot reload (prototype 01)
npm run build:01     # -> dist/prototype-01-minimalist-mobile.html
```

`npm run build:01` produces **one self-contained HTML file**. Double-click it and
it runs in any modern browser — no server, no npm, no internet connection.

| Script | What it does |
|--------|--------------|
| `npm run dev` | Vite dev server with hot module reloading |
| `npm run build:01` | Build Prototype 01 into a single HTML file |
| `npm run build:02` | Build Prototype 02 (skips politely until it exists) |
| `npm run build:03` | Build Prototype 03 (skips politely until it exists) |
| `npm run build:all` | Build every prototype whose entry file exists |

---

## What is built

Prototype 01 implements all four modules from the assignment brief.

### Global navigation (DESIGN_PROTOTYPE1 §2)

| Screen | Route | What it does |
|--------|-------|--------------|
| Home | `#/` | One obvious "Start creating" action, the five-step explainer, recent work |
| Projects | `#/projects` | Filterable library of mock saved videos, with an empty state |
| Create | `#/flow/idea` | Enters the creation flow (the flow's first step *is* the chooser) |
| Profile | `#/profile` | Mock account, stats, and a real reduced-motion indicator |

### The creation flow (DESIGN_PROTOTYPE1 §3)

| Step | Route | Assignment module | What it does |
|------|-------|-------------------|--------------|
| 1. Idea | `#/flow/idea` | — | The hybrid entry: **describe your idea** *or* **pick a template** |
| 2. Storyboard | `#/flow/storyboard` | 1. Storyboard Generator | The whole sequence: swipeable cards + an overview list; reorder, delete, regenerate, add |
| 3. Scenes | `#/flow/scenes` | 2. Scene Generation | Single-shot workbench: visual scene-type picker + lighting / mood / camera / style + preview + regenerate |
| 4. Character | `#/flow/character` | 3. Character Generator | AI character templates, customisation, and a composited "character in scene" preview |
| 5. Video | `#/flow/video` | 4. Video Composition | Compose, simulated playback with a scrubber, timeline strip, audio, platform presets, simulated export |

**Design decision worth calling out:** steps 2 and 3 could easily have been
merged. They are split on purpose — *Storyboard is about **sequence**; Scenes is
about **one shot's parameters*** — so each screen has exactly one job. That is
the "guided first, flexible later" principle from DESIGN_PROTOTYPE1 §3.

---

## Architecture

### The one idea that shapes everything

> **Shared core + swappable skin.**

Everything that makes the *product* work — the data shapes, the mock AI, the
workflow rules, the routing engine, the accessibility helpers — lives in
`src/shared/`. Everything that makes Prototype 01 *look and feel* like Prototype
01 lives in `src/prototypes/01-code-flow/`.

Prototypes 02 and 03 will import `src/shared/` **unchanged** and bring their own
`src/prototypes/0X-…/` folder. That is how the assignment's requirement —
"same platform, completely different presentation" — is satisfied structurally
rather than by copy-pasting.

### File tree

```
code_Flow/
├─ AGENTS.md                              Assignment + engineering rules
├─ Tasks.md                               The three-prototype brief
├─ DESIGN_PROTOTYPE1.md                   The design rationale for Prototype 01
├─ README.md                              ← you are here
├─ package.json                           Scripts + dependencies
├─ vite.config.js                         Build config for ALL prototypes
├─ scripts/build.mjs                      Cross-platform dev/build runner
├─ prototype-01-minimalist-mobile.html    Vite ENTRY file (= deliverable name)
├─ prototype-02-professional-workspace.html  Reserved (not created yet)
├─ prototype-03-cyberpunk-experimental.html  Reserved (not created yet)
│
├─ src/
│  ├─ shared/                             ★ REUSED BY ALL THREE PROTOTYPES
│  │  ├─ domain/models.js                 Scene, Character, Project, VideoComposition…
│  │  ├─ data/mockData.js                 Every catalogue + IMAGE SLOTS guide
│  │  ├─ ai/mockAi.js                     The five deterministic generators
│  │  ├─ store/creationStore.js           The workflow state machine
│  │  ├─ router/hashRouter.js             ~50-line dependency-free hash router
│  │  ├─ a11y/usePrefersReducedMotion.js  Reactive reduced-motion flag
│  │  └─ utils/                           random.js · async.js · format.js
│  │
│  └─ prototypes/
│     └─ 01-code-flow/                    ★ PROTOTYPE 01 ONLY
│        ├─ main.js                       Entry point: router + store + mount
│        ├─ App.vue                       Root: chooses app chrome vs flow chrome
│        ├─ assets/fonts/                  Plus Jakarta Sans (.woff2, inlined at build time)
│        ├─ theme.css                     Design tokens + transitions (Tailwind v4)
│        ├─ composables.js                provide/inject helpers
│        ├─ useDialog.js                  Focus trap, Escape, scroll lock
│        ├─ navigation.js                 The global nav model
│        ├─ components/
│        │  ├─ layout/  AppShell · BottomNavigation · FlowShell · CreationProgress
│        │  ├─ ui/      AppButton · AppIcon · AppBottomSheet · AppModal
│        │  │           GenerationState · PlaceholderArt
│        │  ├─ cards/   SceneCard · TemplateCard · CharacterCard
│        │  ├─ storyboard/ SceneTimeline
│        │  ├─ editor/  SceneEditor · CharacterEditor
│        │  └─ video/   VideoPreview
│        └─ views/
│           ├─ HomeView · ProjectsView · ProfileView
│           └─ flow/  IdeaStep · StoryboardStep · ScenesStep
│                     CharacterStep · VideoStep
│
└─ dist/                                  BUILD OUTPUT (never edit by hand)
   └─ prototype-01-minimalist-mobile.html  ← the deliverable
```

### Why these technology choices

| Choice | Reason |
|--------|--------|
| **Vue 3** (`<script setup>`) | Requested in Tasks.md; Composition API keeps state and presentation separated cleanly |
| **Tailwind CSS v4** | CSS-first config (`@theme` in `theme.css`) — no `tailwind.config.js`, fewer files to explain |
| **Vite 7** | Dev server + bundler; required to author component files at all |
| **`vite-plugin-singlefile`** | Inlines the built JS/CSS so the deliverable is one openable file |
| **No `vue-router`** | A hand-written ~50-line hash router is enough, has zero dependencies, and is easier to read |
| **No Pinia** | One `reactive()` store, injected via `provide`/`inject` |
| **No date/utility libraries** | Everything needed is a few lines of plain JavaScript |
| **No animation library** | CSS transitions + Vue's built-in `<Transition>` cover the design doc's "functional animation only" rule |
| **No icon font / CDN** | Icons are inline SVG (`AppIcon.vue`), so the built file needs zero network requests |
| **Self-hosted font** | Plus Jakarta Sans (SIL OFL 1.1) is embedded as a base64 `@font-face`, so typography has personality while the file stays fully offline |

---

### Typography

Prototype 01 uses **Plus Jakarta Sans** - a friendly, humanist-geometric UI face that suits the
casual-creator persona without looking childish.

It is **self-hosted**, never loaded from a CDN:

- The variable `.woff2` lives in `src/prototypes/01-code-flow/assets/fonts/`.
- `theme.css` declares an `@font-face` whose `url()` Vite turns into a **base64 data URI**
  during the build, because `build.assetsInlineLimit` is set very high.
- Result: distinctive typography with **zero external requests**, so the single-file
  deliverable still works offline.

| Decision | Reason |
|----------|--------|
| One **variable** file (weights 200-800) | Covers 400/500/600/700 from a single 27 kB download instead of four static files |
| **Latin subset only** | Keeps the file small. Accented Latin characters are included; anything outside the range - including the decorative sparkle emoji in the AI messages - falls through to the next font in the stack |
| A **system fallback stack** follows it | If the embedded font ever fails, the UI degrades to a normal system font instead of breaking |
| SIL OFL 1.1 licence | Free to embed and redistribute |
| `line-height`, `letter-spacing`, `word-spacing` on `body` | Loosened to 1.6 / 0.02em / 0.05em for a friendlier read. These three values are the tuning knobs |

To swap the family: drop a new `.woff2` into `assets/fonts/`, point the `@font-face` `src`
at it, and update the first entry of `--font-sans` in `theme.css`.

---
## Component map

Every component named in `AGENTS.md` exists. Here is where each one lives.

| AGENTS.md component | File | Role |
|---------------------|------|------|
| `AppShell` | `components/layout/AppShell.vue` | Chrome for the global screens; bottom bar → side rail at ≥1024px |
| `BottomNavigation` | `components/layout/BottomNavigation.vue` | Home / Projects / Create / Profile |
| `CreationProgress` | `components/layout/CreationProgress.vue` | The 5-step indicator, which doubles as step navigation |
| `TemplateCard` | `components/cards/TemplateCard.vue` | A "start from template" option |
| `SceneCard` | `components/cards/SceneCard.vue` | One shot; reused by the timeline, the picker and the preview |
| `SceneTimeline` | `components/storyboard/SceneTimeline.vue` | Swipeable card deck **and** reorderable overview list |
| `SceneEditor` | `components/editor/SceneEditor.vue` | Bottom sheet for tuning a scene |
| `CharacterCard` | `components/cards/CharacterCard.vue` | One generated character |
| `CharacterEditor` | `components/editor/CharacterEditor.vue` | Bottom sheet for customising a character |
| `VideoPreview` | `components/video/VideoPreview.vue` | The composed video + simulated playback |
| `GenerationState` | `components/ui/GenerationState.vue` | The shared "✨ AI is doing its magic…" loading surface and error banner |
| `BottomSheet` | `components/ui/AppBottomSheet.vue` | Accessible sheet (becomes a centred dialog ≥640px) |
| `Button` | `components/ui/AppButton.vue` | The only button primitive; enforces ≥44px targets and busy states |
| `Modal` | `components/ui/AppModal.vue` | Confirmation dialog for destructive actions |

Two extra components that were not in the list but earn their place:

| Component | File | Role |
|-----------|------|------|
| `AppIcon` | `components/ui/AppIcon.vue` | Inline SVG icon set — keeps the build dependency-free |
| `FlowShell` | `components/layout/FlowShell.vue` | Chrome for the creation flow (progress header + sticky action bar) |
| `PlaceholderArt` | `components/ui/PlaceholderArt.vue` | **The single place real images plug in** (see below) |

---

## How the data flows

The prototype follows one rule: **state changes in one direction only.**

```
  user interaction
        │
        ▼
   component emits intent            e.g. <SceneCard @regenerate="…">
        │
        ▼
   view calls a store action         e.g. store.regenerateSceneById(id)
        │
        ▼
   store action calls the mock AI    e.g. mockAi.regenerateScene(scene, variant)
        │
        ▼
   mock AI resolves after a delay    (the loading state is visible here)
        │
        ▼
   store mutates reactive state      →  every subscribed component re-renders
```

Practical consequences:

* **Components never mutate state directly.** They emit events; the view decides
  which store action to call.
* **`state.isGenerating` is a single flag**, which is why every action that could
  conflict is disabled while the AI is "working" — no double submissions.
* **When scenes change, the composed video is invalidated**
  (`store.invalidateComposition()`), so the Video step can never show a stale
  preview. Try it: compose a video, go back, delete a scene, return — the Video
  step asks you to re-compose.

### Deterministic "AI"

`src/shared/ai/mockAi.js` hashes your idea text into a seed, then drives a tiny
PRNG. The same idea therefore always produces the same storyboard, which makes
the prototype reproducible during a live demo. Keywords in the idea pick the
scene types, so "space station" really does give you sci-fi shots.

Regeneration is deterministic too, but *per variant*: the store keeps a
per-scene counter, so pressing **Regenerate** twice gives two different results
while remaining reproducible.

---

## Adding your own images

The prototype ships with **CSS-gradient placeholders instead of image files**,
on purpose: an image reference would be a separate file, which would break the
"one self-contained HTML file" requirement.

Every piece of artwork goes through one component — `PlaceholderArt.vue`:

```
if (imageUrl)  → renders <img :src="imageUrl" :alt="alt" loading="lazy">
otherwise      → renders the gradient + glyph as an accessible placeholder
```

### To use real artwork

1. Create `src/prototypes/01-code-flow/assets/`.
2. Put your image there.
3. Import it in `src/shared/data/mockData.js` and assign it:

```js
// at the top of src/shared/data/mockData.js
import neonCityShot from '../prototypes/01-code-flow/assets/neon-city.jpg'

// then on the relevant entry (template, character, …)
{
  id: 'neon-city',
  title: 'Neon City Nights',
  imageUrl: neonCityShot,   // ← add this line
  // …
}
```

4. For **generated** scenes, add `imageUrl` inside `buildScene()` in
   `src/shared/ai/mockAi.js` (it already receives the scene type, so this is
   where a per-type image map would go).

Vite converts the import into a base64 data-URI at build time, because
`build.assetsInlineLimit` is set very high in `vite.config.js`. So the built
file stays self-contained **and** shows your real images.

### Why not a `/public` folder?

`vite-plugin-singlefile` explicitly does **not** inline files from `public/` —
they are copied next to the HTML as separate files. That would break the single
file requirement, so the prototype avoids `public/` entirely (even the favicon
is an inline SVG data-URI).

**Note on file size:** base64 inflates images by roughly 33%, and everything is
in the one file. For a prototype, 1–2 small images per type is plenty; large
photo sets would bloat the deliverable.

---

## Build output — one self-contained HTML file

```bash
npm run build:01
```

produces:

```
dist/prototype-01-minimalist-mobile.html     ~265 kB  (≈99 kB gzipped)
```

Verified contents of that file:

| Check | Result |
|-------|--------|
| `<script src="…">` tags | **0** — all JavaScript is inlined |
| `<link rel="stylesheet">` tags | **0** — all CSS is inlined into one `<style>` |
| `<img src="…">` tags | **0** — no external images |
| External `http(s)` requests | **0** — the only URLs present are inert strings (XML namespaces, a fake share link, Vue's error-docs link in a warning message) |
| Font inlined | `data:font/woff2;base64` present; **0** `gstatic` references |
| Files emitted next to it | **0** — `dist/` contains exactly one file |

So `dist/prototype-01-minimalist-mobile.html` can be emailed, copied to a USB
stick, or opened from `file://` and it will work.

### Why one build per prototype?

`vite-plugin-singlefile` forces Rollup's `inlineDynamicImports: true`, which
Rollup rejects when a build has more than one HTML input:

> `Invalid value for option "output.inlineDynamicImports" - multiple inputs are not supported…`

That is why `vite.config.js` builds **exactly one prototype per run**, selected
by the `PROTOTYPE` environment variable, and why `scripts/build.mjs` exists (it
sets that variable in-process, so `npm run build:02` behaves the same on
Windows, macOS and Linux).

`build.emptyOutDir` is deliberately `false`, so building prototype 02 does not
delete the already-built prototype 01.

---

## Accessibility

Targeted at **WCAG 2.1 AA**, as required by AGENTS.md. Concretely:

| Requirement | How it is met |
|-------------|---------------|
| **Semantic HTML5** | `header`, `nav`, `main`, `section`, `article`, `ol`/`ul`, `button`, `label`, `fieldset`/`legend`, `dl`, `p` |
| **Keyboard navigation** | Every action is a real `<button>` or `<a>`; duplicate links and buttons were avoided |
| **Visible focus** | A 3px brand-coloured `:focus-visible` ring, applied globally in `theme.css` |
| **Skip links** | "Skip to content" (app shell) and "Skip to workflow" (flow shell) |
| **ARIA labels** | Icon-only buttons carry explicit names *including the scene number* ("Regenerate scene 2") |
| **ARIA state** | `aria-current="page"` / `"step"`, `aria-pressed`, `aria-expanded`, `aria-busy`, `aria-modal` |
| **Live regions** | Generation messages, playback state, reorder results, and step changes are announced politely |
| **Image alt text** | Required prop on `PlaceholderArt`; gradients get `role="img"` + `aria-label` so placeholders are described too |
| **Colour contrast** | Token palette chosen for ≥4.5:1 on text; state is never communicated by colour alone (icons + words are always present) |
| **Touch targets** | Buttons and controls are ≥44px tall (`min-h-11`) |
| **Non-drag alternative** | Scene reordering is available as **Move up / Move down** buttons *and* drag — never drag only |
| **Dialog pattern** | Focus trap, Escape to close, scroll lock, and focus restoration, all from one shared `useDialog()` |
| **Reduced motion** | Honoured in CSS *and* read reactively in JS (the carousel jumps instead of easing) |
| **Status messages** | Empty states use `role="status"`; errors use `role="alert"` |

### Honest note on the reduced-motion UI

The Profile screen does **not** fake a working "reduce motion" toggle. It reads
your real operating-system setting and reports it. A toggle that pretends to
override an OS preference would be misleading in a prototype being assessed for
honesty about limitations.

---

## Responsive strategy

DESIGN_PROTOTYPE1 §11, implemented as follows. Mobile is the primary design
constraint; larger screens adapt the layout rather than stretching it.

| Breakpoint | Navigation | Content | Notable changes |
|-----------|------------|---------|-----------------|
| **320–374px** | Fixed bottom tab bar (4 items) | Single column | Step labels hidden in `CreationProgress` — five labels cannot fit, so numbers carry the meaning |
| **375–639px** | Fixed bottom tab bar | Single column | Step labels appear; scene cards are 86% width for a comfortable swipe |
| **640–1023px** | Fixed bottom tab bar | Single column, wider | Bottom sheets become **centred dialogs**; grids go two-up; scene cards fix to 26rem |
| **≥1024px** | **Left side rail** (same 4 destinations) | Centred max-4xl column | The flow's contextual header replaces the global nav, preserving the two-layer navigation model |

Every breakpoint keeps the **same mental model**: same four destinations, same
five-step workflow, same card metaphors. Only the arrangement changes.

Tested by resizing the built file in a browser at 320 / 375 / 768 / 1440px.

---

## Motion

**No animation library is used.** The design doc's rule (DESIGN_PROTOTYPE1 §8) is
"functional animation only", and CSS plus Vue's built-in `<Transition>` satisfies
it completely:

| Animation | Purpose | Implementation |
|-----------|---------|----------------|
| `fade-page` | Moving between workflow steps | `<Transition>` + `theme.css` |
| `fade` | A gentle state change (dialog backdrop) | `<Transition>` |
| `pop` | New AI-generated content arriving | `<Transition>` |
| `sheet` | A bottom sheet rising into place | `<Transition>` |
| `animate-breathe` | "AI is thinking" pulse | CSS keyframes |
| `animate-shimmer` | Loading placeholder sweep | CSS keyframes |
| Native scroll-snap | Swiping scene cards | CSS only — zero JS |

All of it is neutralised by one `@media (prefers-reduced-motion: reduce)` block
in `theme.css`, which shortens durations rather than removing rules (so no
layout logic can break).

---

## Verification

What was actually run, and what it proved:

| Check | Result |
|-------|--------|
| `npm install` | 129 packages, no errors |
| `npm run build:01` | 47 modules transformed, built in ~1.2s, no warnings |
| Output is a single file | `dist/` contains exactly 1 file |
| No external references | 0 `<script src>`, 0 stylesheet links, 0 `<img src>`, 0 network URLs |
| Runtime smoke test | 40 assertions across the mock AI, store, and router — **all passed** |

The smoke test covered: keyword-based scene-type inference, deterministic
generation (same idea → same storyboard), unique scene ids, order
renormalisation after reorder/delete, regeneration preserving identity,
parameter application, character generation and editing, composition duration
matching the scene total, platform presets, export output, automatic
invalidation of a stale composition, progressive-freedom guards, and reset.

Additional manual verification to perform in a browser (recommended before the
demo):

- [ ] Resize to 320 / 375 / 768 / 1440px and confirm the layout rules above.
- [ ] Tab through each screen — focus should be visible and never trapped
      outside a dialog.
- [ ] Open a bottom sheet, press **Esc**, and confirm focus returns to the
      button you opened it with.
- [ ] Turn on your OS "reduce motion" setting and reload — the Profile screen
      should report it, and animations should stop.
- [ ] Open `dist/prototype-01-minimalist-mobile.html` from the file system
      (not through a server) to confirm it works with no network.

---

## Adding Prototypes 02 and 03

The repository is already wired for them. To add Prototype 02:

1. **Create the entry file** `prototype-02-professional-workspace.html` (copy
   Prototype 01's, change the `<script src>` to your new main file). The
   filename *is* the deliverable name — keep it descriptive.
2. **Create the skin folder** `src/prototypes/02-professional-workspace/` with its own
   `main.js`, `App.vue`, `theme.css`, and `components/`.
3. **Import the shared core unchanged**:

```js
import { createCreationStore } from '../../shared/store/creationStore.js'
import { createHashRouter } from '../../shared/router/hashRouter.js'
import * as ai from '../../shared/ai/mockAi.js'      // same generators
import { SCENE_TYPES, MOODS } from '../../shared/data/mockData.js'
```

4. `vite.config.js` already declares prototype `02`; the build script skips any
   entry file that does not exist yet, so the repository never breaks.
5. Build with `npm run build:02`.

**What you get for free:** all four assignment modules, the mock AI, the data
models, the workflow rules, the hash router, reduced-motion handling, and the
dialog accessibility pattern.

**What you must build fresh:** the entire visual language, the navigation
pattern, the layout structure, the component markup, and the interaction model.
That is the point of the exercise — *same product, different design.*

### Suggested differentiation axes

The assignment asks for three genuinely distinct prototypes. Useful axes:

| Axis | Prototype 01 | 02 (example) | 03 (example) |
|------|--------------|--------------|--------------|
| Persona | Casual creator | Professional marketer | Filmmaker / educator |
| Device priority | Mobile-first | Desktop-first | Either |
| Navigation | Bottom tabs | Command palette / side rail | Top nav |
| Interaction | Guided wizard + swipe cards | Dense dashboard + drag | Modal / full-screen |
| AI input | Text prompt + templates | Preset-driven | Voice / drawing |
| Visual density | Minimal | Feature-rich | Editorial |
| Palette & type | Soft, restrained | High-contrast neon | Bold, cinematic |

---

## Known limitations

Being explicit, as the assignment asks:

1. **Nothing persists.** Reloading the page loses your project; there is no
   storage, no backend, and no account. The Projects screen shows mock data.
2. **No real media.** Artwork is a CSS gradient placeholder, "playback" is a
   timer driving a playhead, and "export" returns a plausible filename — no file
   is ever created.
3. **Drag-to-reorder uses HTML5 drag-and-drop**, which does not fire on touch
   devices. This is deliberate: the **Move up / Move down** buttons are the
   primary reordering mechanism (44px, keyboard-accessible, announces results)
   and drag is a desktop accelerator on top. Prototype 01 is mobile-first, so
   the touch path had to be the reliable one.
4. **The mock AI is keyword-matched, not semantic.** `inferSceneTypes()` looks
   for words like "city" or "space". A cleverer prompt will not produce cleverer
   output — by design, per the "no real models" constraint.
5. **Reduced-motion cannot be toggled in-app.** It mirrors the OS setting.
6. **No automated browser tests.** Logic is covered by the Node smoke test
   above; DOM behaviour was verified manually. Adding Playwright would be the
   obvious next step for a production codebase.
7. **`dist/` is generated.** Never edit it by hand — always rebuild from `src/`.

---

## Documentation deliverables

`Tasks.md` also asks for a design rationale and a responsive testing report.
The materials for both are already in this repository:

* **Design rationale** — `DESIGN_PROTOTYPE1.md` holds the decisions; the
  [Architecture](#architecture), [Accessibility](#accessibility) and
  [Motion](#motion) sections of this README explain the engineering trade-offs
  behind them.
* **Responsive testing report** — the
  [Responsive strategy](#responsive-strategy) table is the written report;
  capture screenshots at 375 / 768 / 1440px and attach them there.

---

*Prototype 01 — Code Flow. Built with Vue 3, Tailwind CSS v4 and Vite 7; shipped
as a single self-contained HTML file.*






