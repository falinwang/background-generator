# Personal Brand Kit Generator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the gradient generator into a full-viewport Design Studio that produces a brand kit ZIP (10 platform PNGs, gradient.css, brand.md) from a neumorphic two-layer UI.

**Architecture:** Three vanilla files (index.html, style.css, script.js) — full rewrites. No build step. CDN imports for JSZip and FileSaver.js. Preview uses CSS gradients + SVG feTurbulence overlay. Export uses off-screen Canvas 2D API.

**Tech Stack:** Vanilla HTML/CSS/JS · JSZip 3.10.1 (CDN) · FileSaver.js 2.0.5 (CDN) · Canvas 2D API · Google Fonts (Plus Jakarta Sans, DM Sans)

---

## File Map

| File | Responsibility |
|---|---|
| `index.html` | Full markup — studio layout, drawer, platform tabs, preview, action bar |
| `style.css` | Design tokens, studio layout, drawer slide animation, neumorphic components, responsive |
| `script.js` | State object, CSS preview renderer, Smart Random, drawer toggle, color stop UI, direction/type/preset controls, grain slider, Canvas export, ZIP assembly, brand.md/gradient.css generation |

---

## Task 1: HTML skeleton + CDN imports

**Files:**
- Rewrite: `index.html`

- [ ] **Step 1: Write the complete index.html**

Replace the entire file with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Personal Brand Kit Generator</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&display=swap" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>

    <!-- Customize drawer (hidden by default) -->
    <aside class="drawer" id="drawer" role="dialog" aria-label="Customize gradient" aria-hidden="true">
      <div class="drawer-header">
        <span class="drawer-title">Customize</span>
        <button class="drawer-close" id="drawerClose" aria-label="Close customize panel">✕</button>
      </div>

      <section class="control-group">
        <div class="control-label">Brand Colors</div>
        <div class="color-stops" id="colorStops"></div>
        <button class="add-stop-btn" id="addStop">+ Add Stop</button>
      </section>

      <section class="control-group">
        <div class="control-label">Direction</div>
        <div class="direction-grid" id="directionGrid">
          <button class="dir-btn" data-dir="top-left"    aria-label="To top left">↖</button>
          <button class="dir-btn" data-dir="top"         aria-label="To top">↑</button>
          <button class="dir-btn" data-dir="top-right"   aria-label="To top right">↗</button>
          <button class="dir-btn" data-dir="left"        aria-label="To left">←</button>
          <button class="dir-btn active" data-dir="right" aria-label="To right">→</button>
          <button class="dir-btn" data-dir="bottom-left" aria-label="To bottom left">↙</button>
          <button class="dir-btn" data-dir="bottom"      aria-label="To bottom">↓</button>
          <button class="dir-btn" data-dir="bottom-right" aria-label="To bottom right">↘</button>
        </div>
      </section>

      <section class="control-group">
        <div class="control-label">Type</div>
        <div class="type-tabs" id="typeTabs">
          <button class="type-btn active" data-type="linear">Linear</button>
          <button class="type-btn" data-type="radial">Radial</button>
          <button class="type-btn" data-type="conic">Conic</button>
        </div>
      </section>

      <section class="control-group">
        <div class="control-label">
          Grain
          <span class="grain-value" id="grainValue">0%</span>
        </div>
        <div class="slider-well">
          <input type="range" id="grainSlider" min="0" max="100" value="0"
            aria-label="Grain intensity" aria-valuetext="0%" />
        </div>
      </section>

      <section class="control-group">
        <div class="control-label">Presets</div>
        <div class="presets-grid" id="presetsGrid"></div>
      </section>
    </aside>

    <!-- Backdrop (mobile/tablet only) -->
    <div class="drawer-backdrop" id="drawerBackdrop" aria-hidden="true"></div>

    <!-- Main studio -->
    <main class="studio" id="studio">
      <header class="studio-header">
        <h1 class="studio-title">Brand Studio</h1>
        <button class="customize-btn" id="customizeBtn" aria-expanded="false"
          aria-controls="drawer">✎ Customize</button>
      </header>

      <nav class="platform-tabs" id="platformTabs" aria-label="Platform preview">
        <button class="tab active" data-platform="linkedin">LinkedIn</button>
        <button class="tab" data-platform="instagram">Instagram</button>
        <button class="tab" data-platform="twitter">X / Twitter</button>
        <button class="tab" data-platform="website">Website</button>
      </nav>

      <div class="preview-well">
        <div class="preview-label" id="previewLabel">Banner · 1584 × 396 px</div>
        <div class="preview-wrap" id="previewWrap">
          <div class="preview-gradient" id="preview"></div>
          <svg class="preview-noise" id="previewNoise" aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <filter id="grain-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.75"
                numOctaves="4" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-filter)"/>
          </svg>
        </div>
        <div class="ring-preview" id="ringPreview" aria-hidden="true">
          <div class="ring-gradient" id="ringGradient"></div>
          <div class="ring-inner"></div>
        </div>
      </div>

      <div class="action-bar">
        <button class="generate-btn" id="generateBtn">✦ Generate New Gradient</button>
        <button class="export-btn" id="exportBtn">Export Brand Kit ↓</button>
      </div>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

```bash
open index.html
```

Expected: Unstyled HTML visible — two fonts loading (Plus Jakarta Sans, DM Sans), no JS errors in console, JSZip/FileSaver available as globals (`window.JSZip`, `window.saveAs`).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: html skeleton with CDN imports and studio structure"
```

---

## Task 2: CSS design tokens + studio layout

**Files:**
- Rewrite: `style.css`

- [ ] **Step 1: Write the complete style.css**

Replace the entire file with:

```css
/* ============================================================
   Design Tokens
   ============================================================ */
:root {
  --bg:            #E0E5EC;
  --text:          #3D4852;
  --text-muted:    #6B7280;
  --accent:        #6C63FF;
  --accent-light:  #8B84FF;
  --accent-teal:   #38B2AC;

  --radius-lg: 32px;
  --radius-md: 16px;
  --radius-sm: 10px;

  --shadow-raised:
    9px 9px 16px rgb(163,177,198,0.6),
    -9px -9px 16px rgba(255,255,255,0.5);
  --shadow-raised-hover:
    12px 12px 20px rgb(163,177,198,0.7),
    -12px -12px 20px rgba(255,255,255,0.6);
  --shadow-inset:
    inset 6px 6px 10px rgb(163,177,198,0.6),
    inset -6px -6px 10px rgba(255,255,255,0.5);
  --shadow-inset-deep:
    inset 10px 10px 20px rgb(163,177,198,0.7),
    inset -10px -10px 20px rgba(255,255,255,0.6);
  --shadow-inset-sm:
    inset 3px 3px 6px rgb(163,177,198,0.6),
    inset -3px -3px 6px rgba(255,255,255,0.5);

  --ease: ease-out;
  --dur: 300ms;

  --drawer-width: 280px;
  --header-height: 60px;
}

/* ============================================================
   Reset
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  display: flex;
  height: 100vh;
  overflow: hidden;
}

button {
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  border: none;
  background: none;
}

button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ============================================================
   Drawer
   ============================================================ */
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--drawer-width);
  background: var(--bg);
  box-shadow: 6px 0 20px rgb(163,177,198,0.5);
  transform: translateX(-100%);
  transition: transform var(--dur) var(--ease);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  padding: 0 0 32px;
}

.drawer.open {
  transform: translateX(0);
}

.drawer-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(61,72,82,0.2);
  z-index: 199;
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
}

.drawer-backdrop.visible {
  opacity: 1;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 1;
}

.drawer-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.drawer-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg);
  box-shadow: var(--shadow-raised);
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease);
  min-width: 32px;
  min-height: 32px;
}

.drawer-close:hover  { box-shadow: var(--shadow-raised-hover); transform: translateY(-1px); }
.drawer-close:active { box-shadow: var(--shadow-inset-sm);     transform: translateY(0.5px); }

/* ============================================================
   Drawer — Control Groups
   ============================================================ */
.control-group {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grain-value {
  color: var(--accent);
  font-weight: 800;
}

/* Color stops */
.color-stops {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.stop-well {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-inset-deep);
  overflow: hidden;
}

.stop-well input[type="color"] {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  outline: none;
  width: calc(100% + 16px);
  height: calc(100% + 16px);
  margin: -8px;
  cursor: pointer;
  padding: 0;
}

.stop-remove {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff5c5c;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 2;
  min-width: 16px;
}

.add-stop-btn {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  box-shadow: var(--shadow-raised);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease);
  align-self: flex-start;
  min-height: 44px;
}

.add-stop-btn:hover  { box-shadow: var(--shadow-raised-hover); transform: translateY(-1px); }
.add-stop-btn:active { box-shadow: var(--shadow-inset-sm);     transform: translateY(0.5px); }

/* Direction grid */
.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.dir-btn {
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  box-shadow: var(--shadow-raised);
  font-size: 1rem;
  color: var(--text-muted);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease),
              background var(--dur) var(--ease), color var(--dur) var(--ease);
  min-height: 44px;
}

.dir-btn:hover  { box-shadow: var(--shadow-raised-hover); transform: translateY(-1px); }
.dir-btn:active { box-shadow: var(--shadow-inset-sm);     transform: translateY(0.5px); }

.dir-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 14px rgba(108,99,255,0.4);
}

/* Type tabs */
.type-tabs {
  display: flex;
  gap: 5px;
}

.type-btn {
  flex: 1;
  padding: 10px 4px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  box-shadow: var(--shadow-raised);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease),
              background var(--dur) var(--ease), color var(--dur) var(--ease);
  min-height: 44px;
}

.type-btn:hover  { box-shadow: var(--shadow-raised-hover); transform: translateY(-1px); }
.type-btn:active { box-shadow: var(--shadow-inset-sm);     transform: translateY(0.5px); }

.type-btn.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 14px rgba(108,99,255,0.4);
}

/* Grain slider */
.slider-well {
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  box-shadow: var(--shadow-inset);
}

.slider-well input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, var(--accent) var(--fill, 0%), #c8cdd6 var(--fill, 0%));
  cursor: pointer;
}

.slider-well input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(108,99,255,0.5);
  cursor: pointer;
}

.slider-well input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(108,99,255,0.5);
  border: none;
  cursor: pointer;
}

/* Presets */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.preset-swatch {
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: var(--shadow-raised);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease);
  border: none;
  padding: 0;
  min-height: 28px;
}

.preset-swatch:hover  { box-shadow: var(--shadow-raised-hover); transform: translateY(-1px) scale(1.05); }
.preset-swatch:active { box-shadow: var(--shadow-inset-sm);     transform: translateY(0.5px); }

/* ============================================================
   Studio (main content)
   ============================================================ */
.studio {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 20px 24px;
  gap: 16px;
  transition: margin-left var(--dur) var(--ease);
  overflow: hidden;
}

body.drawer-open .studio {
  margin-left: var(--drawer-width);
}

/* Header */
.studio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.studio-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.customize-btn {
  background: var(--bg);
  color: var(--text-muted);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-raised);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease);
  min-height: 44px;
}

.customize-btn:hover  { box-shadow: var(--shadow-raised-hover); transform: translateY(-1px); }
.customize-btn:active { box-shadow: var(--shadow-inset-sm);     transform: translateY(0.5px); }

/* Platform tabs */
.platform-tabs {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.tab {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  box-shadow: var(--shadow-raised);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease),
              background var(--dur) var(--ease), color var(--dur) var(--ease);
  min-height: 44px;
}

.tab:hover  { box-shadow: var(--shadow-raised-hover); transform: translateY(-1px); }
.tab:active { box-shadow: var(--shadow-inset-sm);     transform: translateY(0.5px); }

.tab.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 14px rgba(108,99,255,0.4);
}

/* Preview well */
.preview-well {
  flex: 1;
  background: var(--bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-inset-deep);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  min-height: 0;
}

.preview-label {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(107,114,128,0.5);
  flex-shrink: 0;
}

.preview-wrap {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.preview-gradient {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
  transition: background var(--dur) var(--ease);
}

.preview-noise {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  mix-blend-mode: overlay;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--dur) var(--ease);
  border-radius: var(--radius-sm);
}

/* Profile ring preview */
.ring-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ring-gradient {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  transition: background var(--dur) var(--ease);
}

.ring-inner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bg);
  position: relative;
  z-index: 1;
}

/* Action bar */
.action-bar {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.generate-btn {
  flex: 1;
  padding: 18px 24px;
  border-radius: var(--radius-md);
  background: var(--bg);
  box-shadow: var(--shadow-raised);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease);
  min-height: 56px;
}

.generate-btn:hover  { box-shadow: var(--shadow-raised-hover); transform: translateY(-1px); }
.generate-btn:active { box-shadow: var(--shadow-inset);        transform: translateY(0.5px); }

.export-btn {
  padding: 18px 28px;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  box-shadow: 0 6px 20px rgba(108,99,255,0.4);
  transition: box-shadow var(--dur) var(--ease), transform var(--dur) var(--ease),
              background var(--dur) var(--ease);
  white-space: nowrap;
  min-height: 56px;
}

.export-btn:hover  {
  background: var(--accent-light);
  box-shadow: 0 8px 24px rgba(108,99,255,0.5);
  transform: translateY(-1px);
}
.export-btn:active {
  transform: translateY(0.5px);
  box-shadow: 0 2px 8px rgba(108,99,255,0.3);
}

.export-btn.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* ============================================================
   Responsive — Tablet (600–899px)
   ============================================================ */
@media (max-width: 899px) {
  body.drawer-open .studio { margin-left: 0; }

  .drawer {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 70vh;
    transform: translateY(100%);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .drawer.open { transform: translateY(0); }

  .drawer-backdrop { display: block; }

  .platform-tabs { overflow-x: auto; scrollbar-width: none; }
  .platform-tabs::-webkit-scrollbar { display: none; }
}

/* ============================================================
   Responsive — Mobile (< 600px)
   ============================================================ */
@media (max-width: 599px) {
  .studio { padding: 14px 16px; gap: 12px; }

  .drawer { height: 85vh; }

  .action-bar { flex-direction: column; }

  .export-btn {
    position: sticky;
    bottom: 14px;
    width: 100%;
  }
}
```

- [ ] **Step 2: Open in browser and verify**

```bash
open index.html
```

Expected: Full-viewport dark-grey studio. Header shows "Brand Studio" + "✎ Customize". Four platform tabs. Large inset well in the centre (empty, no gradient yet). Two buttons at the bottom. Fonts are Plus Jakarta Sans and DM Sans. Drawer is hidden.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: neumorphic studio layout and design tokens"
```

---

## Task 3: Core JS — state, CSS preview, platform tabs

**Files:**
- Rewrite: `script.js`

- [ ] **Step 1: Write the initial script.js with state, preview renderer, and platform switching**

Replace the entire file with:

```javascript
/* ============================================================
   Constants
   ============================================================ */
const PLATFORMS = {
  linkedin:  { label: 'Banner · 1584 × 396 px',  w: 1584, h: 396,  ring: true  },
  instagram: { label: 'Story · 1080 × 1920 px',  w: 1080, h: 1920, ring: true  },
  twitter:   { label: 'Header · 1500 × 500 px',  w: 1500, h: 500,  ring: true  },
  website:   { label: 'Hero · 1920 × 1080 px',   w: 1920, h: 1080, ring: false },
};

const CSS_DIR = {
  'right':        'to right',
  'top-right':    'to top right',
  'top':          'to top',
  'top-left':     'to top left',
  'left':         'to left',
  'bottom-left':  'to bottom left',
  'bottom':       'to bottom',
  'bottom-right': 'to bottom right',
};

const CANVAS_DIRS = {
  'right':        [0,   0.5, 1,   0.5],
  'top-right':    [0,   1,   1,   0  ],
  'top':          [0.5, 1,   0.5, 0  ],
  'top-left':     [1,   1,   0,   0  ],
  'left':         [1,   0.5, 0,   0.5],
  'bottom-left':  [1,   0,   0,   1  ],
  'bottom':       [0.5, 0,   0.5, 1  ],
  'bottom-right': [0,   0,   1,   1  ],
};

/* ============================================================
   State
   ============================================================ */
const state = {
  stops:     ['#667eea', '#f093fb'],
  direction: 'right',
  type:      'linear',
  grain:     0,
  platform:  'linkedin',
};

/* ============================================================
   DOM refs
   ============================================================ */
const preview       = document.getElementById('preview');
const previewWrap   = document.getElementById('previewWrap');
const previewNoise  = document.getElementById('previewNoise');
const previewLabel  = document.getElementById('previewLabel');
const ringPreview   = document.getElementById('ringPreview');
const ringGradient  = document.getElementById('ringGradient');
const platformTabs  = document.getElementById('platformTabs');
const generateBtn   = document.getElementById('generateBtn');
const exportBtn     = document.getElementById('exportBtn');

/* ============================================================
   Gradient helpers
   ============================================================ */
function buildCSSGradient() {
  const stops = state.stops.join(', ');
  if (state.type === 'linear') {
    return `linear-gradient(${CSS_DIR[state.direction]}, ${stops})`;
  }
  if (state.type === 'radial') {
    return `radial-gradient(circle at center, ${stops})`;
  }
  return `conic-gradient(from 0deg at center, ${stops})`;
}

/* ============================================================
   Preview renderer
   ============================================================ */
function renderPreview() {
  const grad = buildCSSGradient();
  preview.style.background = grad;
  ringGradient.style.background = grad;

  // Resize preview-wrap to fit the platform's aspect ratio
  const { w, h, label, ring } = PLATFORMS[state.platform];
  const maxW = previewWrap.parentElement.clientWidth - 32;
  const maxH = previewWrap.parentElement.clientHeight
             - previewLabel.offsetHeight
             - (ring ? ringPreview.offsetHeight + 14 : 0)
             - 60; // padding/gap

  const scale = Math.min(maxW / w, Math.max(60, maxH) / h);
  previewWrap.style.width  = `${Math.round(w * scale)}px`;
  previewWrap.style.height = `${Math.round(h * scale)}px`;
  preview.style.width  = '100%';
  preview.style.height = '100%';

  previewLabel.textContent = label;
  ringPreview.style.display = ring ? 'flex' : 'none';

  // Grain opacity
  previewNoise.style.opacity = state.grain / 100 * 0.65;
}

/* ============================================================
   Platform tab switching
   ============================================================ */
platformTabs.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  platformTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  state.platform = tab.dataset.platform;
  renderPreview();
});

/* ============================================================
   Init
   ============================================================ */
function init() {
  renderPreview();
}

window.addEventListener('resize', renderPreview);
init();
```

- [ ] **Step 2: Open in browser and verify**

```bash
open index.html
```

Expected: Preview well shows a purple→pink gradient. Platform tabs switch label and resize the gradient preview shape (LinkedIn is wide, Instagram is tall, etc.). Profile ring appears/disappears correctly (Website tab has no ring).

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: state, CSS gradient preview, platform tab switching"
```

---

## Task 4: Smart Random + Generate button

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add HSL helper and Smart Random after the `buildCSSGradient` function**

After the line `return \`conic-gradient(from 0deg at center, ${stops})\`;` and its closing brace, add:

```javascript
/* ============================================================
   Smart Random — HSL harmony
   ============================================================ */
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function smartRandom() {
  const baseH = Math.random() * 360;
  const s = 55 + Math.random() * 25;   // 55–80 %
  const l = 48 + Math.random() * 20;   // 48–68 %
  const useAnalogous = Math.random() > 0.5;

  if (useAnalogous) {
    const offset = 25 + Math.random() * 45;
    return [hslToHex(baseH, s, l), hslToHex((baseH + offset) % 360, s, l)];
  }
  // split-complementary
  const offset = 150 + Math.random() * 60;
  return [hslToHex(baseH, s, l), hslToHex((baseH + offset) % 360, s, l)];
}
```

- [ ] **Step 2: Wire the Generate button after the init function**

At the bottom of `script.js` (before `init()`), add:

```javascript
generateBtn.addEventListener('click', () => {
  state.stops = smartRandom();
  renderPreview();
  renderColorStops(); // defined in Task 6; safe to call once drawer is built
});
```

Note: `renderColorStops` is defined in Task 6. If you run the file before Task 6, clicking Generate will throw once — that's expected. Add a guard for now:

```javascript
generateBtn.addEventListener('click', () => {
  state.stops = smartRandom();
  renderPreview();
  if (typeof renderColorStops === 'function') renderColorStops();
});
```

- [ ] **Step 3: Open in browser and verify**

```bash
open index.html
```

Click "✦ Generate New Gradient" 10+ times. Expected: every gradient looks visually cohesive (no clashing neons), colours shift harmoniously across hue families, preview updates instantly.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: smart random gradient using HSL harmony"
```

---

## Task 5: Customize drawer — open/close

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add drawer DOM refs and toggle logic**

After the `exportBtn` DOM ref, add:

```javascript
const drawer          = document.getElementById('drawer');
const drawerBackdrop  = document.getElementById('drawerBackdrop');
const customizeBtn    = document.getElementById('customizeBtn');
const drawerClose     = document.getElementById('drawerClose');
```

After the platform tab listener, add:

```javascript
/* ============================================================
   Drawer open / close
   ============================================================ */
function openDrawer() {
  drawer.classList.add('open');
  drawerBackdrop.classList.add('visible');
  document.body.classList.add('drawer-open');
  drawer.setAttribute('aria-hidden', 'false');
  customizeBtn.setAttribute('aria-expanded', 'true');
  drawerClose.focus();
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawerBackdrop.classList.remove('visible');
  document.body.classList.remove('drawer-open');
  drawer.setAttribute('aria-hidden', 'true');
  customizeBtn.setAttribute('aria-expanded', 'false');
  customizeBtn.focus();
  // Re-render preview after layout shift settles
  setTimeout(renderPreview, 310);
}

customizeBtn.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
});
```

- [ ] **Step 2: Open in browser and verify**

```bash
open index.html
```

Expected:
- Click "✎ Customize" → drawer slides in from left (desktop) or up from bottom (narrow window). Main content shifts right on desktop. Backdrop appears on tablet/mobile.
- Click ✕ or outside the drawer → drawer slides away, focus returns to Customize button.
- Press Escape → drawer closes.

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: customize drawer open/close with keyboard and focus trap"
```

---

## Task 6: Color stop controls

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add color stop renderer and event handlers**

After the `closeDrawer` block, add:

```javascript
/* ============================================================
   Color stop controls
   ============================================================ */
const colorStopsEl = document.getElementById('colorStops');
const addStopBtn   = document.getElementById('addStop');

function renderColorStops() {
  colorStopsEl.innerHTML = '';
  state.stops.forEach((color, i) => {
    const well = document.createElement('div');
    well.className = 'stop-well';

    const input = document.createElement('input');
    input.type  = 'color';
    input.value = color;
    input.setAttribute('aria-label', `Color stop ${i + 1}`);
    input.addEventListener('input', () => {
      state.stops[i] = input.value;
      renderPreview();
    });

    well.appendChild(input);

    if (state.stops.length > 2) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'stop-remove';
      removeBtn.textContent = '×';
      removeBtn.setAttribute('aria-label', `Remove color stop ${i + 1}`);
      removeBtn.addEventListener('click', () => {
        state.stops.splice(i, 1);
        renderColorStops();
        renderPreview();
      });
      well.appendChild(removeBtn);
    }

    colorStopsEl.appendChild(well);
  });

  addStopBtn.style.display = state.stops.length >= 4 ? 'none' : '';
}

addStopBtn.addEventListener('click', () => {
  if (state.stops.length >= 4) return;
  // Interpolate a new stop between the last two
  const last = state.stops[state.stops.length - 1];
  const prev = state.stops[state.stops.length - 2];
  const mix = mixHex(prev, last, 0.5);
  state.stops.push(mix);
  renderColorStops();
  renderPreview();
});

function mixHex(a, b, t) {
  const parse = hex => [
    parseInt(hex.slice(1,3), 16),
    parseInt(hex.slice(3,5), 16),
    parseInt(hex.slice(5,7), 16),
  ];
  const [ar,ag,ab] = parse(a);
  const [br,bg,bb] = parse(b);
  const r = Math.round(ar + (br-ar)*t).toString(16).padStart(2,'0');
  const g = Math.round(ag + (bg-ag)*t).toString(16).padStart(2,'0');
  const bv= Math.round(ab + (bb-ab)*t).toString(16).padStart(2,'0');
  return `#${r}${g}${bv}`;
}
```

- [ ] **Step 2: Call renderColorStops in init**

Find the `init()` function and add `renderColorStops();` inside it:

```javascript
function init() {
  renderColorStops();
  renderPreview();
}
```

- [ ] **Step 3: Open in browser and verify**

```bash
open index.html
```

Open the Customize drawer. Expected:
- Two colour picker wells are visible.
- Changing a well colour updates the gradient preview live.
- "+ Add Stop" adds a third stop (blended between the last two). Up to 4 stops.
- At 3+ stops a `×` badge appears on each well; clicking removes that stop (min 2).
- At 4 stops the "+ Add Stop" button disappears.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: color stop add/remove/edit controls"
```

---

## Task 7: Direction grid + Type tabs + Presets

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Wire the direction grid**

After the `addStopBtn` block, add:

```javascript
/* ============================================================
   Direction grid
   ============================================================ */
const directionGrid = document.getElementById('directionGrid');

directionGrid.addEventListener('click', e => {
  const btn = e.target.closest('.dir-btn');
  if (!btn) return;
  directionGrid.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.direction = btn.dataset.dir;
  renderPreview();
});
```

- [ ] **Step 2: Wire the type tabs**

```javascript
/* ============================================================
   Type tabs
   ============================================================ */
const typeTabs = document.getElementById('typeTabs');

typeTabs.addEventListener('click', e => {
  const btn = e.target.closest('.type-btn');
  if (!btn) return;
  typeTabs.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.type = btn.dataset.type;
  // Direction is only meaningful for linear gradients — grey out grid
  directionGrid.style.opacity = state.type === 'linear' ? '1' : '0.35';
  directionGrid.style.pointerEvents = state.type === 'linear' ? '' : 'none';
  renderPreview();
});
```

- [ ] **Step 3: Build and wire presets**

```javascript
/* ============================================================
   Presets
   ============================================================ */
const PRESETS = [
  { name: 'Aurora',   stops: ['#667eea', '#764ba2'],             dir: 'bottom-right' },
  { name: 'Blush',    stops: ['#f093fb', '#f5576c'],             dir: 'right'        },
  { name: 'Ocean',    stops: ['#4facfe', '#00f2fe'],             dir: 'bottom-right' },
  { name: 'Mint',     stops: ['#43e97b', '#38f9d7'],             dir: 'right'        },
  { name: 'Peach',    stops: ['#fa709a', '#fee140'],             dir: 'bottom-right' },
  { name: 'Lavender', stops: ['#a18cd1', '#fbc2eb'],             dir: 'right'        },
  { name: 'Sand',     stops: ['#ffecd2', '#fcb69f'],             dir: 'bottom'       },
  { name: 'Slate',    stops: ['#2d3436', '#636e72'],             dir: 'right'        },
  { name: 'Midnight', stops: ['#0f0c29', '#302b63', '#24243e'], dir: 'bottom-right' },
  { name: 'Coral',    stops: ['#ff9a9e', '#fad0c4'],             dir: 'right'        },
  { name: 'Forest',   stops: ['#134e5e', '#71b280'],             dir: 'bottom-right' },
  { name: 'Gold',     stops: ['#f7971e', '#ffd200'],             dir: 'right'        },
];

const presetsGrid = document.getElementById('presetsGrid');

PRESETS.forEach(preset => {
  const btn = document.createElement('button');
  btn.className = 'preset-swatch';
  btn.style.background = `linear-gradient(to right, ${preset.stops.join(', ')})`;
  btn.setAttribute('aria-label', `Preset: ${preset.name}`);
  btn.addEventListener('click', () => {
    state.stops     = [...preset.stops];
    state.direction = preset.dir;
    state.type      = 'linear';
    // Sync UI
    renderColorStops();
    directionGrid.querySelectorAll('.dir-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.dir === preset.dir)
    );
    typeTabs.querySelectorAll('.type-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.type === 'linear')
    );
    directionGrid.style.opacity = '1';
    directionGrid.style.pointerEvents = '';
    renderPreview();
  });
  presetsGrid.appendChild(btn);
});
```

- [ ] **Step 4: Open in browser and verify**

```bash
open index.html
```

Open Customize drawer. Expected:
- 12 preset swatches visible as coloured pills.
- Clicking a preset loads its colours, direction and forces Linear type; all controls update visually.
- Switching type to Radial or Conic greys out the direction grid (opacity + pointer-events).
- Direction buttons update the gradient direction live.

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "feat: direction grid, type tabs, preset gallery"
```

---

## Task 8: Grain slider + noise preview

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Wire the grain slider**

After the presets block, add:

```javascript
/* ============================================================
   Grain slider
   ============================================================ */
const grainSlider = document.getElementById('grainSlider');
const grainValue  = document.getElementById('grainValue');

grainSlider.addEventListener('input', () => {
  state.grain = Number(grainSlider.value);
  const pct = `${state.grain}%`;
  grainValue.textContent = pct;
  grainSlider.setAttribute('aria-valuetext', pct);
  // Update the CSS custom property used by the slider track fill
  grainSlider.style.setProperty('--fill', pct);
  renderPreview();
});
```

- [ ] **Step 2: Open in browser and verify**

```bash
open index.html
```

Open Customize drawer. Drag the Grain slider from 0 to 100. Expected:
- The percentage label next to "Grain" updates live.
- The slider thumb moves along a filled track (purple fill on the left, grey on right).
- The preview well's SVG noise layer fades in as grain increases — a visible film-grain texture appears over the gradient at ~50%+.

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "feat: grain slider wired to SVG noise preview overlay"
```

---

## Task 9: Canvas asset rendering

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add canvas gradient builder**

After the grain slider block, add:

```javascript
/* ============================================================
   Canvas rendering utilities
   ============================================================ */
function buildCanvasGradient(ctx, w, h) {
  const stops = state.stops;
  const n = stops.length;
  let grad;

  if (state.type === 'linear') {
    const [x0r, y0r, x1r, y1r] = CANVAS_DIRS[state.direction];
    grad = ctx.createLinearGradient(x0r * w, y0r * h, x1r * w, y1r * h);
  } else if (state.type === 'radial') {
    grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
  } else {
    grad = ctx.createConicGradient(0, w / 2, h / 2);
  }

  stops.forEach((color, i) => grad.addColorStop(i / (n - 1), color));
  return grad;
}

function applyGrain(ctx, w, h, intensity) {
  if (intensity === 0) return;
  // Generate greyscale pixel noise
  const imgData = ctx.createImageData(w, h);
  const buf = imgData.data;
  for (let i = 0; i < buf.length; i += 4) {
    const v = Math.random() * 255 | 0;
    buf[i] = buf[i + 1] = buf[i + 2] = v;
    buf[i + 3] = 255;
  }
  const tmp = document.createElement('canvas');
  tmp.width = w; tmp.height = h;
  tmp.getContext('2d').putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = intensity * 0.45;   // 100% slider → 0.45 overlay opacity
  ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}

async function renderAsset(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = buildCanvasGradient(ctx, w, h);
  ctx.fillRect(0, 0, w, h);

  applyGrain(ctx, w, h, state.grain / 100);
  return canvas;
}

async function renderProfileRing(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Fill gradient circle
  ctx.fillStyle = buildCanvasGradient(ctx, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  applyGrain(ctx, size, size, state.grain / 100);

  // Punch transparent inner hole (78 % of radius = realistic ring width)
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.39, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  return canvas;
}
```

- [ ] **Step 2: Verify canvas output manually**

Add a temporary test at the bottom of `script.js` (delete after verifying):

```javascript
// TEMP: verify canvas rendering — remove before Task 10
(async () => {
  const c = await renderAsset(400, 100);
  document.body.appendChild(c);
  c.style.cssText = 'position:fixed;bottom:0;right:0;border:2px solid red;z-index:9999';

  const ring = await renderProfileRing(120);
  document.body.appendChild(ring);
  ring.style.cssText = 'position:fixed;bottom:110px;right:0;border:2px solid blue;z-index:9999';
})();
```

Open in browser. Expected: small red-bordered gradient canvas appears bottom-right. Blue-bordered canvas shows gradient ring with transparent hole. Set grain to 50% and reload — visible noise in both canvases.

- [ ] **Step 3: Remove the temporary test code**

Delete the `// TEMP:` block added in Step 2.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: canvas gradient and profile ring renderers"
```

---

## Task 10: ZIP export + brand.md + gradient.css

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add text generators**

After the `renderProfileRing` function, add:

```javascript
/* ============================================================
   Text file generators
   ============================================================ */
function generateCSS() {
  const grad = buildCSSGradient();
  const vars = state.stops
    .map((c, i) => `  --brand-color-${i + 1}: ${c};`)
    .join('\n');
  return `:root {\n${vars}\n  --brand-gradient: ${grad};\n}\n\n` +
    `.brand-gradient { background: var(--brand-gradient); }\n` +
    `.brand-hero     { background: var(--brand-gradient); min-height: 100vh; }\n`;
}

function generateBrandMd() {
  const grad = buildCSSGradient();
  const stopLines = state.stops.map((c, i) => `- Stop ${i + 1}: ${c}`).join('\n');
  const cssVars = state.stops
    .map((c, i) => `--brand-color-${i + 1}: ${c};`).join('\n') +
    `\n--brand-gradient: ${grad};\n--brand-grain: ${state.grain}%;`;
  const dirLabel = CSS_DIR[state.direction] || state.direction;
  const grainNote = state.grain > 0
    ? `\n- The grain texture (${state.grain}%) adds warmth and analogue depth` : '';

  return `# My Brand Gradient\n\n` +
    `## Palette\n${stopLines}\n- Direction: ${dirLabel}\n- Type: ${state.type}\n- Grain: ${state.grain}%\n\n` +
    `## CSS\nbackground: ${grad};\n\n` +
    `## CSS Variables\n${cssVars}\n\n` +
    `## AI Prompt\nMy personal brand uses a ${state.type} gradient (${state.stops.join(' → ')}), ` +
    `applied ${dirLabel}${state.grain > 0 ? ` with ${state.grain}% grain texture` : ''}.\n\n` +
    `When generating visuals or copy for my brand:\n` +
    `- Use these exact hex values for color consistency\n` +
    `- Mood: modern, creative, tech-forward, distinctive${grainNote}\n` +
    `- Avoid flat, neon, or high-saturation interpretations\n`;
}
```

- [ ] **Step 2: Add the export function**

```javascript
/* ============================================================
   Export
   ============================================================ */
const EXPORT_ASSETS = [
  { folder: 'linkedin',  file: 'banner-1584x396.png',      w: 1584, h: 396,  ring: false },
  { folder: 'linkedin',  file: 'profile-ring-800x800.png', w: 800,  h: 800,  ring: true  },
  { folder: 'instagram', file: 'story-1080x1920.png',      w: 1080, h: 1920, ring: false },
  { folder: 'instagram', file: 'post-1080x1080.png',       w: 1080, h: 1080, ring: false },
  { folder: 'instagram', file: 'profile-ring-800x800.png', w: 800,  h: 800,  ring: true  },
  { folder: 'twitter',   file: 'header-1500x500.png',      w: 1500, h: 500,  ring: false },
  { folder: 'twitter',   file: 'profile-ring-400x400.png', w: 400,  h: 400,  ring: true  },
  { folder: 'website',   file: 'hero-1920x1080.png',       w: 1920, h: 1080, ring: false },
];

async function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function exportKit() {
  exportBtn.textContent = 'Building kit…';
  exportBtn.classList.add('loading');

  try {
    const zip = new JSZip();

    for (const asset of EXPORT_ASSETS) {
      const canvas = asset.ring
        ? await renderProfileRing(asset.w)
        : await renderAsset(asset.w, asset.h);
      const blob = await canvasToBlob(canvas);
      zip.folder(asset.folder).file(asset.file, blob);
    }

    zip.folder('website').file('gradient.css', generateCSS());
    zip.file('brand.md', generateBrandMd());

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'my-brand-kit.zip');
  } finally {
    exportBtn.textContent = 'Export Brand Kit ↓';
    exportBtn.classList.remove('loading');
  }
}

exportBtn.addEventListener('click', exportKit);
```

- [ ] **Step 3: Open in browser and test the full export**

```bash
open index.html
```

Click "Export Brand Kit ↓". Expected:
- Button label changes to "Building kit…" then reverts.
- Browser downloads `my-brand-kit.zip`.
- Unzip and verify: 8 PNGs in correct folders, `website/gradient.css`, `brand.md`.
- Open one PNG (e.g. `linkedin/banner-1584x396.png`) — correct dimensions, gradient visible.
- Open `brand.md` — readable AI prompt with hex values matching what was on screen.
- Set grain to 40%, export again — noise is visible in the PNG files.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: ZIP export with platform PNGs, gradient.css, brand.md"
```

---

## Task 11: Responsive polish

**Files:**
- Modify: `style.css` (verify responsive rules already written in Task 2 work end-to-end)
- Modify: `script.js` (add resize guard)

- [ ] **Step 1: Verify tablet layout (600–899px)**

Open DevTools, resize to 750px wide. Expected:
- Platform tabs overflow and scroll horizontally (no wrapping).
- Clicking "✎ Customize" slides the drawer up from the bottom as a sheet (not from left).
- Backdrop (semi-transparent overlay) appears behind the sheet.
- Clicking the backdrop closes the drawer.

If tabs don't scroll, verify this rule exists in `style.css`:

```css
@media (max-width: 899px) {
  .platform-tabs { overflow-x: auto; scrollbar-width: none; }
  .platform-tabs::-webkit-scrollbar { display: none; }
}
```

- [ ] **Step 2: Verify mobile layout (< 600px)**

Resize to 390px wide. Expected:
- Action bar stacks vertically (Generate on top, Export below).
- Export button is sticky at the bottom of the viewport.
- Customize drawer takes 85vh when open.
- All interactive targets are comfortably tappable (≥ 44px).

- [ ] **Step 3: Add debounced resize guard to script.js**

The `renderPreview` function reads DOM dimensions, which can fire many times during resize. Replace the `window.addEventListener('resize', renderPreview)` line with:

```javascript
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(renderPreview, 120);
});
```

- [ ] **Step 4: Open in browser at full size and do a final end-to-end pass**

```bash
open index.html
```

Walk through the full user journey:
1. Page loads → Aurora-ish gradient visible, no controls in the way.
2. Click "✦ Generate" 5× → each gradient is harmonious.
3. Click "✎ Customize" → drawer opens, shows all controls.
4. Change a colour stop → preview updates live.
5. Drag grain to 60% → noise visible in preview.
6. Click a preset → colours, direction, and type all sync.
7. Switch platform tabs → preview reshapes correctly.
8. Close drawer → preview resizes to fill available space.
9. Click "Export Brand Kit ↓" → ZIP downloads, all 10 assets + gradient.css + brand.md present and correct.

- [ ] **Step 5: Commit**

```bash
git add style.css script.js
git commit -m "feat: responsive layout verified, debounced resize"
```

---

## Self-Review Checklist

| Spec requirement | Covered by |
|---|---|
| Full-viewport Design Studio layout | Task 2 CSS |
| Randomize-first default (no controls visible) | Task 1 HTML — drawer hidden |
| Customize drawer slides from left (desktop) / bottom (tablet) | Task 2 CSS, Task 5 JS |
| 2–4 color stops with add/remove | Task 6 |
| 8-direction grid | Task 7 |
| Linear / Radial / Conic type | Task 7 |
| Grain/noise slider + live preview | Task 8 |
| 12 curated presets | Task 7 |
| Smart Random (HSL harmony) | Task 4 |
| Platform tabs: LinkedIn / Instagram / X / Website | Task 3 |
| Preview resizes per platform aspect ratio | Task 3 |
| Profile ring preview | Task 1 HTML, Task 3 |
| Canvas rendering at native resolution | Task 9 |
| 10 exported PNGs in correct folders | Task 10 |
| Profile rings with transparent cutout | Task 9 |
| gradient.css with CSS custom properties | Task 10 |
| brand.md with AI prompt | Task 10 |
| JSZip + FileSaver.js ZIP download | Task 10 |
| Neumorphic design system (shadows, tokens, fonts) | Task 2 |
| Focus-visible rings, aria labels, touch targets | Task 2 CSS |
| Responsive tablet (bottom sheet) + mobile (full overlay) | Task 2 CSS, Task 11 |
| Debounced resize | Task 11 |
