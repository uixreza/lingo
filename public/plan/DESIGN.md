---
name: Bioluminescent EdTech
colors:
  surface: '#0e1511'
  surface-dim: '#0e1511'
  surface-bright: '#333b36'
  surface-container-lowest: '#09100c'
  surface-container-low: '#161d19'
  surface-container: '#1a211d'
  surface-container-high: '#242c27'
  surface-container-highest: '#2f3732'
  on-surface: '#dde5dd'
  on-surface-variant: '#bacbb9'
  inverse-surface: '#dde5dd'
  inverse-on-surface: '#2b322d'
  outline: '#859585'
  outline-variant: '#3c4a3d'
  surface-tint: '#18e376'
  primary: '#46fc8b'
  on-primary: '#003918'
  primary-container: '#05df72'
  on-primary-container: '#005d2b'
  inverse-primary: '#006d34'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#3cfd8a'
  on-tertiary: '#003918'
  tertiary-container: '#00df72'
  on-tertiary-container: '#005c2b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#62ff96'
  primary-fixed-dim: '#18e376'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#62ff96'
  tertiary-fixed-dim: '#00e475'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005226'
  background: '#0e1511'
  on-background: '#dde5dd'
  surface-variant: '#2f3732'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '300'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '300'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1.25rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends high-end futuristic aesthetics with the credibility and rigor of a premier EdTech platform. Built around a signature deep obsidian-emerald canvas paired with vivid, bioluminescent neon green accents, it delivers an immersive experience that feels focused, nocturnal, and technologically advanced.

### Target Audience & Emotional Intent
- **Audience:** Global modern learners, ambitious professionals, and digital natives who value sleek developer-grade or cyberpunk-adjacent visual refinement over juvenile gamification.
- **Mood & Tone:** Focused, premium, electric, and empowering. It avoids visual clutter, channeling late-night productivity sessions with comfortable dark-mode ergonomics and luminous feedback.

### Visual Style
- **Dark Glassmorphism & Neon Glows:** Frosted glass panels (`backdrop-blur-md` with razor-thin translucent borders) float on radial ambient emerald gradients.
- **Isometric & Precision Alignment:** Balanced spacing designed to support 3D isometric environments, technical progress rings, and structured multi-column metrics.
- **High-Contrast Polish:** Sharp white and muted mint-gray text grounded against dark surfaces, punctuated by radiant neon calls-to-action.

## Colors

The palette establishes a high-contrast dark environment rooted in subterranean obsidian tones, lit by concentrated electric emeralds and neon greens.

### Palette Breakdown
- **Primary (`#05DF72`):** Pure electric neon green. Reserved for critical CTAs, active states, active tab highlights, and primary typographic emphasis with neon glows.
- **Secondary (`#10B981`):** Muted jewel emerald. Used for structural borders, subtle pill badges, hover states, and mid-tier interactive elements.
- **Tertiary (`#00E676`):** Hyper-saturated mint-neon. Employed selectively for glowing indicator dots, live tags, and decorative ambient radial blurs.
- **Neutral Canvas (`#080F0B`):** Deep obsidian-emerald base. Surfaces step between `#040806` (deep background), `#0A110D` (card container), and `#111C16` (elevated pill and input backdrops).
- **Text & Contrast:** 
  - Canvas foreground text: `#FFFFFF` for display headlines.
  - Subdued / Secondary body: `#9EBAAA` (emerald-tinted neutral gray).
  - Borders: `rgba(16, 185, 129, 0.2)` to `rgba(5, 223, 114, 0.35)`.

## Typography

The type system pairs **Plus Jakarta Sans** for display and narrative body text with **JetBrains Mono** for technical microcopy, badges, secondary actionable buttons, and code-aligned EdTech features.

- **Hero & Display Contrast:** Major landing page headlines employ light weights (`300`) for secondary phrasing paired with heavy, glowing weights (`700` or `800`) for the primary value proposition.
- **Monospace Accentuation:** Interactive test buttons (such as "Determine Level"), tag badges, and live counter numbers make deliberate use of the technical monospaced label font, reinforcing a modern, calculated digital environment.

## Layout & Spacing

A 12-column responsive fluid grid governs the layout on desktop screen sizes, consolidating into a 4-column system on mobile devices.

### Grid Rhythm & Rules
- **Breakpoints:** Mobile (`< 768px`), Tablet (`768px - 1024px`), Desktop (`> 1024px`).
- **Desktop Grid:** 12 columns with `2rem` gutters and a maximum bounded layout container width of `1280px`.
- **Reflow Architecture:**
  - Hero sections arrange typography and action panels in the left 6 columns while the 3D isometric graphic anchors the right 6 columns.
  - On mobile screens, the 3D graphic stacks cleanly above the headline narrative, retaining its ambient radial illumination.
  - Bottom navigation dock adopts a floating, auto-centered posture pinned to the viewport bottom with safe-area spacing.

## Elevation & Depth

Visual hierarchy does not rely on traditional muddy drop shadows; instead, it utilizes layered frosted glass tiers and directional bioluminescent backlighting.

### Depth Stratification
1. **Base Layer (0dp):** Subterranean obsidian canvas (`#040806` to `#0A110D`) supplemented by static radial blurred gradients of emerald (`rgba(5, 223, 114, 0.08)` to `rgba(16, 185, 129, 0.15)`) behind hero assets and interactive focal points.
2. **Glass Tier 1 (Cards & Modals):** Semi-opaque background (`rgba(10, 20, 15, 0.65)`) with a blur filter (`backdrop-filter: blur(16px)`), framed by a crisp 1px hairline border of `rgba(16, 185, 129, 0.2)`.
3. **Glass Tier 2 (Floating Action Docks & Badges):** Darker translucent capsule (`rgba(7, 14, 10, 0.85)` with `backdrop-filter: blur(24px)`), framed by `rgba(5, 223, 114, 0.28)`.
4. **Bioluminescent Overlays (Active & CTA Focus):** Solid primary buttons project an emerald corona: `box-shadow: 0 0 24px -2px rgba(5, 223, 114, 0.45)`. Neon headings project text glows: `text-shadow: 0 0 20px rgba(5, 223, 114, 0.5)`.

## Shapes

The interface balances sleek organic curvature with modular precision.

- **Primary Interactive Elements:** Standard cards and containers use level `2` rounding (`0.5rem` to `1rem` on larger cards), maintaining clean geometric corners that fit high-density dashboards and course paths.
- **Capsules & Badges:** Utility buttons, notification pills, language selectors, and floating bottom docks use full pill shapes (`rounded-full` / `9999px`) to create an aerodynamic, tactile aesthetic.

## Components

### Buttons
- **Primary CTA:** Solid neon fill (`#05DF72`) with ultra-dark obsidian typography (`#040806`, bold weight). Subtle rounded edges (`0.5rem` to `0.75rem`) accompanied by a continuous ambient green glow (`box-shadow: 0 0 20px rgba(5, 223, 114, 0.35)`). Hover elevates glow intensity.
- **Secondary / Ghost Button:** Dark translucent background (`rgba(16, 185, 129, 0.08)`) with a 1px border (`rgba(16, 185, 129, 0.3)`) and monospace light green text (`#A7F3D0`). Supports inline accessory tags (e.g., green "FREE" badge floating above top-right border).
- **Utility Buttons (Language Switcher / App Download):** Capsule pill shape with faint borders (`rgba(16, 185, 129, 0.25)`), glass backing, and inline iconography.

### Chips & Badges
- **Pill Status Badges:** Translucent dark green container with rounded-full pill styling. Incorporates a small glowing status dot (`#05DF72` with a `0 0 6px` shadow) followed by tracking-spaced text.
- **Micro Tags (e.g., "FREE"):** Vibrant solid emerald chip with dark miniature typography positioned at component perimeters to communicate value without interrupting flow.

### Navigation Dock (Floating Island)
- **Container:** Horizontally centered, fixed floating bar with full capsule geometry (`border-radius: 9999px`), frosted glass backplane (`rgba(9, 16, 12, 0.8)`), and border `rgba(16, 185, 129, 0.2)`.
- **Items:** Inline icon-plus-label pairs in muted sage (`#7E9E8C`), transitioning to solid highlighted emerald pills for the active panel.

### Cards & Modules
- **Frosted Glass Cards:** Applied to course tracks, founder testimonials, and statistic blocks. Features `backdrop-blur-md`, surface tones of `rgba(12, 23, 17, 0.55)`, hairline outer border of `rgba(16, 185, 129, 0.15)`, and interior padding of `1.5rem`.
- **Interactive Course Cards:** Hover activates a progressive border gradient brightening to `rgba(5, 223, 114, 0.6)` and an inner emerald atmospheric glow.

### Form Inputs & Checkboxes
- **Input Fields:** Obsidian container fill (`#070E0A`) with inset 1px borders (`rgba(16, 185, 129, 0.2)`). Focus state illuminates border to `#05DF72` with zero outer ring spread. Placeholder text styled in muted mint-gray.
- **Selection Controls:** Custom rounded checkboxes and radios utilizing neon emerald fill upon check with crisp contrasting tick marks.