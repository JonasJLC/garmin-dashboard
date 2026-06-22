# Plan: Apex Performance Dashboard Redesign

## Context

The Garmin dashboard currently uses a basic dark-green theme with a single-page layout. The `design/` folder contains a complete design system spec (`apex_performance/DESIGN.md`) and three fully-specced page designs (`activity_overview`, `health_metrics`, `training_status`). This plan migrates the frontend to match those designs: new color tokens, typography, layout shell, routing, and three distinct pages of health/training data visualisation.

---

## Step 1 — Dependencies & Fonts

**Package changes (`package.json`):**
- Add `react-router-dom@^7` (routing for 3 pages)
- No other runtime dependencies needed; Recharts handles all charts

**`index.html` changes:**
- Replace Inter Google Font link with Hanken Grotesk + JetBrains Mono
- Add Material Symbols Outlined icon font (CDN — same approach as design HTML files)
- Remove the theme-detection no-flash `<script>` block (dark-only app, no toggle needed)

```html
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

---

## Step 2 — Design System (atomic, do first)

### `tailwind.config.ts` — full replace

Replace the current HSL-variable color system with the Apex flat-hex token map. The two systems cannot safely coexist.

Key changes:
- Remove `darkMode: ['class']` (always dark)
- Replace font family: `sans: ['Hanken Grotesk', ...]`, add `mono: ['JetBrains Mono', ...]`
- Replace all colors with flat hex tokens:

```ts
colors: {
  background: '#121212',
  surface: '#131313',
  'surface-dim': '#131313',
  'surface-bright': '#393939',
  'surface-container-lowest': '#0e0e0e',
  'surface-container-low': '#1a1919',
  'surface-container': '#1a1a1a',
  'surface-container-high': '#242424',
  'surface-container-highest': '#353534',
  'on-background': '#e5e2e1',
  'on-surface': '#e5e2e1',
  'on-surface-variant': '#e2bfb0',
  primary: '#ffb693',
  'primary-container': '#ff6b00',
  'primary-fixed': '#ffdbcc',
  'on-primary': '#541900',
  'on-primary-container': '#000000',
  secondary: '#3fe87e',
  'secondary-container': '#00cb65',
  'secondary-fixed': '#63ff94',
  'on-secondary': '#003919',
  tertiary: '#adc6ff',
  'tertiary-container': '#5d97ff',
  'tertiary-fixed': '#d8e2ff',
  error: '#ffb4ab',
  'error-container': '#93000a',
  outline: '#2D2D2D',
  'outline-variant': '#5a4136',
}
```

- Replace border radius tokens: `sm: '0.125rem'`, `DEFAULT: '0.125rem'`, `lg: '0.25rem'`, `xl: '0.5rem'`, `full: '0.75rem'`
- Add spacing tokens: `xs: '4px'`, `sm: '8px'`, `md: '16px'`, `lg: '24px'`, `xl: '40px'`, `gutter: '16px'`, `margin-desktop: '32px'`
- Add typography utilities via `addUtilities` plugin:
  - `.text-display-metrics`: 48px / 56px, 700, -0.02em
  - `.text-headline-lg`: 32px / 40px, 600
  - `.text-headline-md`: 20px / 28px, 600
  - `.text-label-caps`: 12px / 16px, 500, JetBrains Mono, 0.05em tracking
  - `.text-data-mono`: 14px / 20px, 400, JetBrains Mono
- Keep `fade-in-up` animation

### `src/index.css` — full replace

Remove all HSL `:root` / `.dark` variable blocks. Replace with:
- Tailwind directives only
- Custom scrollbar styles (6px, `#121212` track, `#2D2D2D` thumb)
- `.glass-card` utility: `background: linear-gradient(145deg, #1A1A1A, #131313); border: 1px solid #2D2D2D`
- `.performance-gradient`: `background: linear-gradient(180deg, #3fe87e 0%, #00cb65 100%)`
- `body` defaults: `background-color: #121212; color: #e5e2e1`

### `src/main.tsx` — update wrapper

Change the root div classes from `bg-background text-foreground font-sans` → `bg-background text-on-background font-sans` (new token names). Remove `ThemeProvider` wrapper if present. Wrap with `<BrowserRouter>` from react-router-dom.

---

## Step 3 — New Zod Schemas

Append to `src/features/garmin/schemas.ts` (keep all existing schemas unchanged):

```ts
// Body battery + stress (per-day)
export const BodyBatterySchema = z.object({
  date: z.string(),
  level: z.number().int().min(0).max(100),        // current level 0–100
  maxLevel: z.number().int().min(0).max(100).optional(),
  drainRate: z.number().optional(),               // units/hr
  stressAvg: z.number().int().min(0).max(100).optional(),
})
export type BodyBattery = z.infer<typeof BodyBatterySchema>
export const BodyBatteryListSchema = z.array(BodyBatterySchema)

// Sleep stages (per-day)
export const SleepSummarySchema = z.object({
  date: z.string(),
  score: z.number().int().min(0).max(100).optional(),
  totalMinutes: z.number().nonnegative().optional(),
  deepMinutes: z.number().nonnegative().optional(),
  lightMinutes: z.number().nonnegative().optional(),
  remMinutes: z.number().nonnegative().optional(),
})
export type SleepSummary = z.infer<typeof SleepSummarySchema>
export const SleepSummaryListSchema = z.array(SleepSummarySchema)

// Biometrics (per-day: SpO2, respiration, VO2 max)
export const BiometricSummarySchema = z.object({
  date: z.string(),
  spo2Pct: z.number().min(0).max(100).optional(),      // pulse ox %
  respirationBrpm: z.number().positive().optional(),    // breaths/min
  vo2MaxMlKgMin: z.number().positive().optional(),      // VO2 max
  recoveryTimeHrs: z.number().nonnegative().optional(), // recovery hours
})
export type BiometricSummary = z.infer<typeof BiometricSummarySchema>
export const BiometricSummaryListSchema = z.array(BiometricSummarySchema)

// Training load (per-day)
export const TrainingLoadSchema = z.object({
  date: z.string(),
  acuteLoad: z.number().nonnegative().optional(),
  chronicLoad: z.number().nonnegative().optional(),
  anaerobicLoad: z.number().nonnegative().optional(),
  highAerobicLoad: z.number().nonnegative().optional(),
  lowAerobicLoad: z.number().nonnegative().optional(),
  trainingStatus: z.string().optional(),               // "Productive", "Maintaining", etc.
})
export type TrainingLoad = z.infer<typeof TrainingLoadSchema>
export const TrainingLoadListSchema = z.array(TrainingLoadSchema)
```

New JSON file per type, e.g. `body-battery.json`, `sleep-summary.json`, `biometrics.json`, `training-load.json` — same pattern as existing `activities.json`.

---

## Step 4 — Data Fetchers & Insights

### `src/features/garmin/data.ts`

Add three new fetch functions (same pattern as existing `fetchHeartRateSummaries`):
- `fetchBodyBattery(): Promise<BodyBattery[]>`
- `fetchSleepSummaries(): Promise<SleepSummary[]>`
- `fetchBiometrics(): Promise<BiometricSummary[]>`
- `fetchTrainingLoad(): Promise<TrainingLoad[]>`

### `src/features/garmin/insights.ts`

Add pure functions:
- `buildTrainingReadiness(bb: BodyBattery[], sleep: SleepSummary[])` → score 0–100, label, fatigue, sleepHistory
- `buildTrainingStatus(load: TrainingLoad[])` → status label, acuteLoad7d, loadFocus breakdown
- `buildHealthKpis(bio: BiometricSummary[])` → latest SpO2, respiration, VO2 max, recovery hours

---

## Step 5 — Mock Data Extensions

`backend/scripts/generate_mock_data.py` — extend to write 4 new JSON files per date range (same 30-day deterministic pattern):
- `body-battery.json` — daily level 60–95, stress 15–45, drain rate 5–8
- `sleep-summary.json` — score 70–95, stages ~7h42m total split ~20% deep / 50% light / 30% REM
- `biometrics.json` — SpO2 95–99%, respiration 13–16 brpm, VO2 max 58–65, recovery 14–24 hrs
- `training-load.json` — acute 500–900, anaerobic/aerobic splits, status cycling through ["Productive", "Maintaining", "Peaking"]

---

## Step 6 — App Shell (Layout + Routing)

### New files

**`src/components/layout/AppHeader.tsx`**
- Fixed 64px, `bg-surface-container-lowest border-b border-outline`
- Left: "APEX PERFORMANCE" in `text-primary text-headline-md font-bold`
- Center: search input (hidden on mobile)
- Right: Material Symbols icons (sync, notifications, settings) + 8×8 avatar with ring

**`src/components/layout/Sidebar.tsx`**
- `hidden md:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-surface-container-lowest border-r border-outline`
- Nav items: Overview, Health, Training, Profile — active state: `bg-surface-container-high border-l-4 border-primary-container`
- Uses React Router `<NavLink>` for active detection
- Bottom section: support + logout links

**`src/components/layout/MobileNav.tsx`**
- `md:hidden fixed bottom-0 w-full h-16 bg-surface-container-lowest border-t border-outline`
- 4 nav items with icon + label-caps text

**`src/components/layout/AppShell.tsx`**
- Composes Header + Sidebar + main content area with `md:ml-64 pt-16` offset
- Renders `<Outlet />` from React Router

### `src/main.tsx` — add Router

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// wrap root with BrowserRouter, add Routes inside AppShell
```

### Router config

```
/ → redirect to /overview
/overview → ActivityOverviewPage
/health → HealthMetricsPage
/training → TrainingStatusPage
```

---

## Step 7 — New Reusable Components

**`src/components/charts/CircularGauge.tsx`**
- Props: `score: number`, `label: string`, `color: string`
- SVG circle with stroke-dasharray/dashoffset for progress arc
- Center overlay: score in `text-display-metrics`, label in `text-label-caps`
- Reused in: Activity Overview (Training Readiness card)

**`src/components/charts/DialGauge.tsx`**
- Semi-circle dial (half arc) — custom CSS/SVG approach matching design
- Props: `value: number`, `label: string`, `sublabel: string`
- Scale labels: Fair / Good / Elite
- Reused in: Training Status (VO2 Max)

**`src/components/charts/SparklineBars.tsx`**
- Props: `data: number[]`, `color: string`
- 5 vertical bars with proportional heights
- Reused in: Body Battery card

**`src/components/charts/StackedBar.tsx`**
- Horizontal stacked bar
- Props: `segments: Array<{ value: number; color: string; label: string }>`
- Reused in: Sleep Analysis card

**`src/components/charts/LoadBarChart.tsx`**
- Recharts BarChart with custom optimal-zone overlay (two dashed horizontal reference lines)
- Props: `data: Array<{ day: string; load: number }>`, `optimalMin: number`, `optimalMax: number`
- Reused in: Training Status (Acute Load)

**`src/components/ui/GlanceCard.tsx`**
- Base card wrapper: `bg-surface-container border border-outline rounded-xl p-lg`
- Replaces existing `Card` from shadcn for new designs
- Existing `card.tsx` kept for backward compat during transition

**`src/components/ui/ProgressBar.tsx`**
- Props: `value: number`, `max: number`, `color: string`
- `h-2 bg-surface-container-high rounded-full` track with colored fill
- Reused in: Recovery Time, Load Focus, Respiration, Pulse Ox, VO2 Max widget cards

---

## Step 8 — Pages

### `src/pages/ActivityOverviewPage.tsx`
New file — uses data from all existing fetchers + new ones. Components:
- Dashboard header (headline + sync time + START ACTIVITY button)
- `<CircularGauge>` in Training Readiness `<GlanceCard>` (col-span-8)
- Recovery Time `<GlanceCard>` with left-border accent (col-span-4)
- 3-col metrics grid: Body Battery / Stress / Sleep `<GlanceCard>` with `<SparklineBars>`
- Activities list (`<ActivityItem>` reused from existing `activity-item.tsx`)

### `src/pages/HealthMetricsPage.tsx`
New file. Components:
- 7 DAYS / 30 DAYS toggle (local state, drives data slice)
- Body Battery vs Stress Recharts `<LineChart>` with dual `<Line>` + `<Area>` (gradient fill on battery line)
- Heart Rate `<GlanceCard>` (col-span-7): Recharts `<BarChart>` with conditional bar fill
- Sleep Analysis `<GlanceCard>` (col-span-5): `<StackedBar>` + stage breakdown grid
- 3 small widget cards: Respiration / Pulse Ox / VO2 Max with `<ProgressBar>`
- Daily Log `<table>` with export button

### `src/pages/TrainingStatusPage.tsx`
New file. Components:
- Training Status `<GlanceCard>` (col-span-8): `<DialGauge>` + status text + recovery/load metrics
- Race Predictor `<GlanceCard>` (col-span-4): flat list with `data-mono` times
- `<LoadBarChart>` (col-span-6)
- Load Focus `<GlanceCard>` (col-span-6): 3× `<ProgressBar>` with labels and targets

---

## Step 9 — Cleanup

- Delete `src/components/ui/theme-toggle.tsx`
- Delete `src/App.tsx` (replaced by pages + AppShell)
- Remove `src/components/dashboard/insight-banner.tsx` (replaced by Activity Overview header)
- Keep `src/components/dashboard/stat-card.tsx` and `activity-item.tsx` — reused in pages

---

## Verification

1. `pnpm install` — installs react-router-dom, no lockfile errors
2. `pnpm typecheck` — zero errors across all new schemas, fetchers, pages
3. `pnpm test` — existing 14 tests still pass (schemas/data/insights untouched)
4. `pnpm dev` — navigate to `/`, `/overview`, `/health`, `/training` all render
5. Visual check:
   - Sidebar visible at ≥768px, bottom nav visible at <768px
   - CircularGauge renders arc at correct offset for score 84
   - DialGauge renders semi-circle for VO2 max 54
   - Sleep stages stacked bar adds up to 100%
   - Load bar chart shows green optimal-zone overlay
6. `pnpm build` — dist builds without errors
