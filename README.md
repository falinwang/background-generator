# Personal Brand Kit Generator

[Try the live demo](https://falinwang.github.io/background-generator/)

A browser-based design studio for generating gradient brand assets for LinkedIn, Instagram, X/Twitter, and personal websites—exported together as a reusable brand kit.

## What it does

1. Generates a harmonious gradient starting point
2. Lets you refine colors, direction, gradient type, and grain
3. Exports platform-ready images, CSS, and an AI-ready brand prompt in one ZIP

## Highlights

- **Randomize-first workflow** using HSL color relationships
- **10 platform-sized PNG assets** for social profiles and websites
- **Flexible controls** for 2–4 color stops, 8 directions, gradient types, and grain
- **12 curated presets**
- **No build step** — runs directly in the browser

## Exported assets

| Platform | Files |
|---|---|
| LinkedIn | Banner and profile ring |
| Instagram | Story, post, and profile ring |
| X / Twitter | Header and profile ring |
| Website | Hero image and `gradient.css` |
| Brand handoff | `brand.md` prompt file |

## Tech

- Vanilla HTML, CSS, and JavaScript
- Canvas 2D API
- [JSZip](https://stuk.github.io/jszip/)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
- Plus Jakarta Sans and DM Sans

## Run locally

Open `index.html` in a browser. No installation or build step is required.
