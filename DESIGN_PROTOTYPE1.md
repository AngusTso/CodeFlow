## Title: Prototype 1 — Code Flow

#### Main Concept:

Code Flow is a **mobile-first** AI short-video creation experience designed for **casual creators** who want to turn an idea into a finished short video **without learning** professional video-editing software.

Code Flow = casual creator + mobile-first + minimalist/friendly + guided hybrid + template cards + progressive freedom + functional animation.

#### Target audience: Casual Creator

#### Target device: mobile oriented (tablet and desktop fit mobile)

#### Core philosophy: Targeting causal user , we hide complexity instead of exposing it, reduce learning curve -- idea -> video with AI helps

### Summary

| Decision       | Chosen                  | Reason                                              |
| -------------- | ----------------------- | --------------------------------------------------- |
| AI interaction | Hybrid                  | Beginner friendly without restricting creativity    |
| Navigation     | Global + contextual     | Separates app navigation from creation workflow     |
| Workflow       | Guided → flexible       | Reduces initial complexity while preserving control |
| Storyboard     | Card + overview         | Visual browsing + sequencing                        |
| AI feedback    | Simple magic            | Fits casual creator persona                         |
| Animation      | Functional              | Demonstrates interaction without distraction        |
| Visual style   | Minimalist/friendly     | Reinforces accessibility                            |
| Device         | Mobile-first            | Strongest constraint and clear persona              |
| Controls       | Progressive disclosure  | Avoids overwhelming users                           |
| Reordering     | Drag + buttons          | Touch + accessibility                               |
| Architecture   | Shared state/components | Enables three prototypes efficiently                |

## Design decision

### 1. AI interaction: Wizard + Template Hybrid

```
Start Creating
       │
       ├── Start from Template
       │
       └── Describe Your Idea
                    ↓
              Guided Workflow
```

#### Reason

A completely blank prompt creates unnecessary cognitive load for casual creators.
A completely template-driven experience restricts creativity.
The hybrid model allows:

- beginners → start with a template
- experienced casual users → start from an idea
- both → enter the same guided creation workflow

pros:

- Low learning curve
- Flexible
- Good mobile UX
- Templates can demonstrate product personality
- Reusable card component

cons:

- More UI states to implement
- Templates must remain understandable
- Too many templates could create decision paralysis

### 2. Navigation: Application Navigation + Contextual Creation Flow

Global navigation:

```
Home
Projects
Create
Profile
```

Creation navigation: Idea → Storyboard → Scenes → Character → Video

User enters creation mode, the creation flow becomes the primary navigation

#### Reason

A pure bottom-navigation design would make the five-stage creation process ambiguous
A pure wizard would make the application feel restrictive
The hybrid approach provides:
**global orientation + guided creation.**

### 3. Workflow: Progressive Freedom

The user initially follows:

```
Idea
 ↓
Storyboard
 ↓
Scenes
 ↓
Character
 ↓
Video
```

After generation, completed stages become editable

```
Storyboard ←→ Scenes ←→ Character ←→ Video
```

Reason:
A completely strict wizard is easy for beginners but frustrating once the user understands the workflow
A completely free editor creates too much complexity
Main UX principle: Guided first, flexible later.

### 4. Storyboard interaction: Hybrid Card Layout

The storyboard uses reusable scene cards.
On mobile:

```
┌──────────────────────┐
│ Scene 01             │
│                      │
│    [thumbnail]       │
│                      │
│ Tokyo at night...    │
│ 6 sec · Cinematic    │
│                      │
│     ←  Swipe  →      │
└──────────────────────┘
```

Users can swipe between scenes.

An overview mode provides the full sequence:

```
Scene 01
Scene 02
Scene 03
Scene 04
```

Reason:
Pure horizontal cards are pleasant for browsing but poor for understanding the entire video.
Pure vertical lists are efficient but less visually engaging.

The hybrid approach gives:

- **card interaction** for individual scenes
- **overview** for sequencing

The same card component can also be reused for:

- templates
- scenes
- character suggestions
- generated assets

This creates consistency while reducing implementation cost.

### 5. Scene Editing

Selecting a scene opens a **bottom sheet**.

```
Scene 02

Duration
6s ─────●──── 10s

Mood
[ Cinematic ]

Camera
[ Wide ]

Style
[ 3D ]

───────────────

[ Regenerate ]
[ Delete ]
```

Advantage:
**progressive disclosure**

Advanced parameters remain hidden initially
Casual creators see only important controls.
Advanced controls can be expanded later.

### 6. Reordering

Primary interaction:

> **Long press → drag → reorder**

Secondary accessible controls:

```
Move up
Move down
```

This gives us both:

- touch-friendly interaction
- keyboard/accessibility-friendly alternatives

### 7. AI Feedback: Playful magical feedback

The loading state uses:

- spinner
- subtle animated icon
- short human-friendly sentence

Example: ✨ AI is doing its magic...

Reason:
Target is a casual creator

A technical progress display such as:

```
Token generation
Embedding scene representation
Diffusion inference
Post-processing
```

would expose implementation complexity without helping the user.

**Trade-off**
A playful loading state provides personality but gives less precise information.
For this prototype, that is intentional.

### 8. Animation Philosophy

We use animation for:

### AI activity

```
Generate
 ↓
Loading
 ↓
Generated cards
```

### Navigation

```
Storyboard → Scenes
```

Subtle transition communicates progression

Avoid

- excessive particles
- decorative animations everywhere
- long transitions
- animation that blocks interaction

UX principle: If removing an animation makes the interaction less understandable, keep it. If removing it changes nothing, remove it.

### 9. Visual Direction: Minimalist + Friendly

We need soft learning curve + user friendliness

- generous white space
- rounded cards
- clear hierarchy
- friendly typography
- restrained color palette
- approachable illustrations/icons

Emotional target -- "I can figure this out."

### 10. Accessibility

Accessibility is as important as any other metrics
Important requirements:

- semantic HTML
- keyboard navigation
- visible focus states
- ARIA labels
- alt text
- sufficient contrast
- touch targets around 44px+
- non-drag alternative for reordering
- reduced-motion consideration

For example:

```
[☰] Scene 2

Move scene up
Move scene down
Regenerate scene
Delete scene
```

instead of relying entirely on drag-and-drop.

### 11. Responsive Strategy

### 320–767px (Primary experience: mobile)

```
single column
bottom navigation
bottom sheets
swipeable cards
large touch targets
```

### 768px (Secondary experience)

Tablet.

```
two-column where useful
larger preview
persistent controls where appropriate
```

### 1440px (Desktop edition adapt to mobile version)

Desktop.
Rather than simply stretching the mobile UI:

```
┌────────┬─────────────────────┐
│ nav    │ workspace           │
│        │                     │
│        │ storyboard           │
│        │ preview              │
└────────┴─────────────────────┘
```

The **interaction model remains consistent**, but available screen space is used more effectively.
