# Personal Brand Kit Generator — Design Spec
Date: 2026-05-31

## Overview

Transform the existing gradient background generator into a **Personal Brand Kit Generator**: a two-layer, randomize-first design studio that produces platform-ready gradient assets for LinkedIn, Instagram, X/Twitter, and personal websites, plus an AI-ready `brand.md` prompt file — all exported as a single ZIP.

## Tech Stack

- **Vanilla HTML/CSS/JS** — no framework, no build step
- **JSZip** (CDN) — ZIP assembly
- **FileSaver.js** (CDN) — trigger browser download
- **Canvas 2D API** — off-screen rendering at native resolution
- **SVG feTurbulence** — noise/grain generation, composited onto canvas

## Design System

Neumorphism on `#E0E5EC` cool-grey surface.

**Typography**
- Display headings: Plus Jakarta Sans (700, 800)
- Body / UI labels: DM Sans (400, 500, 700)

**Shadows (rgba only — no opaque hex)**
- Extruded: `9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)`
- Extruded hover: `12px 12px 20px rgb(163,177,198,0.7), -12px -12px 20px rgba(255,255,255,0.6)`
- Inset: `inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255,0.5)`
- Inset deep: `inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)`

**Tokens**
- `--bg: #E0E5EC`
- `--text: #3D4852`
- `--text-muted: #6B7280`
- `--accent: #6C63FF`
- `--accent-light: #8B84FF`
- `--accent-teal: #38B2AC`
- `--radius-lg: 32px`
- `--radius-md: 16px`
- `--transition: 300ms ease-out`

## Layout — Design Studio

Full-viewport layout. Three regions:

```
┌─────────────────────────────────────────────┐
│  Brand Studio                  [✎ Customize] │  ← Header bar
├─────────────────────────────────────────────┤
│  [LinkedIn] [Instagram] [X] [Website]        │  ← Platform tabs
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         GRADIENT PREVIEW             │   │  ← Inset-deep canvas well
│  │              (hero)                  │   │
│  └──────────────────────────────────────┘   │
│                  ○ (profile ring)            │
│                                              │
│  [✦ Generate New Gradient]  [Export Kit ↓]  │  ← Action bar
└─────────────────────────────────────────────┘
```

**Customize drawer** slides in from the left (300ms ease-out) when the "✎ Customize" button is clicked. Main content area shrinks to accommodate it — no overlay, no modal. Drawer is dismissed by clicking ✕ or anywhere outside it.

## Two-Layer UX

### Layer 1 — Default (Randomize-first)

Visible at page load. Contains only:
- Platform tab selector (LinkedIn / Instagram / X / Website)
- Large gradient preview (inset-deep well, fills most of the viewport)
- Profile ring preview below the banner
- **"✦ Generate New Gradient"** — extruded hero button, full width, the primary CTA
- **"Export Brand Kit ↓"** — accent-filled button

### Layer 2 — Customize Drawer

Hidden by default. Slides in from left on "✎ Customize" click. Contains:

| Control | Detail |
|---|---|
| **Brand Colors** | 2–4 color stops. Each is an inset-deep well wrapping a native `input[type=color]`. A `×` badge removes a stop; `+` adds one (max 4). Stops are distributed evenly across the gradient automatically. |
| **Direction** | 8-button grid mapping to CSS keywords: `to right`, `to top right`, `to top`, `to top left`, `to left`, `to bottom left`, `to bottom`, `to bottom right`. Active button uses accent fill. |
| **Type** | 3-tab toggle: Linear / Radial / Conic. (`createConicGradient` is baseline-available in all modern browsers as of 2023; no polyfill needed.) |
| **Grain / Noise** | Slider 0–100%. Drives opacity of an SVG `feTurbulence` (fractalNoise, baseFrequency 0.75, 4 octaves) layer composited over the gradient via `ctx.drawImage`. Live preview in the canvas. Baked flat into all exported PNGs. |
| **Presets** | 12 curated gradients chosen for personal branding contexts (professional, bold, minimal, warm, monochrome). Clicking one loads its stops + direction into the active controls. |
| **Smart Random** | Generates a harmonious pair/trio using HSL analogous or split-complementary relationships — never truly random. Replaces current `Math.random()` hex approach. |

All drawer changes update the preview live.

## Platform Assets

| Platform | Asset | Dimensions |
|---|---|---|
| LinkedIn | Banner | 1584 × 396 px |
| LinkedIn | Profile ring | 800 × 800 px |
| Instagram | Story | 1080 × 1920 px |
| Instagram | Post | 1080 × 1080 px |
| Instagram | Profile ring | 800 × 800 px |
| X / Twitter | Header | 1500 × 500 px |
| X / Twitter | Profile ring | 400 × 400 px |
| Website | Hero | 1920 × 1080 px |
| Website | CSS file | `gradient.css` |

Profile rings are circular PNGs: gradient-filled circle with a transparent inner cutout (so they layer over a profile photo in any editor).

## Export

Clicking "Export Brand Kit" triggers:

1. Off-screen Canvas renders each asset at native resolution (gradient + noise composited).
2. JSZip assembles all files into folders.
3. FileSaver.js downloads `my-brand-kit.zip`.

### ZIP Structure

```
my-brand-kit.zip
├── linkedin/
│   ├── banner-1584x396.png
│   └── profile-ring-800x800.png
├── instagram/
│   ├── story-1080x1920.png
│   ├── post-1080x1080.png
│   └── profile-ring-800x800.png
├── twitter/
│   ├── header-1500x500.png
│   └── profile-ring-400x400.png
├── website/
│   ├── hero-1920x1080.png
│   └── gradient.css
└── brand.md
```

### gradient.css

```css
:root {
  --brand-color-1: #667eea;
  --brand-color-2: #f093fb;
  --brand-gradient: linear-gradient(to bottom right, #667eea, #f093fb);
}

.brand-gradient { background: var(--brand-gradient); }
.brand-hero     { background: var(--brand-gradient); min-height: 100vh; }
```

### brand.md

```markdown
# My Brand Gradient

## Palette
- Stop 1: #667eea — Indigo Blue
- Stop 2: #f093fb — Violet Pink
- Direction: to bottom right
- Grain: 32%

## CSS
background: linear-gradient(to bottom right, #667eea, #f093fb);

## CSS Variables
--brand-color-1: #667eea;
--brand-color-2: #f093fb;
--brand-gradient: linear-gradient(to bottom right, #667eea, #f093fb);
--brand-grain: 32%;

## AI Prompt
My personal brand uses a gradient from indigo (#667eea) to violet-pink (#f093fb),
applied diagonally (bottom-right) with 32% grain texture.

When generating visuals or copy for my brand:
- Use these exact hex values for color consistency
- Mood: modern, creative, tech-forward, distinctive
- The grain texture adds warmth and analogue depth
- Avoid flat, neon, or high-saturation interpretations
```

## Responsive Behaviour

- **Desktop (≥ 900px)**: Full studio layout as described above. Customize drawer is 280px wide; main canvas shrinks.
- **Tablet (600–899px)**: Drawer becomes a bottom sheet (slides up from bottom). Platform tabs scroll horizontally.
- **Mobile (< 600px)**: Single column. Preview stacks above the action bar. Drawer is full-screen overlay. Export button is sticky at the bottom.

## Accessibility

- All interactive elements have visible `focus-visible` rings: `outline: 2px solid #6C63FF; outline-offset: 4px`.
- Color picker wells are labelled with `aria-label="Color stop N"`.
- "Generate" and "Export" buttons have minimum 44×44px touch targets.
- Drawer has `role="dialog"` and traps focus while open.
- Noise slider uses `<input type="range">` with `aria-label="Grain intensity"` and a live `aria-valuetext`.

## Files Affected

```
index.html      — full rewrite (new markup structure)
style.css       — full rewrite (new design tokens + layout)
script.js       — full rewrite (Canvas API, JSZip, drawer logic, smart random)
```

No new external files needed beyond CDN imports for JSZip and FileSaver.js and Google Fonts (Plus Jakarta Sans, DM Sans).
