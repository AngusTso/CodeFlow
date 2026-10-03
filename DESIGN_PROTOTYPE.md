# Prototype 2 — Code Flow Pro

## Professional AI Video Production Workspace

---

## 0. Document Purpose

This document defines the product, UX, interaction, visual, and responsive design direction for **Prototype 2 — Code Flow Pro**.

Prototype 2 is the second of three frontend prototypes for the Esong Intelligence AI video platform take-home assignment.

The three prototypes are intentionally designed around different user needs and different relationships between the creator and AI:

| Prototype                                    | Target User                                                                      | Core Need                                  | AI Philosophy            |
| -------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------ |
| **Prototype 1 — Code Flow**                  | Casual creator                                                                   | Make a video easily                        | AI removes complexity    |
| **Prototype 2 — Code Flow Pro**              | Professional creator, filmmaker, marketer                                        | Produce and iterate professionally, faster | AI accelerates expertise |
| **Prototype 3 — Experimental / Exploratory** | Creative innovator, experimental filmmaker, indie creator, game/concept designer | Discover what an idea could look like      | AI enables exploration   |

Prototype 2 must therefore be clearly different from Prototype 1 while remaining part of the same underlying AI video platform.

---

# 1. Product Definition

## 1.1 What is Code Flow Pro?

**Code Flow Pro** is a professional AI-assisted video production workspace for users who already understand video creation and want AI to accelerate their workflow.

It is designed for people who understand concepts such as:

- scenes
- shots
- camera
- lighting
- characters
- composition
- timeline
- audio
- visual style
- editing
- variations
- campaign content
- aspect ratios
- creative direction

The product does **not** attempt to hide these concepts.

Instead, it makes them easier and faster to manipulate while allowing AI to assist with interpretation, generation, refinement, and iteration.

### Core product statement

> **AI accelerates creative decisions without taking creative control away from the creator.**

This is the defining philosophy of Prototype 2.

---

# 2. Relationship to Prototype 1

Prototype 1 and Prototype 2 should feel like two deliberately different experiences built on the same AI video platform.

## Prototype 1 — Code Flow

Prototype 1 is designed for a casual creator who may have an idea but does not necessarily understand professional video production.

Its philosophy is:

> **AI should remove complexity rather than expose it.**

The user is guided through a simple process.

```text
Idea
  ↓
AI guidance
  ↓
Simple choices
  ↓
Storyboard
  ↓
Video
```

The interface uses:

- mobile-first design
- cards
- wizard-like progression
- progressive disclosure
- simple parameter choices
- approachable language
- AI-driven automation

For example, the user can simply describe an idea and receive an AI-generated storyboard rather than needing to understand how to construct a production workflow.

The Prototype 1 implementation explicitly uses this approach: the user is told that one or two sentences are enough and that AI will turn the idea into scenes that can be changed later. Suggestion chips also reduce the difficulty of deciding what to type.

---

## Prototype 2 — Code Flow Pro

Prototype 2 reverses the relationship.

The professional user already understands what they are doing.

Therefore:

```text
Intent
  ↓
Professional direction
  ↓
AI assistance
  ↓
Human refinement
  ↓
Professional output
```

The interface exposes useful controls rather than hiding them.

### Core contrast

|                 | Prototype 1                 | Prototype 2                                  |
| --------------- | --------------------------- | -------------------------------------------- |
| User            | Casual creator              | Professional creator                         |
| Primary users   | Beginners / casual users    | Filmmakers / creators / marketers            |
| Philosophy      | Hide unnecessary complexity | Expose useful control                        |
| Workflow        | Guided                      | Flexible                                     |
| UI              | Simple                      | Information-dense                            |
| AI              | Assistant                   | Creative copilot                             |
| Control         | Progressive                 | Direct                                       |
| Device          | Mobile-first                | Desktop-first                                |
| Primary feeling | "AI makes this easy."       | "I know what I'm doing; AI makes me faster." |

This contrast is intentional and should remain obvious throughout implementation.

---

# 3. Target Audience

## 3.1 Primary Audience

Prototype 2 intentionally combines two professional audiences:

### A. Professional filmmakers / video creators

Examples:

- independent filmmakers
- video creators
- creative producers
- professional editors
- content creators
- production-oriented creators

Their needs include:

- scene control
- camera control
- character consistency
- lighting
- visual direction
- shot refinement
- timeline editing
- variations
- professional output

### B. Professional marketers / marketing-oriented creators

Examples:

- social media marketers
- content marketers
- advertising creators
- small marketing teams
- brand/content teams

Their needs include:

- campaign content
- short-form video
- fast iteration
- messaging
- multiple versions
- aspect-ratio adaptation
- brand consistency
- rapid content production

---

## 3.2 Why combine both audiences?

The common problem is not that both audiences make identical videos.

The common problem is:

> **They already understand what they want to create and need the system to help them produce and iterate faster.**

Therefore Prototype 2 is not a pure filmmaking application and not a pure marketing generator.

It is a:

> **Professional AI video production workspace.**

The underlying interaction model remains useful to both groups.

A filmmaker may emphasize:

```text
Scene
Camera
Lens
Lighting
Character
Motion
Timeline
Continuity
```

while a marketer may emphasize:

```text
Message
Hook
CTA
Brand style
Duration
Aspect ratio
Platform
Variations
```

The same workspace can support both without becoming a generic "everything app."

---

# 4. User Mental Model

The professional user should feel:

> "This is my production workspace."

Not:

> "This is a chatbot that makes videos for me."

The product should communicate that the human remains the creative director.

AI is powerful, but it operates **inside the creator's workflow**.

### Human role

The human provides:

- intent
- direction
- taste
- judgment
- constraints
- approval

### AI role

AI provides:

- interpretation
- generation
- transformation
- variation
- acceleration
- suggestions
- repetitive creative assistance

### Core relationship

```text
Human
  │
  │ direction
  ↓
AI
  │
  │ generation / interpretation
  ↓
Result
  │
  │ inspect / refine
  ↓
Human
```

This creates a collaborative loop instead of an automation pipeline.

---

# 5. Core UX Philosophy

## 5.1 AI accelerates expertise

The central principle is:

> **AI accelerates creative decisions without taking creative control away from the creator.**

The user should always feel capable of understanding and modifying what AI is doing.

---

## 5.2 Expose useful complexity

Prototype 2 should not hide professional concepts simply because they are complex.

However:

> **Professional does not mean unnecessarily complicated.**

Only controls that provide meaningful creative or production value should be exposed.

The goal is:

> **Expose useful control, not complexity for its own sake.**

---

## 5.3 Human remains in control

AI suggestions should be:

- inspectable
- editable
- reversible
- dismissible

AI should not silently make major creative changes.

When AI changes multiple properties, the interface should communicate what changed.

Example:

```text
AI changed:

✓ Lighting
✓ Color palette
✓ Camera movement
✓ Environment

[Apply] [Undo]
```

This makes the AI's role transparent.

---

## 5.4 AI should be contextual

AI should appear where the user is already working.

Instead of having one isolated:

> "AI" button

the product should provide AI actions relevant to the selected object, scene, timeline segment, or workflow stage.

Examples:

```text
Selected Scene

Generate variation
Extend shot
Change camera
Enhance cinematic look
Rewrite prompt
Match previous scene
```

The AI should feel like part of the editor rather than a separate product.

---

# 6. Primary Experience: AI-Assisted Professional Workflow

The core workflow is:

```text
Project
   ↓
Storyboard / scenes
   ↓
Select scene
   ↓
Inspect / direct
   ↓
AI generation or modification
   ↓
Review result
   ↓
Refine
   ↓
Timeline arrangement
   ↓
Generate variations
   ↓
Final output
```

This is intentionally more flexible than Prototype 1's wizard.

The user can move between stages rather than being forced through a fixed sequence.

---

# 7. Device Strategy

## 7.1 Desktop-first

Prototype 2 is **desktop-first**.

Professional video creation benefits from:

- large preview canvas
- multi-track timeline
- properties/Inspector panel
- asset browser
- multiple simultaneous panels
- precise controls
- keyboard interaction
- high information density

The desktop experience is therefore the primary representation of the product.

---

## 7.2 Tablet-second

Tablet is an adaptive experience.

The full desktop layout should not simply be compressed.

Panels can collapse or become tabbed.

Example:

```text
┌───────────────────────────────┐
│          Preview              │
├───────────────────────────────┤
│                               │
│      Inspector / Assets       │
│       [Tabs / Toggle]         │
│                               │
├───────────────────────────────┤
│          Timeline             │
└───────────────────────────────┘
```

---

## 7.3 Mobile

Mobile is not the primary professional editing experience.

The mobile version should support:

- viewing
- light editing
- scene inspection
- simple AI actions
- basic timeline interaction

Complex panels can become:

- drawers
- modals
- sheets
- tabs

We explicitly do **not** force the complete desktop professional editor into a 320px screen.

This is a deliberate design decision rather than a failure of responsiveness.

---

# 8. Core Layout

Prototype 2 uses an **AI-assisted professional workspace / hybrid studio** mental model rather than a traditional editor clone.

The general structure is:

```text
┌───────────────────────────────────────────────────────────────┐
│ Project / Workspace              AI Copilot        Export     │
├──────────────┬───────────────────────────────┬───────────────┤
│              │                               │               │
│   PROJECT    │                               │   INSPECTOR   │
│              │                               │               │
│ Scenes       │                               │ Scene         │
│ Assets       │          VIDEO PREVIEW        │ Camera        │
│ Characters   │                               │ Lighting      │
│ Storyboard   │                               │ Character     │
│              │                               │ Style         │
│              │                               │ AI actions    │
├──────────────┴───────────────────────────────┴───────────────┤
│                                                               │
│                    MULTI-TRACK TIMELINE                       │
│                                                               │
│ Video    ━━━━━━━━ Scene 01 ━━━━━ Scene 02 ━━━━━             │
│ Audio    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━             │
│ Character       ━━━━━━━ Character ━━━━━━━━━━━                │
│ AI               ✨ Variation       ✨ Generated              │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│ AI action / prompt / contextual generation controls          │
└───────────────────────────────────────────────────────────────┘
```

This is a conceptual structure rather than a pixel-perfect wireframe.

The most important principle is that the workspace keeps the creator's major production tools visible and connected.

---

# 9. Contextual Workspace Navigation

Prototype 1 uses simpler application-level navigation.

Prototype 2 should instead treat the **project itself as the workspace**.

Conceptually:

```text
Project
│
├── Storyboard
├── Scenes
├── Characters
├── Assets
└── Timeline
```

The user should not repeatedly leave the project to perform related production tasks.

Everything relevant should remain available within the working context.

### Principle

> **Everything relevant stays inside one workspace.**

This reduces unnecessary navigation and preserves the user's creative context.

---

# 10. Persistent Inspector

The Inspector is one of the most important differentiators from Prototype 1.

Prototype 1 uses simpler, temporary editing surfaces.

Prototype 2 uses a **persistent Inspector**.

Example:

```text
SCENE 02
────────────────────

Duration
06.0s

CAMERA
────────────────────
Lens       35mm
Angle      Low
Movement   Tracking

LIGHTING
────────────────────
Type       Neon
Intensity  70%
Contrast   High

MOOD
────────────────────
Noir

AI
────────────────────
✨ Enhance cinematic look
✨ Generate variation

[ Generate ]
```

The Inspector communicates:

> **"I have direct control over my production."**

---

## 10.1 Inspector principles

The Inspector should:

- reflect the selected object
- remain available while editing
- expose relevant professional properties
- group related properties
- provide contextual AI actions
- preserve the user's mental model
- avoid forcing navigation to separate screens

---

# 11. AI Interaction Model

Prototype 2 deliberately uses **two complementary AI interaction modes**:

### C — Prompt + Parameters

and

### D — AI Copilot

Together:

> **Direct manipulation + AI copilot**

This is a central design decision.

---

## 11.1 Prompt + Parameters

Users can directly control professional parameters while also providing natural-language direction.

Example:

```text
PROMPT

Detective walks through the rain...

CAMERA
[35mm] [Wide] [Tracking]

LIGHTING
[Neon] [High Contrast]

MOOD
[Noir]

[ Generate Variation ]
```

The underlying principle is:

> **AI handles interpretation; the human retains direction.**

The professional creator does not need to choose between structured controls and natural language.

They can use both.

---

## 11.2 AI Copilot

The user can also give higher-level instructions.

Example:

> "Make this feel more like a 1980s sci-fi movie."

The AI may propose changes to:

- lighting
- color palette
- camera movement
- environment
- visual style

The system should show what the AI changed.

```text
AI CHANGES

✓ Lighting
✓ Color palette
✓ Camera movement
✓ Environment

[ Apply ]    [ Undo ]
```

This makes AI assistance powerful without making it opaque.

---

# 12. AI-Aware Timeline

The timeline is one of the most important places where Prototype 2 should demonstrate that this is an **AI-native video platform**, rather than a conventional video editor with an AI button.

---

## 12.1 Multi-track timeline

The timeline should support multiple conceptual tracks.

Example:

```text
VIDEO
Scene 01 ━━━━━ Scene 02 ━━━━━ Scene 03

CHARACTER
          ━━━━━ Character ━━━━━

AUDIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EFFECTS
                 ━━━━━━━
```

The exact number of tracks can remain simplified for the prototype.

The purpose is to communicate professional timeline control.

---

## 12.2 AI-aware state

The timeline should also communicate the origin/state of content.

Example:

```text
Scene 01
   ↓
AI Generated

Scene 02
   ↓
Human Edited

Scene 03
   ↓
AI Variation
```

Potential visual indicators:

```text
✨ AI Generated
✎ Human Edited
↻ AI Variation
```

This directly demonstrates how AI participates in the creative workflow.

The timeline therefore answers:

> **"How does AI support professional creative work?"**

rather than merely showing an AI button.

---

# 13. Professional Video Editing / Filmmaking Key Stages

The interface should focus on actual professional production decisions.

Important stages include:

### 13.1 Scene construction

- scene selection
- duration
- shot composition
- visual content

### 13.2 Camera direction

- lens
- framing
- angle
- movement

### 13.3 Lighting

- lighting type
- intensity
- contrast
- color/temperature

### 13.4 Character / subject direction

- character
- pose
- placement
- consistency

### 13.5 Style / mood

- visual style
- tone
- mood
- color direction

### 13.6 Timeline / sequencing

- scene order
- duration
- transitions
- audio
- effects
- variations

### 13.7 AI refinement

- regenerate
- vary
- extend
- rewrite
- enhance
- transform

The product should feel like it supports the **actual creative stages** rather than presenting generic AI features.

---

# 14. AI Generation Feedback

Prototype 1 uses a more magical, approachable AI presentation.

Prototype 2 should communicate generation more professionally.

Instead of:

> ✨ AI is doing its magic...

Prototype 2 can show:

```text
GENERATING VARIATION

Scene 02

████████████░░░░ 72%

Analyzing composition
Applying lighting
Generating variation
```

However, the interface should **not** become an ML engineering dashboard.

Avoid exposing irrelevant implementation details such as:

```text
Diffusion steps
Embedding generation
Transformer inference
GPU utilization
```

The progress should describe **creative work**, not internal model mechanics.

Good:

```text
Generating variation
72%

Camera + Lighting + Composition
```

---

# 15. Visual Design Direction

Prototype 2 uses:

## Professional Creative Studio

It should be:

- professional
- dark/neutral
- cinematic
- information-dense
- visually refined
- focused
- high contrast
- controlled

It should **not** be:

- generic corporate SaaS
- excessive glassmorphism
- cyberpunk
- playful
- overly decorative

The desired mental reference is approximately:

> **Figma + professional video editor + AI studio**

Conceptually:

```text
Dark neutral canvas
        +
High contrast
        +
Subtle accent color
        +
Thin borders
        +
Large preview
        +
Dense but clean controls
```

This creates the distinction:

```text
Prototype 1
Friendly product

        ↓

Prototype 2
Serious creative tool

        ↓

Prototype 3
Experimental creative playground
```

---

# 16. Visual Hierarchy

The main hierarchy should be:

### 1. Video preview

The content being created is the most important object.

### 2. Current production context

Selected scene / shot / timeline segment.

### 3. Inspector

The creator's direct control surface.

### 4. Timeline

The broader production structure.

### 5. AI tools

AI should be prominent enough to be useful but should not visually dominate the product.

The product should never feel like:

> "AI chatbot with a video attached."

It should feel like:

> "Professional video workspace with deeply integrated AI."

---

# 17. Animation and Motion

Prototype 2 can use more expressive motion than Prototype 1.

Prototype 1 uses:

> **Subtle + functional**

Prototype 2 uses:

> **Cinematic + interactive**

The selected direction is:

### B — Cinematic

plus

### C — Interactive

---

## 17.1 Cinematic motion

Useful examples:

- preview transitions
- scene transitions
- generated-result reveals
- subtle zoom
- fade
- smooth state changes

---

## 17.2 Interactive motion

The interface should visually communicate the consequence of an action.

Example:

```text
Camera
Wide → Close

        ↓

Preview smoothly changes
```

Timeline:

```text
Drag scene
     ↓
Smooth timeline movement
```

AI:

```text
Generate
   ↓
Existing scene transforms
   ↓
New variation appears
```

---

## 17.3 Motion principle

> **Animation must communicate state or change, not decoration.**

Motion should help users understand:

- what changed
- what is being generated
- what is selected
- what moved
- what was accepted
- what was rejected

It should not exist merely because animation looks impressive.

---

# 18. Professional UX Principles

## Principle 1 — Respect existing expertise

Do not treat professional users like beginners.

Avoid unnecessary onboarding and wizard restrictions.

---

## Principle 2 — Preserve creative agency

AI proposes and accelerates.

The human decides.

---

## Principle 3 — Direct manipulation

Whenever practical, users should be able to manipulate important production properties directly.

---

## Principle 4 — Context over navigation

Keep relevant tools in the current workspace.

Avoid making the user jump through multiple screens for related actions.

---

## Principle 5 — Progressive complexity without hiding expertise

The system can keep secondary controls visually organized, but professional controls should remain accessible.

---

## Principle 6 — AI transparency

When AI makes changes, show what changed.

---

## Principle 7 — Reversibility

AI actions should feel safe.

Use:

- Undo
- Cancel
- Apply
- Regenerate
- Variations

---

## Principle 8 — Meaningful density

Information density is acceptable because the target user is professional.

However, density must be structured through:

- grouping
- hierarchy
- spacing
- labels
- visual consistency

---

## Principle 9 — Production context

AI actions should operate on actual production objects:

- scene
- shot
- character
- timeline segment
- asset
- style

rather than existing as disconnected generic AI functions.

---

## Principle 10 — Do not imitate legacy editors unnecessarily

Prototype 2 should borrow useful professional interaction patterns without becoming a clone of Premiere Pro or another traditional editor.

The goal is an:

> **AI-native professional video workflow.**

---

# 19. Marketer vs Filmmaker Within the Same Product

The product should not create two separate applications.

Instead, the same workspace should support different priorities.

### Filmmaker-oriented workflow

```text
Scene
 ↓
Camera
 ↓
Lighting
 ↓
Character
 ↓
Composition
 ↓
Timeline
 ↓
Refinement
```

### Marketer-oriented workflow

```text
Campaign
 ↓
Message
 ↓
Hook
 ↓
Brand style
 ↓
Format
 ↓
Variation
 ↓
Distribution
```

Both eventually interact with:

```text
AI
 ↓
Generate
 ↓
Review
 ↓
Refine
 ↓
Export
```

This allows Prototype 2 to remain one coherent product.

---

# 20. Example Professional User Journey

A representative user journey might look like:

### Step 1 — Open project

The user enters an existing video project rather than a beginner wizard.

### Step 2 — Select scene

The user selects Scene 02 from the project/timeline.

### Step 3 — Inspect

The persistent Inspector shows:

- duration
- camera
- lighting
- mood
- character
- style

### Step 4 — Direct AI

The user writes:

> "Make the shot feel more tense and cinematic."

They also manually set:

```text
Camera: 50mm
Movement: Slow push-in
Lighting: High contrast
```

### Step 5 — Generate

The system generates a variation.

The UI communicates:

```text
Generating variation
Camera + Lighting + Composition
72%
```

### Step 6 — Review

The new result appears with a cinematic reveal.

### Step 7 — Compare / apply

The user can:

- accept
- undo
- regenerate
- create another variation

### Step 8 — Timeline

The generated variation becomes a timeline item marked:

> ✨ AI Variation

### Step 9 — Human refinement

The user manually changes timing or arrangement.

The timeline can communicate:

> ✎ Human Edited

### Step 10 — Continue production

The user selects another scene and repeats the process.

This is the core loop:

```text
Direct
→ Generate
→ Inspect
→ Refine
→ Direct again
```

---

# 21. Prototype 2 UX Success Criteria

Prototype 2 should feel successful if a user can understand within a short interaction that:

### A. This is for professionals

The UI should immediately communicate:

> "This tool expects me to understand video creation."

### B. AI is deeply integrated

The AI should not feel bolted on.

### C. I retain control

The user should be able to inspect and modify AI-assisted results.

### D. I can iterate quickly

Generating variations should be fast conceptually, even though the actual AI is mocked.

### E. The workspace is coherent

The user should not need to mentally reconstruct where scenes, assets, AI results, and timeline elements belong.

### F. The product is clearly different from Prototype 1

A reviewer should be able to look at both and immediately understand:

```text
Prototype 1:
"Make this easy for me."

Prototype 2:
"Give me professional control and make me faster."
```

---

# 22. What Prototype 2 Should NOT Become

Several failure modes should be actively avoided.

## 22.1 Prototype 1 with a dark theme

Changing colors and adding panels is not enough.

The interaction model must change.

---

## 22.2 Generic AI chatbot

The product should not revolve around:

```text
Chat
Chat
Chat
Generate
```

AI belongs inside the production workflow.

---

## 22.3 Premiere Pro clone

The product should not reproduce every traditional editing feature.

This is an AI video product, not a traditional editing software recreation.

---

## 22.4 ML engineering dashboard

Do not expose model internals that are irrelevant to the creator.

---

## 22.5 Overly complicated professional UI

Professional users need control, not arbitrary complexity.

---

## 22.6 AI taking over creative direction

The user should never feel that AI is silently making important creative decisions.

---

# 23. Responsive Design Summary

| Device  |      Priority | Experience                                        |
| ------- | ------------: | ------------------------------------------------- |
| Desktop |   **Primary** | Full professional workspace                       |
| Tablet  | **Secondary** | Adaptive workspace with collapsible/tabbed panels |
| Mobile  |      Tertiary | Viewer + light editing + contextual AI actions    |

Desktop should receive the greatest design and implementation attention.

---

# 24. Prototype 1 vs Prototype 2 vs Prototype 3

The overall platform should eventually communicate three different philosophies.

## Prototype 1 — Code Flow

### "Help me make a video."

```text
Idea
 ↓
AI
 ↓
Guided choices
 ↓
Video
```

**Complexity is hidden.**

---

## Prototype 2 — Code Flow Pro

### "Help me make my professional video faster."

```text
Intent
 ↓
Professional direction
 ↓
AI assistance
 ↓
Human refinement
 ↓
Professional video
```

**Useful complexity is exposed.**

---

## Prototype 3 — Experimental

### "Help me discover what my idea could look like."

```text
Idea
 ↓
Experiment
 ↓
Generate possibilities
 ↓
Explore variations
 ↓
Discover direction
```

**Uncertainty becomes part of the creative process.**

Prototype 3 can therefore adopt a much more distinctive retro/cyberpunk visual language without weakening Prototype 2's professional identity.

---

# 25. Design Differentiation Matrix

| Dimension              | Prototype 1           | Prototype 2                                 | Prototype 3                   |
| ---------------------- | --------------------- | ------------------------------------------- | ----------------------------- |
| Audience               | Casual creator        | Professional creator / filmmaker / marketer | Creative explorer / innovator |
| User expertise         | Low / mixed           | High                                        | Mixed / experimental          |
| Goal                   | Create finished video | Produce professional video efficiently      | Discover possibilities        |
| AI role                | Assistant             | Copilot                                     | Experiment partner            |
| Complexity             | Hidden                | Exposed selectively                         | Fluid                         |
| Control                | Guided                | Direct                                      | Exploratory                   |
| Workflow               | Wizard                | Workspace                                   | Experimental                  |
| Layout                 | Card/wizard           | Professional studio                         | Experimental interface        |
| Device                 | Mobile-first          | Desktop-first                               | To be determined              |
| Visual language        | Friendly/minimal      | Professional/cinematic                      | Retro/cyberpunk               |
| Main emotional feeling | "This is easy."       | "I have control."                           | "What can I create?"          |

---

# 26. Design Rationale Summary

The Prototype 2 design is based on one central observation:

> A professional creator does not need AI to explain video creation to them. They need AI to remove repetitive work, accelerate iteration, and help execute creative decisions.

Therefore the interface changes from Prototype 1's guided, simplified workflow to a professional workspace.

The user receives:

- persistent production context
- direct controls
- professional parameters
- multi-track timeline
- AI-aware timeline states
- contextual AI actions
- prompt + parameter control
- AI Copilot
- transparent generation feedback
- cinematic and interactive transitions

The result is intended to communicate:

> **AI is powerful, but the creator remains the director.**

---

# 27. Final Locked Decisions

The following decisions are considered **locked for Prototype 2**.

| Decision                | Final Direction                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Target audience**     | Professional filmmakers / video creators + professional marketers                       |
| **Device priority**     | Desktop-first, tablet-second                                                            |
| **Core layout**         | AI-assisted professional workspace / hybrid studio                                      |
| **AI interaction**      | Prompt + Parameters + AI Copilot                                                        |
| **Navigation**          | Contextual workspace                                                                    |
| **Timeline**            | Multi-track + AI-aware                                                                  |
| **Scene editing**       | Persistent Inspector                                                                    |
| **Professional focus**  | Actual video editing / filmmaking production stages                                     |
| **Visual style**        | Professional Creative Studio                                                            |
| **Animation**           | Cinematic + Interactive                                                                 |
| **Responsive strategy** | Desktop primary, tablet adaptive, mobile light editing                                  |
| **Core philosophy**     | AI accelerates creative decisions without taking creative control away from the creator |

---

# 28. One-Sentence Product Definition

> **Code Flow Pro is a professional AI video production workspace where filmmakers, creators, and marketers retain creative control while AI accelerates generation, refinement, and iteration across the real production workflow.**

---

# 29. Implementation Boundary

This document defines the **design intent and UX direction**.

It does not require implementation of a real AI backend.

AI functionality may be mocked for the prototype.

The implementation should prioritize demonstrating the **experience of AI-assisted professional video creation**, particularly:

1. professional workspace structure
2. persistent Inspector
3. prompt + parameter control
4. AI Copilot
5. AI-aware timeline
6. professional generation feedback
7. cinematic/interactive state changes
8. clear distinction from Prototype 1
9. responsive desktop/tablet behavior
10. polished visual hierarchy

The prototype should demonstrate the concept convincingly rather than attempt to reproduce the full functionality of production video-editing software.
