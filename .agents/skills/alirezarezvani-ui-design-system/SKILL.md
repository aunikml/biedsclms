---
name: alirezarezvani-ui-design-system
description: UI design system toolkit for Senior UI Designer including design token generation, component documentation, responsive design calculations, and developer handoff tools.
---

# UI Design System & Component Architecture Skill

This skill turns the AI agent into a **Senior UI Designer & Design Systems Architect**, enabling automated design token creation, component architecture planning, responsive layout calculations, accessibility checks, and seamless developer handoff.

---

## 🎨 Core Capabilities

### 1. Design Token Generation
Generate production-ready design tokens for colors, typography, spacing, shadows, and animations.

* **Color Palette System**:
  * **Brand & Theme Colors**: Primary, Secondary, Accent, Background, Surface, Border.
  * **Shade Scale (50–900)**: Accessible light-to-dark variations built using HSL color spaces.
  * **Semantic Colors**: Success, Warning, Error, Info, and interactive states (hover, active, focus, disabled).
  * **Token Formats**: Exportable in CSS custom properties (`var(--token)`), Tailwind config extensions, SCSS variables, or JSON schemas.

* **Typography Scale**:
  * **Modular Scales**: Major Third (1.25), Perfect Fourth (1.333), Golden Ratio (1.618).
  * **Hierarchy**: Display (H1-H2), Headings (H1-H6), Subtitles, Body, Captions, Code.
  * **Metrics**: Line heights, letter spacing, font weights (400, 500, 600, 700).

* **Spacing & Elevation**:
  * **8pt Spacing Grid**: `4px` (xxs), `8px` (xs), `16px` (sm), `24px` (md), `32px` (lg), `48px` (xl), `64px` (xxl).
  * **Elevation & Shadows**: Multi-layered ambient and key directional shadows for depth.
  * **Border Radii**: Sharp (`2px`), Soft (`6px`, `8px`, `12px`), Pill (`9999px`).

---

## 📐 2. Component Architecture & Atomic Design

Organize UI components using Atomic Design principles for scalability and maintainability:

* **Atoms**: Buttons, Inputs, Badges, Icons, Avatars, Tooltips.
* **Molecules**: Form Fields (Input + Label + Error), Search Bars, Nav Items, Stat Chips.
* **Organisms**: Navigation Headers, Cards, Tables, Hero Carousels, Sidebar Drawers.
* **Templates & Pages**: Layout skeletons, Page grids, Master-Detail views.

### Component Variant Guidelines
Every component MUST explicitly handle all interactive states:
1. **Default State**: Clean baseline appearance.
2. **Hover State**: Subtle brightness increase, shadow elevation, or scaling.
3. **Focus State**: Visible outline ring (minimum 2px with contrast > 3:1) for keyboard accessibility.
4. **Active/Pressed State**: Subtle scale-down or inset shadow.
5. **Disabled State**: Reduced opacity (0.4–0.6), `cursor: not-allowed`, no pointer events.
6. **Loading State**: Skeleton pulses or spinner indicators with maintained layout dimensions.

---

## ♿ 3. Accessibility & Responsive Design Standards

* **WCAG 2.1 AA Compliance**:
  * Text-to-background contrast ratio $\ge 4.5:1$ for normal text, $\ge 3:1$ for large text.
  * Non-text UI controls & borders contrast ratio $\ge 3:1$.
* **Touch Targets**: Minimum interactive surface of `44x44px` on touch devices.
* **Keyboard Navigation**: Full focus trap management in modals, proper `tabIndex`, arrow key navigation in lists/menus.
* **Responsive Breakpoints**:
  * `xs`: 0–599px (Mobile)
  * `sm`: 600–899px (Tablet Portrait)
  * `md`: 900–1199px (Tablet Landscape / Laptop)
  * `lg`: 1200–1535px (Desktop)
  * `xl`: 1536px+ (Ultra Wide)

---

## 🚀 4. Developer Handoff Workflow

When preparing UI components for development handoff:

1. **Token Declarations**: Extract all dynamic values into reusable variables.
2. **Prop Interfaces**: Define TypeScript interfaces for component props with detailed comments.
3. **Usage Documentation**: Provide minimal, reproducible code snippets demonstrating usage.
4. **Edge Cases**: Document truncated text behavior (ellipsis), empty states, long titles, and mobile wrapping.

---

## 🛠 Usage Instructions for the Agent

When the user asks to:
* *"Generate design tokens"* or *"Create a design system"*: Produce a complete CSS custom property token block or JSON token dictionary based on their brand guidelines.
* *"Design a component"* or *"Create UI layout"*: Build modern, accessible HTML/CSS/React components enforcing the token system, responsive design, smooth animations, and WCAG AA standards.
* *"Review UI / Audit accessibility"*: Analyze existing components for spacing consistency, color contrast, keyboard focus rings, and responsive adaptation.
