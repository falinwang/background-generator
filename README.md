# Personal Brand Kit Generator

A browser-based design studio that generates gradient brand assets for LinkedIn, Instagram, X/Twitter, and personal websites — all exported as a single ZIP.

## Features

- **Randomize-first UX** — one click generates a harmonious gradient using HSL colour theory
- **Full brand kit export** — 10 platform-sized PNGs, a ready-to-use `gradient.css`, and a `brand.md` AI prompt file
- **Customize drawer** — colour stops (2–4), 8 directions, Linear/Radial/Conic types, grain/noise slider, 12 curated presets
- **Neumorphic design** — cool-grey `#E0E5EC` surface with dual-shadow depth system
- **No build step** — vanilla HTML/CSS/JS, open `index.html` directly

## Exported Assets

| Platform | Files |
|---|---|
| LinkedIn | `banner-1584x396.png`, `profile-ring-800x800.png` |
| Instagram | `story-1080x1920.png`, `post-1080x1080.png`, `profile-ring-800x800.png` |
| X / Twitter | `header-1500x500.png`, `profile-ring-400x400.png` |
| Website | `hero-1920x1080.png`, `gradient.css` |
| All | `brand.md` — AI-ready brand prompt for Claude, ChatGPT, Midjourney |

## Usage

```bash
open index.html
```

1. Click **✦ Generate New Gradient** to get a harmonious starting point
2. Click **✎ Customize** to fine-tune colours, direction, type, and grain
3. Click **Export Brand Kit ↓** to download `my-brand-kit.zip`

## Tech

- Vanilla HTML / CSS / JS
- [JSZip](https://stuk.github.io/jszip/) — ZIP assembly
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) — download trigger
- Canvas 2D API — native-resolution rendering
- Google Fonts — Plus Jakarta Sans, DM Sans
