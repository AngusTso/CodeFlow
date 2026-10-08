## 1. Global / every prototype

### Basic stability

- [x] Open the HTML directly from the filesystem
- [x] No blank screen
- [x] No visible broken UI
- [x] No console errors
- [x] No accidental browser alert/error
- [x] Main navigation works
- [x] Back / return interactions work where applicable
- [x] No obvious dead buttons in the main journey
- [x] Refreshing doesn't completely break the prototype

### Standalone requirement

The task requires each prototype to be a standalone HTML5 file.

- [x] P1 opens standalone
- [x] P2 opens standalone
- [x] P3 opens standalone
- [x] No external dependency required to make the core experience work
- [x] Embedded assets/fonts don't fail
- [x] No missing images/resources

# 2. P1 — Core journey

P1's design promise is:

> **AI removes complexity rather than exposes it.**

That contrast with P2 is explicitly part of our design rationale.

### Main flow

- [x] Start from home
- [x] Enter an idea
- [x] Generate storyboard
- [x] Storyboard actually appears
- [x] Move through scenes
- [x] Edit scene
- [x] Regenerate a scene
- [x] Add/delete/reorder scene
- [x] Character generation works
- [x] Character can be edited
- [x] Compose video
- [x] Export flow works

### Most important UX check

Ask yourself:

> **“Could someone who doesn't know professional video editing understand what to do next?”**

- [x] Next action is obvious
- [x] No unnecessary professional terminology
- [x] User isn't confronted with too many parameters
- [x] AI feels like it is helping rather than asking the user to do the work
- [x] Progress through the creation process feels natural

If this passes, **P1 has fulfilled its design purpose.**

# 3. P2 — Core professional workflow

P2's design document is very explicit that it should feel like a **professional production workspace**, not a chatbot with a video attached. It emphasizes persistent Inspector, contextual AI, multi-track timeline, human control, reversible AI changes, and non-destructive variations.

### Main flow

- [x] Open workspace
- [x] Select Scene 01
- [x] Select Scene 02
- [x] Inspector updates
- [x] Change/edit a property
- [x] Timeline responds correctly
- [x] Generate variation
- [x] Variation appears
- [x] Preview variation
- [x] Use variation
- [x] Original isn't unexpectedly destroyed
- [x] Copilot opens
- [x] Give Copilot instruction
- [x] Proposal appears
- [x] Apply proposal
- [x] Reject proposal
- [x] Undo
- [x] Redo
- [x] Export

### Critical conceptual check

Ask:

> **“Does AI assist me, or does AI take control away from me?”**

You want:

**Human → AI proposal → review → apply**

not:

**Human → AI silently changes everything**

That is one of the core design principles of P2.

### Responsive

This is 🔴 MUST because we already found the problem.

- [x] **375px**
- [x] **768px**
- [x] 1024px
- [x] **1440px**
- [x] No horizontal page overflow
- [x] Inspector doesn't simply push the whole page off-screen
- [x] At tablet/mobile, controls become an appropriate lighter experience
- [x] Desktop workspace remains intact

Our design explicitly says P2 is desktop-first, while smaller layouts should collapse panels rather than simply squeeze the entire professional editor.

# 4. P3 — Core experimental journey

P3's design document is particularly important here.

The intended loop is:

**SIGNAL → DISCOVER → COMBINE → GENERATE → EXPLORE → BRANCH → STABILIZE → VIDEO**

and the central idea is **exploration over execution, combination over prompting, and branching over linear workflow**.

### Signal

- [x] Voice Signal works
- [x] Listening state appears
- [x] Processing state appears
- [x] Captured signal appears
- [x] Transcript appears
- [x] Enter Universe works
- [x] Text fallback works

### Universe

- [x] Universe generates
- [x] Nodes appear
- [x] Nodes have meaningful labels/images
- [x] Click node
- [x] **Selected state actually changes**
- [x] Ctrl/Cmd select works if supported
- [x] Drag node
- [x] Combine nodes
- [x] Synthesis modal opens
- [x] Sources A/B are correct
- [x] Select synthesis mode
- [x] Execute synthesis
- [x] New possibility appears

### Exploration

- [x] Branch works
- [x] Previous creative direction isn't lost
- [x] Stabilize works
- [x] Turn into video works
- [x] Storyboard appears
- [x] Preview works
- [x] Archive/back navigation works

### The most important P3 question

Ask:

> **“Does this feel like discovering possibilities, rather than filling in a video-generation form?”**

If yes → P3 is doing its job.

The design document explicitly says the user should begin with an incomplete thought rather than immediately specifying duration, camera, lens, timeline, etc.

# 5. Responsive screenshots

This is **definitely MUST** because the assignment specifically requests these sizes.

For **each prototype**:

### 375px

- [x] Screenshot
- [x] Main journey usable
- [x] No horizontal overflow

### 768px

- [x] Screenshot
- [x] Layout makes sense
- [x] No major clipping/overflow

### 1440px

- [x] Screenshot
- [x] Main intended desktop experience
- [x] No weird empty overflow area

That's:

**3 prototypes × 3 sizes = 9 screenshots.**

Perfect for the Responsive Testing Report.
