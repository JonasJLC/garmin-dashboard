---
name: Apex Performance
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e2bfb0'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a98a7d'
  outline-variant: '#5a4136'
  surface-tint: '#ffb693'
  primary: '#ffb693'
  on-primary: '#561f00'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#a04100'
  secondary: '#3fe87e'
  on-secondary: '#003918'
  secondary-container: '#00cb65'
  on-secondary-container: '#004f23'
  tertiary: '#adc6ff'
  on-tertiary: '#002e69'
  tertiary-container: '#5d97ff'
  on-tertiary-container: '#002f6a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#63ff94'
  secondary-fixed-dim: '#37e279'
  on-secondary-fixed: '#00210b'
  on-secondary-fixed-variant: '#005225'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004493'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-metrics:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for peak athletic performance and data-driven health monitoring. It targets serious athletes and fitness enthusiasts who require immediate, glanceable access to complex biometric data. 

The aesthetic is **Modern Corporate with a Technical Edge**, leaning into a rugged, high-performance "cockpit" feel. The UI should evoke feelings of precision, durability, and authority. Visuals are dominated by a dark environment to reduce eye strain during early morning or late-night training sessions. The style utilizes clean lines, subtle container separations, and a high-contrast functional color palette to ensure that critical performance metrics remain the primary focus.

## Colors

The palette is built on a "Deep Night" foundation to maximize the vibrancy of data visualizations. 

- **Foundation:** The base background uses `#121212`, with secondary surfaces at `#1A1A1A` to create subtle depth without relying on heavy shadows.
- **Action & Intensity:** High-visibility Orange (#FF6B00) is the primary action color and represents high-intensity zones or "Work" states.
- **Health & Recovery:** Performance Green (#00CC66) signifies optimal health, completed goals, and recovery states.
- **System & Utility:** Garmin Blue (#007AFF) is reserved for connectivity, technology syncs, and secondary information.
- **Neutral Accents:** Grays are cool-toned to maintain a technical, metallic feel.

## Typography

This design system uses a dual-font approach to balance readability with a technical spirit. 

**Hanken Grotesk** is used for all primary UI elements, headlines, and body text. Its sharp, contemporary geometry provides the "premium gear" feel required. 

**JetBrains Mono** is utilized for labels, data points, and timestamps. The monospaced nature ensures that changing numerical values (like heart rate or pace) do not cause layout shifts and reinforces the feeling of a precision instrument.

Use `display-metrics` for hero data points like daily steps or current heart rate. Use `label-caps` for section headers and category tags.

## Layout & Spacing

The system follows a strict **4px grid** to maintain mathematical alignment. 

- **Layout Model:** A fluid 12-column grid is used for desktop, collapsing to a single column for mobile. 
- **Content Grouping:** Data is organized into "Glances" (cards). Horizontal spacing between cards (gutters) is fixed at 16px.
- **Density:** High information density is preferred. Use `md` (16px) padding inside cards for primary data and `sm` (8px) for condensed lists or secondary metrics.

## Elevation & Depth

Elevation is achieved through **Tonal Layering** rather than traditional shadows. This maintains a flat, rugged appearance suitable for outdoor/athletic contexts.

- **Level 0 (Base):** `#121212` – The background of the entire application.
- **Level 1 (Cards):** `#1A1A1A` – The primary surface for data widgets.
- **Level 2 (Interactions):** `#242424` – Used for hover states or active input fields.
- **Outlines:** Subtle `1px` borders using `#2D2D2D` are used on cards to provide definition against the dark background. No drop shadows should be applied to cards. 
- **Overlays:** Use a 60% black tint with a 12px background blur for modals to maintain context of the dashboard underneath.

## Shapes

The shape language is **Soft-Industrial**. 

- **Primary Radius:** 4px (`0.25rem`) for cards and input fields. This provides a structural, "built-to-last" feel.
- **Large Radius:** 8px (`0.5rem`) for secondary buttons or large container modules.
- **Circular:** Indicators such as heart rate zones, progress rings, and user avatars remain fully circular to contrast against the rectangular grid.

## Components

- **Primary Buttons:** High-visibility Orange background with black text. 4px border radius.
- **Data Cards (Glances):** `#1A1A1A` background, 1px `#2D2D2D` border. Title in `label-caps` at the top left. Primary metric in `display-metrics`.
- **Status Indicators:** 
    - **Stress:** Uses a segmented bar chart (Amber for high, Blue for low).
    - **Body Battery:** A fluid line graph with a Performance Green gradient fill.
    - **Activity Chips:** Small, semi-transparent pills (e.g., "Running" with an orange left-border).
- **Progress Bars:** Dual-track bars. The track is `#2D2D2D`, and the progress fill uses the functional color (Green for goals, Blue for sync).
- **Input Fields:** Ghost style. No background, 1px gray border, turning Orange on focus.
- **Lists:** Flat lists with 1px bottom separators. High-contrast white text for primary labels, muted gray for secondary metadata.