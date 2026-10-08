# Prototype 3 — Creative Signal

## Experimental AI Video Exploration Workspace

---

# 0. Document Purpose

This document defines the **product concept, UX, interaction model, visual language, responsive behavior, accessibility requirements, mock AI behavior, and implementation constraints** for **Prototype 3 — Creative Signal**.

Prototype 3 is the third of three frontend prototypes for the Esong Intelligence AI video platform take-home assignment.

The three prototypes intentionally represent different creator relationships with AI:

| Prototype | Target user | Core need | AI philosophy |
|---|---|---|---|
| **Prototype 1 — Code Flow** | Casual creator | Make a video easily | AI removes complexity |
| **Prototype 2 — Code Flow Pro** | Professional creator / filmmaker / marketer | Produce and iterate faster | AI accelerates expertise |
| **Prototype 3 — Creative Signal** | Creative explorer / experimental filmmaker / indie creator / concept designer | Discover what an idea could become | AI enables exploration |

Prototype 3 should **not** feel like Prototype 1 or Prototype 2 with a different color palette.

Its core interaction model is intentionally different:

> **Do not start by asking the user to define the final video. Start by helping them discover possibilities.**

The product should feel closer to a combination of:

- creative laboratory
- visual mind map
- experimental game interface
- AI concept explorer
- retro-futurist terminal
- cinematic idea generator

The central experience is:

```text
SIGNAL
  ↓
DISCOVER
  ↓
COMBINE
  ↓
GENERATE
  ↓
EXPLORE
  ↓
BRANCH
  ↓
STABILIZE
  ↓
TURN INTO VIDEO
```

The user should feel that they are **exploring a creative possibility space**, rather than filling out a conventional video-production form.

---

# 1. Assignment Requirements This Prototype Must Address

The original task brief identifies the following evaluation criteria:

- Creativity & Variety
- Usability
- Responsiveness
- Technical Execution
- AI Workflow Integration
- Accessibility & Inclusivity
- Documentation

The task also explicitly encourages prototypes to differ through:

- target user persona
- device priority
- AI interaction style
- visual complexity
- animation / transition style
- navigation style

Prototype 3 should deliberately use these differentiation axes rather than simply changing visual styling.

## 1.1 Prototype 3 differentiation

| Axis | Prototype 3 decision |
|---|---|
| Persona | Creative explorer / experimental creator |
| Device priority | **Desktop + tablet first** |
| AI interaction | Voice + visual signals + combination + optional sketch |
| Visual complexity | High visual richness, but simple core interactions |
| Animation | Cinematic, energetic, signal-like transitions |
| Navigation | Retro terminal-inspired command/navigation system |
| Layout | Full-screen visual canvas + overlays + modals |
| Core interaction | Explore and branch ideas like a visual mind map |
| AI role | Creative collaborator that proposes possibilities |
| Main metaphor | Creative laboratory / signal discovery system |

The original task brief requires mobile responsiveness as well. Prototype 3 therefore remains responsive down to small screens, but its primary experience is optimized for desktop and tablet.

---

# 2. Product Definition

## 2.1 Product name

**Creative Signal**

Internal conceptual name:

> `SIGNAL // CREATIVE EXPLORATION SYSTEM`

The product is intentionally framed as an experimental creative instrument rather than a conventional editor.

---

## 2.2 Core product statement

> **You don't tell the AI exactly what to make. You give it signals, and discover what it could become.**

This is the central philosophy of Prototype 3.

The user may begin with:

- a sentence
- a voice thought
- an image
- a rough sketch
- a visual concept
- a mood
- a strange combination of unrelated ideas

The system turns these inputs into visual possibilities.

The user then explores those possibilities and branches them into new directions.

---

# 3. Core User Persona

## 3.1 Primary persona — Creative Explorer

The primary user is someone who has creative ideas but does not always know exactly what the final output should be.

Examples:

- experimental filmmaker
- concept artist
- indie game designer
- creative technologist
- music-video creator
- visual storyteller
- advertising concept creator
- worldbuilder
- designer exploring an idea
- creator looking for unexpected directions

This person does not necessarily want:

> "Generate exactly this video."

They may instead want:

> "I wonder what this idea could become."

---

## 3.2 User mindset

The user may start with an incomplete thought:

> "What if a city was alive?"

or:

> "What if a detective lived inside a machine?"

or:

> "I want something futuristic but nostalgic."

The system should not immediately force the user into:

- duration
- camera
- lens
- aspect ratio
- scene parameters
- timeline tracks

Those concepts belong primarily to Prototype 2.

Prototype 3 should first help the user **discover the concept**.

---

# 4. Product Philosophy

## 4.1 Exploration over execution

Prototype 1 asks:

> "What do you want to make?"

Prototype 2 asks:

> "How do you want to make it?"

Prototype 3 asks:

> **"What could this become?"**

This distinction must be obvious.

---

## 4.2 Combination over prompting

The primary creative action should not always be typing a better prompt.

Users should be able to combine ideas visually.

For example:

```text
[NEON CITY]
      +
[OLD FOREST]
      +
[DETECTIVE]
      ↓
[NEW POSSIBILITY]
```

The AI interprets the combination and generates a new creative direction.

This makes the system feel like a creative tool rather than a normal chatbot.

---

## 4.3 Branching over linear workflow

Prototype 3 should behave like a visual creative mind map.

A concept can branch:

```text
                 [ORIGINAL IDEA]
                       |
            +----------+----------+
            |                     |
       [NOIR CITY]          [LIVING CITY]
            |                     |
       +----+----+           +----+----+
       |         |           |         |
 [DETECTIVE] [CYBER]     [FOREST] [ORGANIC]
```

The user can return to any interesting branch.

The creative history should not disappear simply because another branch was explored.

---

## 4.4 AI as collaborator

The AI should not behave like:

> "Here is exactly what you asked for."

Instead it should sometimes behave like:

> "Interesting. Combining these signals suggests three possible directions."

Example:

```text
NEW POSSIBILITY DETECTED

01 // THE CITY THAT DREAMS
02 // THE CITY THAT HUNTS
03 // THE CITY THAT REMEMBERS

Recommended:
THE CITY THAT REMEMBERS

Reason:
The combination of neon architecture + abandoned forest
creates a strong contrast between technology and memory.
```

The user remains in control.

---

# 5. Core Experience Loop

The complete creative loop is:

```text
1. SIGNAL
   User provides an idea.

2. DISCOVER
   AI generates initial visual possibilities.

3. COMBINE
   User combines signals or branches.

4. GENERATE
   Mock AI creates new visual possibilities.

5. EXPLORE
   User zooms, pans and inspects the creative universe.

6. BRANCH
   User creates alternative directions.

7. STABILIZE
   User chooses a promising possibility.

8. VIDEO
   The possibility becomes a cinematic storyboard.

9. PREVIEW
   User sees a simulated video sequence.
```

The main demo should demonstrate this loop quickly.

---

# 6. Main Navigation

Prototype 3 uses a terminal-inspired navigation system.

The navigation should look like a futuristic operating system rather than a standard SaaS navbar.

Suggested navigation:

```text
> SIGNAL
> UNIVERSE
> LAB
> ARCHIVE
> EXPORT
```

Keyboard shortcuts:

```text
[1] SIGNAL
[2] UNIVERSE
[3] LAB
[4] ARCHIVE
[ESC] BACK
[SPACE] EXPLORE / PAUSE
```

The navigation should remain visually clear and usable.

The terminal aesthetic is a **metaphor**, not a requirement that users type actual terminal commands.

---

# 7. Primary Screens

Prototype 3 should be organized around five conceptual areas:

1. Signal
2. Universe
3. Lab
4. Archive
5. Export

However, the experience should feel like one continuous creative environment rather than five unrelated pages.

---

# 8. SIGNAL — Creative Input

## 8.1 Purpose

Signal is the entry point.

The user provides the initial creative input.

The interface should immediately communicate:

> "You don't need to know exactly what you're making."

---

## 8.2 Visual structure

Desktop:

```text
+------------------------------------------------------+
| SIGNAL // CREATIVE EXPLORATION                      |
|------------------------------------------------------|
|                                                      |
|                 GIVE US A SIGNAL                     |
|                                                      |
|       [ What are you thinking about? ]              |
|                                                      |
|       [ MIC ]  [ DRAW ]  [ IMAGE ]  [ TEXT ]        |
|                                                      |
|       Suggested signals                              |
|       [ neon city ] [ forgotten future ]             |
|       [ living machine ] [ dream sequence ]          |
|                                                      |
|              [ INITIALIZE SIGNAL ]                   |
|                                                      |
+------------------------------------------------------+
```

The screen should have a strong cinematic center.

---

# 9. VOICE SIGNAL

Voice should be one of the most important innovations in Prototype 3.

## 9.1 Concept

Instead of requiring a polished prompt, the user can speak naturally.

Example:

> "What if this city was actually alive, but nobody knew?"

The system displays:

```text
VOICE SIGNAL
------------------------
LISTENING...

"What if this city was
actually alive, but
nobody knew?"
```

After processing:

```text
SIGNAL CAPTURED

CITY
LIFE
SECRECY
NEON
MYSTERY
```

These become creative signals.

---

## 9.2 Mock implementation

A real AI voice backend is not required.

A prototype implementation may simulate:

```text
Click microphone
↓
Listening animation
↓
Mock transcription
↓
Signal extraction
↓
Creative Universe generation
```

If browser speech recognition is available, it may optionally be used.

However:

> The product must remain fully usable if microphone APIs are unavailable.

The mock experience must therefore always have a fallback.

Fallback:

```text
VOICE SIGNAL UNAVAILABLE

[ TYPE SIGNAL INSTEAD ]
```

Do not make the prototype dependent on browser-specific speech APIs.

---

# 10. Voice Interaction Visual Design

When recording:

```text
        ◉

   VOICE SIGNAL ACTIVE

      LISTENING...

   ~ ~ ~ ~ ~ ~ ~ ~
```

Use animated signal waves.

The animation should react visually to the recording state.

States:

### Idle

```text
VOICE SIGNAL
[ TAP TO SPEAK ]
```

### Listening

```text
VOICE SIGNAL ACTIVE
[ LISTENING... ]
```

### Processing

```text
SIGNAL PROCESSING
[ ANALYZING... ]
```

### Complete

```text
SIGNAL CAPTURED
[ ENTER UNIVERSE ]
```

Use motion to communicate state rather than relying on color alone.

---

# 11. DRAW / SKETCH SIGNAL

The user may optionally provide a simple drawing.

The purpose is **not** to build a full drawing application.

It should be a lightweight creative input mechanism.

Example:

User draws:

```text
  /\____
 /      \
|  o  o |
 \__--_/
```

The system interprets it as:

> "A damaged maintenance robot."

The mock AI can transform that into:

```text
INTERPRETED SIGNAL

MAINTENANCE ROBOT
ABANDONED
INDUSTRIAL
NIGHT
LONELY
```

Then generate visual possibilities.

---

## 11.1 Sketch UI

Provide:

- small drawing canvas
- pen
- eraser
- clear
- undo
- submit

Avoid implementing advanced drawing features.

The sketch is a **signal**, not artwork.

---

# 12. IMAGE SIGNAL

The user may select an image placeholder or existing visual reference.

For the prototype:

- local mock image cards are acceptable
- static example images may be used
- the system does not need real image understanding

The important UX is:

```text
IMAGE
  ↓
SIGNAL EXTRACTION
  ↓
VISUAL CONCEPTS
  ↓
UNIVERSE
```

---

# 13. CREATIVE UNIVERSE

The Creative Universe is the main screen and the signature feature of Prototype 3.

It should feel like a visual mind map combined with an interactive world map.

---

## 13.1 Core concept

Each creative idea is represented as a node.

Nodes contain primarily:

- image
- short title
- small metadata
- branch indicator

Example:

```text
                 [LIVING CITY]
                      |
          +-----------+-----------+
          |                       |
    [NEON FOREST]          [CITY DREAM]
          |                       |
     [ROBOT]                 [MEMORY]
```

The user can pan and zoom the universe.

---

# 14. Universe Node Design

Each node should be visually rich.

Suggested node:

```text
+----------------------+
|                      |
|      IMAGE           |
|                      |
|----------------------|
| NEON FOREST          |
| SIGNAL 04            |
+----------------------+
```

Node states:

### Normal

Subtle glow.

### Hover

Image expands slightly and metadata appears.

### Selected

Strong neon outline.

### Generated

Short signal animation.

### Recommended

Small `AI` marker.

### Branch root

Distinct visual treatment.

---

# 15. Node Interactions

The user should be able to:

- click a node
- inspect it
- drag it
- connect/branch from it
- combine it with another node
- duplicate it
- generate alternatives
- stabilize it

Desktop:

- mouse drag
- wheel zoom
- click
- keyboard navigation where practical

Tablet:

- touch drag
- pinch zoom
- tap
- long press for node actions

---

# 16. Gesture-Based Interaction

Gesture interaction should be designed primarily for **tablet**.

Do not depend on camera-based hand tracking.

Camera gesture control would introduce:

- browser compatibility risk
- permission friction
- accessibility problems
- implementation complexity
- unreliable demo behavior

Instead use direct touch gestures.

---

## 16.1 Tablet gestures

### Pan universe

One finger drag.

### Zoom

Pinch.

### Select

Tap.

### Open node actions

Long press.

### Combine

Drag one node toward another.

When two nodes overlap:

```text
SIGNAL COLLISION DETECTED

[ NODE A ]
      +
[ NODE B ]

SYNTHESIS READY
```

Then release to execute.

This provides a meaningful gesture interaction without requiring unreliable computer vision.

---

# 17. Combination System

Combination is the central creative mechanic.

The user can combine:

- two nodes
- multiple nodes
- a node + voice signal
- a node + sketch
- a node + image
- a branch + another branch

Example:

```text
[NEON CITY]
      +
[ABANDONED FOREST]
      +
[DETECTIVE]
      ↓
SYNTHESIZE
```

The AI generates:

```text
THE FOREST UNDER THE CITY
```

---

# 18. Terminal Synthesis Modal

This should be one of the strongest visual moments in the prototype.

When the user combines signals, open a cinematic terminal-style modal.

Example:

```text
┌──────────────────────────────────────────────┐
│ SIGNAL SYNTHESIS // 04                      │
│----------------------------------------------│
│                                              │
│ SOURCE A                                     │
│ NEON CITY                                    │
│                                              │
│ SOURCE B                                     │
│ ABANDONED FOREST                             │
│                                              │
│ SOURCE C                                     │
│ DETECTIVE                                    │
│                                              │
│----------------------------------------------│
│ SYNTHESIS MODE                               │
│ [ UNEXPECTED ]                               │
│                                              │
│ [ EXECUTE SYNTHESIS ]                        │
│                                              │
└──────────────────────────────────────────────┘
```

The modal should feel like a machine processing a creative experiment.

---

# 19. Synthesis Animation

Suggested sequence:

```text
MODAL OPEN
↓
SOURCE SIGNALS LOCK
↓
LINES CONNECT
↓
RGB / NEON SIGNAL PULSE
↓
TERMINAL TEXT APPEARS
↓
PROCESSING
↓
IMAGE REVEAL
↓
NEW POSSIBILITY DETECTED
```

Avoid fake long loading times.

A short staged animation is sufficient.

---

# 20. Synthesis Modes

Provide a small number of creative synthesis modes.

Examples:

- **Unexpected**
- **Cinematic**
- **Dreamlike**
- **Dark**
- **Chaotic**
- **Minimal**
- **Surreal**

The mode changes the mock AI output.

The user should not need to configure dozens of parameters.

---

# 21. Mock AI Behavior

No backend or actual AI model is required.

The mock AI should return deterministic or seeded creative results.

Conceptually:

```text
Input signals
↓
Keyword / category extraction
↓
Mock creative synthesis
↓
Generated possibility
```

The mock AI should simulate:

- signal interpretation
- universe generation
- synthesis
- branch generation
- recommendation
- storyboard conversion
- video preview generation

---

# 22. Example Mock AI Results

Input:

```text
NEON CITY
```

Possible results:

```text
CITY THAT DREAMS
NEON RAIN DISTRICT
THE LAST HUMAN STREET
CITY WITHOUT SUNLIGHT
```

Input:

```text
NEON CITY + FOREST
```

Possible results:

```text
THE FOREST UNDER THE CITY
BIO-LUMINESCENT METROPOLIS
ROOTS THROUGH CONCRETE
THE CITY THAT GREW
```

Input:

```text
DETECTIVE + LIVING CITY
```

Possible results:

```text
THE CITY IS THE SUSPECT
THE DETECTIVE INSIDE THE MACHINE
CASE FILE: CITY-01
```

---

# 23. AI Recommendation

The AI may recommend one branch.

Example:

```text
AI RECOMMENDATION

THE CITY THAT REMEMBERS

WHY:
Strong visual contrast between
neon infrastructure and organic memory.

[ EXPLORE ]
[ BRANCH ]
[ STABILIZE ]
```

The recommendation should never automatically overwrite the user's creative direction.

---

# 24. Branching

Branching is a first-class feature.

Every promising idea should be able to become a new branch.

Example:

```text
                  ORIGINAL
                     |
             THE LIVING CITY
                     |
       +-------------+-------------+
       |             |             |
     NOIR          HORROR       WONDER
       |             |             |
    DETECTIVE      HUNTER        CHILD
```

The user can explore each branch independently.

---

# 25. Branch Actions

For a selected node:

```text
[ EXPLORE ]
[ GENERATE 3 ALTERNATIVES ]
[ COMBINE ]
[ BRANCH ]
[ STABILIZE ]
[ DELETE ]
```

`GENERATE 3 ALTERNATIVES` should create three nearby but distinct concepts.

Example:

```text
CURRENT:
LIVING CITY

ALTERNATIVES:

01 — CITY THAT DREAMS
02 — CITY THAT HUNTS
03 — CITY THAT REMEMBERS
```

---

# 26. Creative History / Archive

The Archive preserves interesting discoveries.

It should not behave like a normal file manager.

Instead:

> Archive = memory of the creative journey.

Example:

```text
ARCHIVE // CREATIVE MEMORY

[ SIGNAL 01 ]
NEON CITY

[ SIGNAL 04 ]
THE CITY THAT REMEMBERS

[ BRANCH 07 ]
FOREST UNDER THE CITY

[ STABILIZED ]
FINAL CONCEPT
```

The user can restore an earlier branch.

---

# 27. LAB

The Lab is the controlled experimentation area.

It should allow users to inspect or modify a selected possibility without turning into a full professional editor.

Possible Lab controls:

- visual mood
- color direction
- style direction
- environment
- character presence
- intensity
- cinematic direction

Keep controls lightweight.

The Lab is about:

> "What happens if I push this idea?"

not:

> "Let me manually edit every production parameter."

---

# 28. Possibility Stabilization

Once the user finds an interesting idea, they can stabilize it.

This is an important transition point.

Terminal modal:

```text
POSSIBILITY STABILIZED
--------------------------------

THE CITY THAT REMEMBERS

Signal coherence: HIGH
Visual potential: HIGH
Branch depth: 04

This concept is ready to become
a cinematic sequence.

[ KEEP EXPLORING ]
[ TURN INTO VIDEO ]
```

---

# 29. Transition from Exploration to Video

Prototype 3 must still connect to the platform's core video-generation purpose.

When the user chooses:

**TURN INTO VIDEO**

the universe transforms.

Conceptually:

```text
Creative Universe
       ↓
Selected branch
       ↓
Cinematic storyboard
       ↓
Scene sequence
       ↓
Video preview
```

The transition should be visually dramatic.

---

# 30. Cinematic Storyboard Conversion

The selected branch becomes a sequence of cinematic frames.

Example:

```text
THE CITY THAT REMEMBERS

[ FRAME 01 ] → [ FRAME 02 ] → [ FRAME 03 ] → [ FRAME 04 ]
```

Each frame may contain:

- image
- scene title
- short description
- duration
- transition indicator

The interface should remain more cinematic than Prototype 2.

Do not expose the full professional timeline system.

---

# 31. Cinematic Preview

The final preview should feel like a reveal.

Use:

- full-screen video area
- large cinematic imagery
- animated scene transitions
- subtle film-grain / scanline effects
- ambient glow
- minimal controls

The mock preview can simulate playback using generated images and transitions.

No actual video rendering is required.

---

# 32. Cinematic Transitions

Prototype 3 should use more expressive transitions than Prototypes 1 and 2.

Potential transition styles:

- signal dissolve
- CRT flicker
- RGB split
- light sweep
- glitch reveal
- cinematic fade
- scanline wipe
- particle dissolve
- zoom-through
- node-collapse transition

Use these selectively.

The goal is cinematic energy, not constant visual noise.

---

# 33. Visual Direction

## 33.1 Overall aesthetic

The visual language is:

> **Retro-futurist creative laboratory + neon signal system + cinematic interface.**

References should be interpreted rather than copied directly.

Use ideas associated with:

- CRT terminals
- retro computers
- industrial control systems
- science-fiction laboratories
- imagined 1980s/1990s future interfaces
- cyberpunk lighting
- game-like discovery systems

Do not directly reproduce Fallout UI or another existing game's interface.

The final design should have its own identity.

---

# 34. Color System

Prototype 3 can use a much more vibrant palette than Prototype 2.

Base:

```text
Deep Space Black
#07080C

Terminal Black
#0B0F14

Panel Dark
#10151C
```

Primary neon:

```text
Electric Cyan
#00E5FF

Neon Magenta
#FF2BD6

Signal Green
#39FF88

Electric Violet
#8B5CFF

Solar Yellow
#FFE66D
```

Supporting colors:

```text
Soft White
#F4F7FB

Cool Gray
#A8B2BF

Muted Gray
#6F7B89

Error Red
#FF5C70
```

Use neon colors strategically.

Do not make every element glow.

---

# 35. Neon Usage Rules

Neon should primarily indicate:

- active state
- selection
- generated result
- signal connection
- interaction focus
- important action
- system feedback

Large amounts of constant glow reduce hierarchy and accessibility.

Use:

```text
dark background
+
bright focal element
+
controlled glow
```

rather than:

```text
everything glowing
```

---

# 36. Typography

The typography should reinforce the retro-terminal identity while remaining readable.

Recommended font direction:

### Display / navigation

Use a futuristic display font such as:

- **Orbitron**
- **Audiowide**
- another appropriate geometric cyberpunk display font

### Terminal / system text

Use:

- **Share Tech Mono**
- **JetBrains Mono**
- **IBM Plex Mono**

### Body text

Use a highly readable sans-serif fallback such as:

- Inter
- system-ui
- sans-serif

Recommended hierarchy:

```text
DISPLAY:
Orbitron

SYSTEM:
Share Tech Mono

BODY:
Inter / system-ui
```

If fonts are loaded from a CDN, provide strong local fallbacks so the prototype remains usable if the font request fails.

The final HTML must remain self-contained as a single HTML5 file.

---

# 37. Terminal Modal Language

Use concise system-like language.

Examples:

```text
SIGNAL ACQUIRED
```

```text
SIGNAL COLLISION DETECTED
```

```text
SYNTHESIS READY
```

```text
NEW POSSIBILITY DETECTED
```

```text
BRANCH CREATED
```

```text
CONCEPT STABILIZED
```

```text
SEQUENCE INITIALIZED
```

Avoid excessive fake technical jargon.

The terminology should support the creative metaphor rather than obscure the UI.

---

# 38. Modal Design

Modals are a major visual component of Prototype 3.

They should feel like system consoles.

Possible visual elements:

- strong border
- corner brackets
- scanline overlay
- subtle RGB edge
- monospace labels
- animated loading line
- signal waveform
- terminal cursor
- large modal title
- clear primary action

Example:

```text
╔══════════════════════════════════════╗
║ SIGNAL SYNTHESIS // 04              ║
║--------------------------------------║
║ SOURCE A    NEON CITY               ║
║ SOURCE B    FOREST                  ║
║ SOURCE C    DETECTIVE              ║
║                                      ║
║ MODE        UNEXPECTED              ║
║                                      ║
║ [ EXECUTE SYNTHESIS ]               ║
╚══════════════════════════════════════╝
```

Use actual semantic buttons underneath the visual treatment.

---

# 39. Cinematic Motion Language

Animation is important for differentiation.

Motion should communicate:

### Discovery

Nodes appear from the darkness.

### Connection

Lines travel between nodes.

### Synthesis

Signals converge.

### Generation

Image reveals gradually.

### Branching

A new node grows outward from its parent.

### Stabilization

The selected node becomes visually focused.

### Video conversion

The universe contracts into a storyboard sequence.

---

# 40. Motion Principles

Use:

- CSS transitions
- CSS keyframes
- Web Animations API where useful

Do not introduce a heavy animation library unless genuinely necessary.

Animations should remain performant.

Respect:

```css
prefers-reduced-motion: reduce
```

When reduced motion is enabled:

- remove large zoom effects
- remove flashing
- reduce glitch effects
- replace animated transitions with fades
- keep state changes understandable

---

# 41. Accessibility

Accessibility is a required evaluation criterion and must not be sacrificed for the cyberpunk visual style.

## 41.1 Semantic HTML

Use:

- `<header>`
- `<nav>`
- `<main>`
- `<section>`
- `<article>`
- `<aside>`
- `<footer>`
- `<button>`
- `<dialog>` where appropriate
- `<form>`
- `<label>`

Do not use clickable `<div>` elements when a semantic button is appropriate.

---

# 42. Keyboard Accessibility

Important actions should be keyboard reachable.

Support:

```text
Tab
Shift + Tab
Enter
Space
Escape
Arrow keys where appropriate
1–4 navigation shortcuts
```

Keyboard users should be able to:

- open Signal
- start voice interaction
- submit text
- select nodes
- open node actions
- close modals
- navigate modal controls
- activate synthesis
- stabilize a concept
- enter video preview

---

# 43. Focus Management

When a modal opens:

1. move focus into the modal
2. keep focus within the modal where appropriate
3. close with Escape
4. restore focus to the triggering element

Visible focus states must be present.

Do not rely on neon glow alone to communicate focus.

Use a clear focus outline with sufficient contrast.

---

# 44. Color Accessibility

The task requires WCAG 2.1 AA contrast.

Neon colors must not be used as the only text color on dark backgrounds without checking contrast.

Important information must never depend on color alone.

For example:

Bad:

```text
Green = success
Red = error
```

Better:

```text
✓ SIGNAL CAPTURED
! SIGNAL FAILED
```

and use color as reinforcement.

---

# 45. Voice Accessibility

Voice is an enhancement, not the only interaction.

Every voice action must have a text alternative.

For example:

```text
[ 🎙 VOICE SIGNAL ]
[ ✎ TYPE SIGNAL ]
```

A user who cannot or does not want to use voice must have equivalent functionality.

---

# 46. Gesture Accessibility

Tablet gestures must have alternative controls.

For example:

Gesture:

```text
Drag node A onto node B
```

Alternative:

```text
Select A
+
Select B
+
[ COMBINE ]
```

Gesture should accelerate interaction, not become the only way to perform it.

---

# 47. Screen Reader Considerations

Provide:

- meaningful button labels
- alt text for meaningful images
- empty alt text for decorative images
- accessible names for icon buttons
- status announcements for AI generation
- clear modal titles
- semantic headings

Mock AI status can use an appropriate live region.

Example conceptual status:

```text
aria-live="polite"
```

for:

```text
"New possibility generated."
```

Avoid announcing every animation frame.

---

# 48. Responsive Strategy

The assignment requires responsive behavior across:

- mobile: approximately 375px
- tablet: approximately 768px
- desktop: approximately 1440px

Prototype 3 is **desktop + tablet first**, but must remain functional on smaller screens.

---

# 49. Desktop Layout — 1440px+

Desktop is the primary showcase.

Suggested structure:

```text
+-----------------------------------------------------------+
| SIGNAL TERMINAL NAV                                      |
+-----------------------------------------------------------+
|                                                           |
|                  CREATIVE UNIVERSE                       |
|                                                           |
|      [NODE]          [NODE]          [NODE]              |
|           \             |             /                  |
|                    [CORE]                                |
|                       |                                   |
|                    [NODE]                                 |
|                                                           |
|                           [ INSPECTOR / ACTION PANEL ]   |
+-----------------------------------------------------------+
```

The universe should receive most of the screen.

Controls should float around the visual content rather than dominate it.

---

# 50. Tablet Layout — 768px+

Tablet should retain the core universe experience.

Use:

- touch-friendly nodes
- larger hit targets
- collapsible action panels
- bottom or floating controls
- gesture support
- simplified navigation

Avoid forcing a dense desktop sidebar.

Suggested:

```text
TOP TERMINAL NAV

        CREATIVE UNIVERSE

          [ NODE ]
      [ NODE ] [ NODE ]
          [ NODE ]

BOTTOM ACTION DOCK
[ COMBINE ] [ BRANCH ] [ EXPLORE ]
```

---

# 51. Mobile Layout — 320–767px

Mobile is a fallback mode rather than the primary experience.

The universe should become a simplified vertical/zoomable exploration surface.

Prioritize:

1. Signal input
2. Generated possibilities
3. Branching
4. Stabilization
5. Video preview

Reduce secondary controls.

Potential layout:

```text
SIGNAL

[VOICE]
[TEXT]

↓

POSSIBILITIES

[IMAGE CARD]
[IMAGE CARD]

↓

[ EXPLORE ]
[ BRANCH ]
[ STABILIZE ]
```

Touch targets must remain large enough for comfortable use.

---

# 52. Touch Targets

Interactive controls should have sufficiently large hit areas.

Particularly important:

- node selection
- combine
- branch
- modal buttons
- voice activation
- navigation
- close buttons

Avoid tiny terminal-style controls simply for visual authenticity.

The aesthetic must not compromise usability.

---

# 53. Image Strategy

Images are important to Prototype 3 because visual discovery is the product.

Use a limited but coherent image set.

Prioritize:

- opening signal images
- universe nodes
- generated possibilities
- selected/stabilized concept
- storyboard frames
- final preview

The same concept should reuse visually related images where appropriate so that a node does not feel disconnected from its generated storyboard.

---

# 54. Visual Continuity

Example:

```text
Universe Node
      ↓
Generated Possibility
      ↓
Stabilized Concept
      ↓
Storyboard Frame
      ↓
Video Preview
```

These should visually feel like the same concept evolving.

Avoid unrelated random stock imagery.

---

# 55. AI Workflow Integration

Although Prototype 3 is primarily exploratory, it must still connect to the platform's AI video workflow.

The transformation is:

```text
Creative Signal
      ↓
Visual Concepts
      ↓
Creative Universe
      ↓
Selected Branch
      ↓
Storyboard
      ↓
Video Preview
```

This satisfies the platform's broader workflow while demonstrating a different interaction model.

---

# 56. Mock Backend Architecture

No backend should be implemented.

The frontend should use a mock service layer.

Conceptual structure:

```text
UI
 ↓
Creative Exploration State
 ↓
Mock AI Service
 ↓
Deterministic Mock Results
 ↓
State Update
 ↓
Reactive UI
```

The mock AI should be separated from UI components.

Do not hard-code large AI response structures directly inside buttons or visual components.

---

# 57. Shared Folder Integration

Prototype 3 should primarily reuse the project's **shared** folder.

Relevant shared concepts may include:

- domain models
- mock AI infrastructure
- mock data/catalogues
- router utilities
- accessibility utilities
- random/deterministic utilities
- async simulation utilities
- formatting helpers

Do not modify or depend on the internal implementation of Prototype 1 or Prototype 2 folders unless absolutely necessary.

Prototype 3 should be treated as an independent presentation/interaction layer built on shared infrastructure.

---

# 58. Prototype 3 State Model

At a conceptual level, the prototype needs state for:

```text
activeView
signal
signalType
voiceState

universe
nodes
connections
selectedNode
selectedNodes

synthesis
synthesisModal
synthesisMode
isGenerating

branches
archive

stabilizedConcept

storyboard
preview

accessibility
reducedMotion
```

The exact implementation structure is left to the existing project architecture.

The important principle is:

> One source of truth for the Creative Universe.

---

# 59. Core Domain Concepts

Prototype 3 should conceptually work with objects such as:

### Signal

```text
id
type
content
label
source
```

Types:

```text
text
voice
image
sketch
generated
```

### Creative Node

```text
id
title
image
description
signals
parentId
children
status
```

### Branch

```text
id
parentNodeId
direction
nodes
```

### Synthesis

```text
sourceNodeIds
mode
result
```

### Stabilized Concept

```text
nodeId
title
summary
storyboard
```

---

# 60. Undo / Recovery

Prototype 3 should not require a complex professional undo system like Prototype 2.

However, destructive actions should be recoverable.

For example:

```text
NODE REMOVED

[ UNDO ]
```

Branch history should naturally provide recovery for creative exploration.

The main principle is:

> Exploration should feel safe.

The user should not fear experimenting.

---

# 61. Loading and AI Feedback

Do not use fake percentages such as:

```text
Generating 73%
```

unless the value represents a real deterministic simulation.

Prefer stage-based feedback:

```text
CAPTURING SIGNAL
↓
INTERPRETING SIGNAL
↓
CONNECTING CONCEPTS
↓
SYNTHESIZING POSSIBILITY
↓
RESULT READY
```

This is both more honest and more aligned with the product metaphor.

---

# 62. Empty States

Example:

```text
CREATIVE UNIVERSE EMPTY

No signals detected.

Start with a thought,
a voice signal,
a sketch,
or an image.

[ INITIALIZE SIGNAL ]
```

The empty state should feel intentional rather than like an error.

---

# 63. Error States

Example:

```text
SIGNAL PROCESSING FAILED

The creative signal could not be interpreted.

[ TRY AGAIN ]
[ USE TEXT INPUT ]
```

Do not leave the user stuck.

---

# 64. No-JS / Unsupported Feature Considerations

The assignment is an interactive frontend prototype, so JavaScript is required.

However, the implementation should fail gracefully where browser APIs are unavailable.

Especially:

- speech recognition
- touch-specific features
- optional image APIs

The core experience must remain available through ordinary HTML controls.

---

# 65. Performance

The assignment asks prototypes to load quickly.

Prototype 3 should therefore avoid:

- huge video files
- unnecessarily large images
- excessive animation layers
- large third-party libraries
- continuous expensive canvas rendering
- unnecessary polling

Prefer:

- compressed images
- CSS-based effects
- lightweight DOM
- small mock data
- efficient event handlers
- limited simultaneous animations

---

# 66. Single HTML5 Deliverable

Prototype 3 must ultimately be buildable into:

```text
prototype-03-creative-signal.html
```

The file must:

- contain the application
- contain the generated CSS
- contain the generated JavaScript
- be directly openable in a modern browser
- not require a backend
- not require a separate development server for the final deliverable

The project may use the existing Vue/Vite development setup during development.

The final build must preserve the standalone HTML5 requirement.

---

# 67. Build Constraint

Use the existing project build system.

Do not create a completely separate application framework for Prototype 3.

The final pipeline should produce the standalone HTML file expected by the assignment.

Do not introduce unnecessary build complexity.

---

# 68. Routing

Use the project's existing hash-router/shared routing approach where practical.

Prototype 3 routes can conceptually be:

```text
#signal
#universe
#lab
#archive
#export
```

However, route changes should feel lightweight.

The universe should remain the central context.

---

# 69. What Prototype 3 Must NOT Become

Avoid turning Prototype 3 into:

### Another ChatGPT interface

Do not make a large chat panel the primary UI.

### Another professional editor

Do not reproduce Prototype 2's timeline/inspector workflow.

### A drawing application

Sketching is only an input signal.

### A gimmick demo

Voice and gestures must contribute to the creative workflow.

### A pure visual mind map

The universe must eventually connect to video generation.

### A game clone

Game-like discovery is a design influence, not the product itself.

---

# 70. P1 / P2 / P3 Differentiation

The evaluator should be able to understand the difference within seconds.

## Prototype 1

> **"I have an idea. Help me make a video."**

```text
Guided creation
Simple choices
AI hides complexity
Mobile-first
```

## Prototype 2

> **"I know what I'm doing. Help me make it faster."**

```text
Professional workspace
Timeline
Inspector
Copilot
Direct control
Desktop-first
```

## Prototype 3

> **"I don't know exactly what this could become. Let's explore."**

```text
Creative universe
Voice signals
Visual combination
Branching
Discovery
Experimental AI
Desktop + tablet
```

This differentiation is one of the most important evaluation goals.

---

# 71. Main Demo Path

The primary demo should be short and visually impressive.

Recommended sequence:

```text
1. Open SIGNAL

2. Say/type:
   "What if a city was alive?"

3. Show VOICE SIGNAL / SIGNAL CAPTURED

4. Enter CREATIVE UNIVERSE

5. Show several visual nodes

6. Select:
   NEON CITY

7. Select:
   ABANDONED FOREST

8. Drag/combine them

9. Open SYNTHESIS modal

10. Execute synthesis

11. Reveal:
    THE FOREST UNDER THE CITY

12. Generate alternatives

13. Branch one result

14. Select the strongest concept

15. STABILIZE

16. Show:
    POSSIBILITY STABILIZED

17. TURN INTO VIDEO

18. Universe transforms into storyboard

19. Play cinematic preview

20. Return to universe if time permits
```

This demonstrates the full product philosophy without requiring a long explanation.

---

# 72. Strongest Visual Moments

Prioritize these during implementation:

### Moment 1 — Voice Signal

The system listens and transforms speech into visual signals.

### Moment 2 — Creative Universe

A visual mind map appears around the user.

### Moment 3 — Node Combination

Two unrelated concepts visually collide.

### Moment 4 — Synthesis Modal

Retro terminal interface processes the creative experiment.

### Moment 5 — New Possibility

A cinematic image is revealed.

### Moment 6 — Branching

The idea expands into multiple directions.

### Moment 7 — Stabilization

The selected concept becomes visually dominant.

### Moment 8 — Video Transformation

The creative universe turns into a cinematic storyboard.

These moments should receive more effort than secondary settings.

---

# 73. Scope Priority

Because this is a time-limited prototype, prioritize implementation in this order.

## P0 — Must work

- Signal input
- Universe
- node selection
- combination
- synthesis modal
- mock AI generation
- branching
- stabilization
- storyboard conversion
- video preview
- standalone build

## P1 — Strongly recommended

- Voice Signal experience
- tablet touch gestures
- cinematic transitions
- Archive
- alternative generation
- keyboard navigation
- reduced-motion support
- strong accessibility labels

## P2 — Nice to have

- sketch input
- advanced universe manipulation
- richer Lab controls
- additional synthesis modes
- more sophisticated gesture interactions

## P3 — Do not spend significant time on

- real AI
- real backend
- real video rendering
- real hand tracking
- complex collaborative features
- advanced drawing engine
- production-grade media management

---

# 74. Implementation Guidance for Cline

Cline should implement Prototype 3 according to the following principles.

## 74.1 Reuse shared infrastructure

Look primarily at:

```text
shared/
```

for:

- models
- mock AI
- mock data
- utilities
- router
- accessibility helpers

Do not unnecessarily duplicate shared functionality.

---

## 74.2 Keep Prototype 3 isolated

Prototype 3 should primarily own its own:

- components
- styles
- interaction state
- navigation configuration
- visual effects
- Creative Universe behavior

Do not refactor Prototype 1 or Prototype 2 merely to make Prototype 3 work.

---

## 74.3 Keep mock AI separate

AI behavior should be callable conceptually like:

```text
generateInitialUniverse(signal)
generateSynthesis(signals, mode)
generateBranches(node)
stabilizeConcept(node)
generateStoryboard(node)
generatePreview(storyboard)
```

The exact API can follow the project's existing shared mock AI architecture.

---

# 75. Component-Level Concept

A reasonable conceptual component structure may include:

```text
Prototype3App
├── TerminalNav
├── SignalView
│   ├── VoiceSignal
│   ├── TextSignal
│   ├── SketchSignal
│   └── ImageSignal
│
├── UniverseView
│   ├── UniverseCanvas
│   ├── UniverseNode
│   ├── UniverseConnections
│   ├── UniverseControls
│   └── NodeActionPanel
│
├── SynthesisModal
├── PossibilityModal
├── StabilizeModal
│
├── LabView
├── ArchiveView
├── StoryboardView
├── CinematicPreview
└── Toast / Status system
```

This is a conceptual guide, not a requirement to reproduce these exact files.

---

# 76. Visual Effects Architecture

Prefer CSS-first effects.

Potential effects:

- glow
- scanline
- CRT vignette
- RGB split
- border pulse
- signal sweep
- node connection pulse
- modal flicker
- image reveal

Avoid expensive effects on every element.

The background should remain visually interesting but low-cost.

---

# 77. CRT / Retro Effects

Use subtle effects:

```text
scanlines
+
soft vignette
+
very subtle noise
+
occasional RGB separation
```

Do not permanently apply extreme distortion.

The interface must remain readable.

---

# 78. RGB Outline Rule

RGB edge effects can be used for:

- active node
- selected node
- newly generated node
- synthesis modal
- stabilized concept

Do not outline the entire interface in RGB.

This keeps the effect meaningful.

---

# 79. Terminal Navigation Rule

Terminal-inspired navigation should remain immediately understandable.

Example:

```text
> SIGNAL
  UNIVERSE
  LAB
  ARCHIVE
  EXPORT
```

Do not force the user to learn obscure commands.

Keyboard shortcuts are optional accelerators.

---

# 80. Interaction Hierarchy

The interface should always make the following hierarchy clear:

```text
PRIMARY:
Explore / Combine / Generate

SECONDARY:
Branch / Inspect / Stabilize

TERTIARY:
Archive / Settings / Export
```

Do not let decorative terminal controls compete with the main creative actions.

---

# 81. Export

Export remains simulated.

Possible options:

```text
FORMAT
MP4

RESOLUTION
1080p

PLATFORM
YouTube Shorts
Instagram Reels
TikTok
```

The export experience should be visually consistent with the terminal system.

Example:

```text
EXPORT SEQUENCE

CONCEPT LOCKED
STORYBOARD READY
PREVIEW READY

[ SIMULATE EXPORT ]
```

No actual MP4 rendering is required.

---

# 82. Honesty About Simulation

The prototype must clearly communicate that AI/video operations are simulated.

For example:

```text
SIMULATED AI GENERATION
```

or:

```text
DEMO MODE
```

where appropriate.

Do not imply that a real AI backend or real video encoder is running.

---

# 83. Accessibility vs Visual Style

The retro/cyberpunk style is not an excuse for poor accessibility.

The implementation should preserve:

- readable typography
- sufficient contrast
- clear focus
- keyboard access
- semantic structure
- text alternatives
- reduced motion
- non-color status indicators
- voice alternatives

The aesthetic should be layered on top of a fundamentally accessible interface.

---

# 84. Testing Requirements

Before final submission, manually test at least:

## Desktop

- 1440px+
- Chrome
- primary demo flow
- keyboard navigation
- modal focus
- reduced motion

## Tablet

- approximately 768px
- touch interaction
- pinch/drag behavior where implemented
- node selection
- combine alternative
- modal usability

## Mobile fallback

- approximately 375px
- Signal input
- generated results
- branch
- stabilize
- video preview
- no horizontal overflow

---

# 85. Functional QA Checklist

### Signal

- [ ] text input works
- [ ] voice state works
- [ ] voice fallback works
- [ ] signal generation works
- [ ] loading state works
- [ ] error state works

### Universe

- [ ] nodes render
- [ ] nodes can be selected
- [ ] node information is understandable
- [ ] universe can be explored
- [ ] branching works
- [ ] combine works

### Synthesis

- [ ] modal opens
- [ ] source nodes are shown
- [ ] synthesis mode can be selected
- [ ] generation state is visible
- [ ] result appears
- [ ] user can continue exploring

### Branching

- [ ] alternatives generate
- [ ] branches remain visible
- [ ] parent/child relationship is understandable
- [ ] previous ideas can be recovered

### Stabilization

- [ ] concept can be stabilized
- [ ] stabilized state is visually clear
- [ ] user can keep exploring
- [ ] user can convert to video

### Video

- [ ] storyboard appears
- [ ] sequence is understandable
- [ ] cinematic preview works
- [ ] transitions play
- [ ] export simulation works

---

# 86. Accessibility QA Checklist

- [ ] semantic HTML
- [ ] keyboard navigation
- [ ] visible focus
- [ ] Escape closes modals
- [ ] modal focus management
- [ ] ARIA labels for icon buttons
- [ ] meaningful image alt text
- [ ] decorative images marked appropriately
- [ ] status messages accessible
- [ ] color not used as sole status indicator
- [ ] voice has text fallback
- [ ] gestures have button alternatives
- [ ] reduced-motion mode works
- [ ] no severe contrast problems
- [ ] no horizontal overflow at target widths

---

# 87. Final Product Test

Before submission, ask:

### Question 1

Can a reviewer understand the concept in 10 seconds?

Expected:

> "This is an AI creative exploration system."

### Question 2

Does it feel different from Prototype 1?

Expected:

> Yes. Prototype 1 guides the user toward a video; Prototype 3 helps the user discover ideas.

### Question 3

Does it feel different from Prototype 2?

Expected:

> Yes. Prototype 2 is a professional production workspace; Prototype 3 is an exploratory creative environment.

### Question 4

Does AI feel integrated?

Expected:

> Yes. AI interprets signals, synthesizes combinations, proposes branches, and converts a discovered concept into a storyboard.

### Question 5

Is the experience innovative rather than merely decorative?

Expected:

> Yes. The combination + branching + Creative Universe interaction is the core innovation, while the retro/cyberpunk aesthetic supports it.

### Question 6

Can the user still accomplish the main workflow without voice or gestures?

Expected:

> Yes.

### Question 7

Can the prototype run as a standalone HTML5 file?

Expected:

> Yes.

---

# 88. Final Design Summary

Prototype 3 should feel like:

> **A creative machine from a future that never existed.**

The user does not sit down to operate a conventional editor.

They enter a system.

They give it a signal.

The system shows them possibilities.

They connect ideas.

The system creates unexpected combinations.

They branch interesting directions.

They discover something worth keeping.

Then, only when the idea becomes clear, the system turns that discovery into a cinematic video.

The complete experience is:

```text
┌───────────────────────────────────────────────┐
│                                               │
│             CREATIVE SIGNAL                   │
│                                               │
│   "What if the city was actually alive?"     │
│                     ↓                         │
│               SIGNAL CAPTURED                 │
│                     ↓                         │
│              CREATIVE UNIVERSE                │
│                     ↓                         │
│        [CITY] + [FOREST] + [DETECTIVE]       │
│                     ↓                         │
│             SIGNAL SYNTHESIS                 │
│                     ↓                         │
│          NEW POSSIBILITY DETECTED            │
│                     ↓                         │
│                  BRANCH                       │
│              /      |       \                 │
│          NOIR     HORROR    WONDER            │
│                     ↓                         │
│              CONCEPT STABILIZED              │
│                     ↓                         │
│               TURN INTO VIDEO                │
│                     ↓                         │
│             CINEMATIC STORYBOARD             │
│                     ↓                         │
│              CINEMATIC PREVIEW               │
│                                               │
└───────────────────────────────────────────────┘
```

The most important principle is:

> **Prototype 3 is not about making video faster. It is about helping the creator discover what video they want to make in the first place.**
