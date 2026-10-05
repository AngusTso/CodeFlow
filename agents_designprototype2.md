# Prototype 2 — Professional Workspace

## Agent Design Specification

> **Purpose:** Implementation-facing design brief for Prototype 2.
> The full product rationale and UX philosophy are documented in `DESIGN_PROTOTYPE.md`.
> This file contains the concrete decisions the coding agent should follow when implementing Prototype 2.
>
> **Precedence (per the product owner):** `DESIGN_PROTOTYPE.md` is the primary authority for
> design direction, visual identity, and philosophy. Where the two documents conflict on
> *non-implementation* concerns, `DESIGN_PROTOTYPE.md` wins. This brief governs concrete,
> implementation-level decisions (structure, vocabulary, file layout, priority order).

---

# 1. Prototype Identity

**Name:** Code Flow Pro

**Audience:**

- Professional filmmakers
- Professional creators
- Marketers producing video content

**Core philosophy:**

> **AI accelerates professional creative work; it does not hide or replace the craft.**

Prototype 2 is about **execution and acceleration**.

Prototype 1 is about making video creation accessible.

Prototype 3 will be about discovering what an idea could become.

Do not blur these three experiences.

---

# 2. Relationship to Prototype 1

Prototype 1:

> "Help me make a video."

Prototype 2:

> "I already know how to make videos. Help me make them faster."

Therefore Prototype 2 must NOT simply be Prototype 1 with a dark theme.

### Prototype 2 deliberately exposes:

- scenes
- shots
- camera controls
- lighting
- timeline
- assets
- parameters
- variations
- professional editing concepts

### Prototype 2 deliberately avoids:

- wizard-first workflow
- excessive simplification
- consumer-style card flows
- hiding production complexity
- mobile-first interaction

---

# 3. Overall Layout

Prototype 2 is **desktop-first**.

Primary desktop structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ TOP BAR                                                     │
├──────────────┬──────────────────────────────┬───────────────┤
│              │                              │               │
│ PROJECT      │                              │   INSPECTOR   │
│ NAVIGATION   │       VIDEO PREVIEW          │               │
│              │                              │               │
│              │                              │               │
├──────────────┴──────────────────────────────┴───────────────┤
│                         TIMELINE                             │
├─────────────────────────────────────────────────────────────┤
│                    AI / ACTION BAR                          │
└─────────────────────────────────────────────────────────────┘
```

The exact implementation may adapt to the existing application architecture, but this hierarchy must remain.

### Recommended desktop proportions

- Top bar: ~56–64px
- Left navigation: ~220–240px
- Inspector: ~300–340px
- Timeline: ~260–320px
- Center preview: flexible and dominant
- Bottom AI action area: ~56–72px

---

# 4. Navigation

Prototype 2 does **not** use Prototype 1's consumer-style global navigation.

The project itself is the workspace.

### Top bar

Include:

- project name / project switcher
- contextual workspace navigation
- AI Copilot
- Preview
- Export

Example:

```text
Code Flow Pro
Project Name ▼

Scenes   Assets   Characters

                              AI Copilot   Preview   Export
```

A project switcher is allowed/expected.

---

# 5. Left Project Navigation

Use a compact production-oriented navigation.

Suggested structure:

```text
PROJECT

Storyboard
Scenes
Assets
Characters

LIBRARY

Media
Styles
Audio
```

Do not turn this into a large file-management interface.

Its purpose is to preserve production context.

---

# 6. Video Preview

The center workspace is dominated by the video preview.

Requirements:

- dark canvas
- cinematic video framing
- playback controls
- play/pause
- current time / duration
- fullscreen
- comparison mode where appropriate

Example:

```text
┌──────────────────────────────────┐
│                                  │
│          VIDEO PREVIEW           │
│                                  │
│                                  │
├──────────────────────────────────┤
│ ▶  00:14 / 00:28    Compare  ⛶  │
└──────────────────────────────────┘
```

The preview should be the visual focus of the workspace.

---

# 7. Persistent Inspector

The Inspector is **persistent on desktop**.

It changes based on the selected object:

- scene
- shot
- character
- asset
- timeline element

Example:

```text
SCENE 04
12.4 sec

CAMERA
Lens        [ 50mm ▼ ]
Movement    [ Push-in ▼ ]
Framing     [ Medium ▼ ]

LIGHTING
Type        [ Neon ▼ ]
Intensity   [────●────] 72%
Contrast    [ High ▼ ]

MOOD
[ Tense ]

AI ACTIONS
[ Generate Variation ]
[ Extend Shot ]
[ Enhance Cinematic Look ]
```

The Inspector should feel like a professional creative-control panel.

---

# 8. Initial Inspector Vocabulary

Use these initial controls unless existing shared data requires a compatible alternative.

### Lens

```text
18mm
24mm
35mm
50mm
85mm
```

### Camera movement

```text
Static
Push-in
Tracking
Handheld
Crane
```

### Framing

```text
Extreme Wide
Wide
Medium
Medium Close
Close
Extreme Close
```

### Lighting intensity

```text
0–100%
```

### Lighting contrast

```text
Low
Medium
High
```

Keep the control vocabulary intentionally limited for the prototype.

---

# 9. Prompt + Parameters

Professional users should be able to combine natural-language direction with explicit parameters.

Example:

```text
PROMPT

Make this scene feel more tense and cinematic.

CAMERA
50mm
Push-in
Medium

LIGHTING
Neon
72%
High Contrast

[ Generate Variation ]
```

Do not force users into either:

- pure prompting, or
- pure parameter editing.

The combination is central to Prototype 2.

---

# 10. AI Copilot

AI Copilot is **contextual production assistance**, not a general chatbot.

Primary flow:

```text
User instruction
       ↓
AI proposal
       ↓
Review changes
       ↓
Apply / Undo
```

Example:

```text
AI COPILOT

"Make this scene feel like a tense
1980s sci-fi thriller."

PROPOSED CHANGES

✓ Lighting
✓ Colour palette
✓ Camera movement
✓ Mood

[ Apply Changes ]
[ Undo ]
[ Edit Instruction ]
```

### Important

Do NOT expose fake model reasoning or technical internals.

Good:

```text
✓ Lighting
✓ Camera movement
✓ Colour palette
```

Bad:

```text
Running diffusion step 37/50
Embedding similarity: 0.82
Latent analysis...
```

AI communicates **creative changes**, not fictional internal mechanics.

---

# 11. Generation Feedback

Do **not** use fake percentage progress.

Avoid:

```text
72%
```

unless the value represents real implementation progress.

Instead use stage-based feedback:

```text
GENERATING VARIATION

● Preparing scene
○ Generating visual variation
○ Applying creative direction
○ Preparing preview

[ Cancel ]
```

Possible user-facing stages:

- Preparing scene
- Generating visual variation
- Applying creative direction
- Preparing preview

These are UX states, not claims about actual model internals.

---

# 12. Timeline

Prototype 2 uses a simplified professional **multi-track timeline**.

Use four tracks:

```text
VIDEO
DIALOGUE
AUDIO
EFFECTS
```

Example:

```text
VIDEO
━━━━ Scene 01 ━━━━ Scene 02 ━━━━ Scene 03 ━━━━

DIALOGUE
             ━━━━━ Dialogue ━━━━━

AUDIO
━━━━━━ Music ━━━━━━━━━━━━━━━━━━━━━━━━━━━

EFFECTS
                   ━━━ Effect ━━━
```

The timeline should support enough interaction to demonstrate professional editing, but it is **not intended to become a complete Premiere/DaVinci replacement**.

---

# 13. AI-Aware Timeline

Timeline elements should communicate origin.

Use:

```text
✨ AI Generated
✎ Human Edited
↻ AI Variation
```

This reinforces:

> AI participates in production while the human remains in control.

---

# 14. Timeline Interactions

Support where practical:

- selecting clips
- moving clips
- resizing duration
- selecting clips for Inspector editing
- AI generation actions
- variation creation
- playback positioning
- undo

Do not overbuild the timeline.

The evaluator needs to see the **professional workflow concept**, not a complete NLE.

---

# 15. Variations

Variations are retained rather than silently replacing the original.

Example:

```text
SCENE 04

Original
Variation 01
Variation 02
Variation 03

[ Compare ]
[ Use Variation ]
[ Generate Another ]
```

The original must remain recoverable.

---

# 16. Compare

Provide a simple side-by-side comparison when appropriate:

```text
┌─────────────────────┬─────────────────────┐
│ ORIGINAL            │ VARIATION 02        │
│                     │                     │
│                     │                     │
└─────────────────────┴─────────────────────┘

[ Keep Original ]     [ Use Variation ]
```

This is an important part of professional AI iteration.

---

# 17. Undo

Use a **multi-step lightweight undo history** for meaningful changes.

At minimum cover:

- Inspector changes
- AI-generated changes
- Copilot proposals
- variation selection/replacement
- timeline movement

A full production-grade history system is unnecessary.

The UX requirement is:

> AI experimentation must feel reversible.

---

# 18. Contextual AI Actions

Actions should depend on what the user selected.

### Scene

```text
Generate Variation
Extend Shot
Rewrite Prompt
Enhance Cinematic Look
Match Previous Scene
```

### Timeline clip

```text
Generate Alternative
Extend
Shorten
Create Transition
Match Adjacent Shot
```

### Character

```text
Generate Pose
Change Expression
Improve Consistency
Create Variation
```

### Marketing-oriented scene

```text
Generate Alternate Hook
Create Shorter Version
Adapt for Social
Create CTA Variation
Generate 3 Variations
```

The AI should feel **context-aware**.

---

# 19. Marketer Support

Prototype 2 includes marketers as a first-class audience.

A marketing project may look like:

```text
Scene 01 — Hook
Scene 02 — Product
Scene 03 — Benefit
Scene 04 — CTA
```

Relevant AI actions include:

- alternate hook
- stronger CTA
- shorter version
- social adaptation
- multiple variations
- aspect-ratio adaptation

Do not create a separate "Marketing Mode."

Both filmmaker and marketer workflows use the same professional workspace.

---

# 20. Filmmaker Support

A filmmaker-oriented scene can expose:

```text
CAMERA
50mm
Slow Push-in
Medium

LIGHTING
Neon
72%
High Contrast

CHARACTER
Detective
Walking

MOOD
Tense

STYLE
Neo-noir
```

Relevant AI actions:

- Generate Variation
- Match Previous Scene
- Extend Shot
- Enhance Cinematic Look

---

# 21. Visual Direction

Prototype 2 is:

> **Dark neutral + professional + cinematic + restrained.**

It should feel like:

> **Figma + professional video editor + AI studio**

It should NOT feel like:

- cyberpunk
- neon sci-fi dashboard
- consumer AI toy
- chatbot
- ML research interface

Cyberpunk belongs to Prototype 3.

---

# 22. Colour Palette

Use this baseline palette:

```text
Background       #0B0D10
Primary Surface  #11151A
Secondary        #151A20
Elevated         #1A2027

Border           #29313A

Primary Text     #F2F4F7
Secondary Text   #B4BDC8
Muted Text       #7F8995

Accent           #5B8DEF

Success          #4FB286
Warning          #D9A441
Error            #D76565
```

The blue accent should be restrained.

Do not use neon cyan/purple/pink treatments from Prototype 3.

---

# 23. Typography

Use:

**Inter**

Suggested hierarchy:

```text
Project title       20–24px / 600
Section heading     13–14px / 600
Body                13–14px / 400–500
Metadata            11–12px
Timeline labels     11–12px
Large values        16–20px / 500–600
```

The UI should feel dense and professional without becoming difficult to scan.

---

# 24. Surfaces / Borders

Use subtle 1px borders:

```text
#29313A
```

Prefer:

- surface separation
- spacing
- subtle borders

Avoid:

- excessive shadows
- glowing borders
- glassmorphism
- decorative gradients

---

# 25. Motion

Motion has two roles:

### Cinematic

For:

- preview transitions
- generated-result reveals
- comparison
- scene changes

### Interactive

For:

- Inspector updates
- timeline movement
- selection
- AI generation
- panel transitions
- proposal application

Motion should communicate state rather than exist purely as decoration.

---

# 26. Animation Implementation

Keep animation dependency-free.

Use:

- CSS transitions
- Vue `<Transition>`
- Vue `<TransitionGroup>`
- Web Animations API when appropriate

Do NOT add GSAP for Prototype 2.

Suggested timing:

```text
Micro interaction       120–180ms
Panel transition        180–260ms
Cinematic reveal        300–500ms
Large preview change    400–700ms
```

---

# 27. Responsive Behavior

## ≥1440px

Full professional workspace:

- left navigation
- preview
- persistent Inspector
- timeline
- AI action area

## 768–1439px

Tablet/adaptive:

- collapsible left navigation
- Inspector becomes collapsible/tabbed
- timeline remains but can be reduced
- preview remains primary

## <768px

Do NOT force the desktop editor onto mobile.

Provide:

- video viewer
- playback
- scene selection
- light Inspector
- basic AI actions
- variation review
- basic timeline inspection

Reduce/hide:

- full multi-track editing
- simultaneous panels
- dense Inspector
- complex timeline operations

Prototype 2 remains desktop-first.

---

# 28. Data Model Extensions

Extend the existing shared model **additively**.

Do not break Prototype 1.

### Scene

Add/maintain:

```text
lens
movement
lightingIntensity
lightingContrast
origin
```

Origin:

```text
ai-generated
human-edited
ai-variation
```

### Project

Add:

```text
tracks[]
variations[]
aspectRatio
```

### New concepts

```text
Variation
CopilotProposal
```

Use the existing shared architecture where possible.

Do not duplicate shared systems unnecessarily.

---

# 29. Mock AI

The prototype can use mock AI behavior.

However, interactions should feel coherent.

Example:

```text
Prompt
  ↓
Proposal
  ↓
Apply
  ↓
Inspector changes
  ↓
Preview changes
  ↓
Variation created
  ↓
Timeline origin updates
```

Avoid static "AI magic" buttons that do not produce meaningful UI state changes.

---

# 30. Core Interaction Loop

The primary Prototype 2 interaction loop is:

```text
SELECT
  ↓
INSPECT
  ↓
DIRECT
  ↓
GENERATE
  ↓
COMPARE
  ↓
REFINE
  ↓
ACCEPT / UNDO
  ↓
CONTINUE
```

This should be evident in the prototype.

---

# 31. Design Principles

### 1. Professional users are not beginners

Do not explain basic production concepts unnecessarily.

### 2. Complexity is allowed when it provides control

Do not hide professional controls merely to make the UI look simple.

### 3. AI assists; humans direct

AI suggestions require user approval where appropriate.

### 4. Every AI action should be understandable

The user should know what changed or is about to change.

### 5. Experimentation must be reversible

Use variations and undo.

### 6. Context matters

AI actions should depend on the selected scene/object.

### 7. Do not fake AI intelligence

Never expose fabricated model reasoning or fake progress.

### 8. Do not build a full NLE

Communicate the concept with a focused prototype.

### 9. Visual hierarchy matters

Preview > production controls > secondary metadata.

### 10. Prototype 2 must remain distinct from Prototype 3

No cyberpunk visual language.

---

# 32. Implementation Priority

If implementation time is limited, prioritize in this order:

## P0 — Must communicate the concept

1. Professional desktop workspace
2. Video preview
3. Persistent Inspector
4. Timeline
5. Prompt + parameters
6. AI generation state
7. Variation workflow
8. Apply / Undo
9. Professional visual language

## P1 — Important

10. AI Copilot proposal
11. Compare mode
12. Contextual AI actions
13. Marketer actions
14. Responsive tablet layout
15. AI-aware timeline origin states

## P2 — Polish

16. Cinematic transitions
17. Advanced responsive behavior
18. Additional Inspector controls
19. More variation states
20. Micro-interactions

Do not sacrifice P0 to implement P2.

---

# 33. Agent Guardrails

Before implementing a feature, ask:

> Does this make Prototype 2 better at **accelerating professional video production**?

If yes, consider it.

If it instead makes the product:

- more beginner-oriented
- more wizard-like
- more chatbot-like
- more cyberpunk
- more like a generic NLE
- more technically complicated without UX value

do not add it.

---

# 34. Definition of Done

Prototype 2 is successful when a reviewer can immediately distinguish it from Prototype 1.

The reviewer should see:

> **Prototype 1:** AI makes video creation easy.

and:

> **Prototype 2:** AI makes professional video production faster.

The prototype should communicate:

**Professional control + AI acceleration + reversible experimentation.**

That is the complete implementation target.