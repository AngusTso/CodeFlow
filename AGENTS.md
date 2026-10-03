# AGENTS.md

## Project

This repository contains the frontend prototypes for the E-Song Intelligent
take-home assignment.

The product is a responsive web-based AI short-video creation platform.

The assignment requires THREE distinct standalone HTML5 prototypes.

## Core Product Workflow

All prototypes share the same conceptual workflow:

Idea
→ Storyboard
→ Scenes
→ Character
→ Video Composition
→ Export

The prototypes should share core product logic and mock data while presenting
different visual styles and interaction patterns.

## Prototype 01

Name: Code Flow

Persona:

- Casual creator

Priority:

- Mobile-first

Visual direction:

- Minimalist
- Friendly
- Approachable
- Low visual complexity

Design philosophy:

"AI should remove complexity rather than expose it."

Interaction model:

- Hybrid guided workflow + templates
- Guided initially
- Flexible editing after generation
- Card-based content
- Swipeable scene cards on mobile
- Drag-to-reorder
- Accessible move-up/move-down controls
- Bottom sheets for editing
- Simple AI generation feedback

Global navigation:

- Home
- Projects
- Create
- Profile

Creation workflow:

- Idea
- Storyboard
- Scenes
- Character
- Video

## Scope

This is a HIGH-FIDELITY FRONTEND PROTOTYPE.

Do NOT build:

- Real AI models
- Real video generation
- Backend APIs
- Authentication
- Database
- Production video encoding
- Real-time collaboration
- Cloud infrastructure

Use mock data and simulated AI responses.

## Technology

Preferred:

- Vue
- Tailwind CSS
- Vite during development
- JavaScript/TypeScript as appropriate

Final deliverables MUST be standalone HTML5 files that can be opened
directly in a modern browser.

Do not require:

- Node.js
- npm
- a development server
- backend services

for the final prototype files.

## Architecture Principles

Prefer reusable components.

Important conceptual components:

- AppShell
- BottomNavigation
- CreationProgress
- TemplateCard
- SceneCard
- SceneTimeline
- SceneEditor
- CharacterCard
- CharacterEditor
- VideoPreview
- GenerationState
- BottomSheet
- Button
- Modal

Keep product state separate from presentation.

The three prototypes should reuse:

- mock data
- domain models
- generation simulation
- common interaction logic
  where practical.

## Mock AI

Create deterministic mock functions for:

- generateStoryboard()
- generateScene()
- generateCharacter()
- regenerateScene()
- composeVideo()

AI generation should have a short simulated loading state.

Example user-facing messages:

- "✨ AI is doing its magic..."
- "✨ AI is drawing your scenes..."
- "✨ Creating your storyboard..."

Do not expose fake technical reasoning or pretend to display the model's
internal chain-of-thought.

## Animation

Animation should communicate:

- progress
- state changes
- generation
- navigation
- manipulation

Avoid decorative animation that does not improve the interaction.

Respect prefers-reduced-motion.

## Accessibility

Required:

- semantic HTML5
- keyboard navigation
- visible focus states
- ARIA labels where appropriate
- image alt text
- sufficient colour contrast
- touch-friendly controls
- non-drag alternatives for drag interactions
- reduced-motion support

Target WCAG 2.1 AA where practical.

## Responsive Design

Test at minimum:

- 320px
- 375px
- 768px
- 1440px

Mobile is the primary design constraint for Prototype 01.

Do not simply scale the mobile layout to desktop.
Adapt layout while preserving the same mental model.

## Images

Use local optimized assets where practical.

Do not depend on external image URLs for critical UI functionality.

Use image assets only where they materially improve the prototype.

## Code Quality

Prefer:

- small reusable components
- clear naming
- simple state management
- minimal dependencies
- semantic HTML
- maintainable CSS

Avoid:

- unnecessary abstractions
- premature optimization
- giant monolithic components
- unnecessary libraries
- backend implementation

## Important Assignment Constraint

The evaluator is assessing:

- creativity
- usability
- responsiveness
- technical execution
- AI workflow integration
- accessibility
- documentation

Do not sacrifice usability or reliability for unnecessary technical complexity.

When uncertain, prefer the smallest implementation that convincingly
demonstrates the intended interaction.

## Agent Behaviour

Before implementing a major feature:

1. Check the existing architecture.
2. Reuse existing components and mock data.
3. Avoid changing established design decisions without a reason.
4. Keep the prototype runnable after each meaningful change.
5. Do not introduce backend infrastructure.
6. Do not add real AI APIs.
7. Do not replace the agreed design direction without asking.
