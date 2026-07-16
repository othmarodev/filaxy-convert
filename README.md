# Filaxy Convert™

[![CI](https://github.com/othmarodev/filaxy-convert/actions/workflows/ci.yml/badge.svg)](https://github.com/othmarodev/filaxy-convert/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-2dd4bf.svg)](LICENSE)

A free, privacy-first file converter that runs entirely in your browser — no uploads, no backend, no tracking.

**[Live demo](#)** · Part of the [Filaxy](https://filaxy.net) family of free tools.

## Features

- 🖼 **Images** — PNG, JPEG, WebP, GIF, BMP, ICO (via `<canvas>`)
- 📊 **Data** — JSON, CSV, XML, YAML
- 📝 **Text** — TXT, HTML, Markdown, RTF
- 🔐 **Encoding** — Base64, URL, Hex — UTF-8 safe, so accents/emoji/Cyrillic round-trip correctly
- 🌐 Bilingual UI (Spanish / English), instant switch, no reload
- 🌗 Light / dark theme with no flash on load
- 🪐 Real-time 3D hero — geometric shapes drifting weightlessly (Three.js, not a CSS trick)
- 🕐 Local conversion history (`localStorage`)
- ✅ Unit-tested converters (Vitest) + CI on every push
- 100% client-side — files never leave your device

## Why

Most online converters upload your file to a server. Filaxy Convert does everything in-browser with
the File API, Canvas API, and `js-yaml` — nothing is ever transmitted anywhere.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm test          # unit tests (Vitest)
npm run build     # production build to dist/
npm run preview   # preview the production build
```

## Project structure

```
src/
├── main.js              # app entry point
├── style.css              # design tokens + all styles (teal → amber palette)
├── i18n.js                  # ES/EN translations
├── theme.js                  # light/dark toggle
├── ui.js                      # DOM wiring (dropzone, tabs, convert flow)
├── history.js                  # conversion history (localStorage)
├── converters/
│   ├── image.js                 # canvas-based image conversion
│   ├── data.js                    # JSON/CSV/XML/YAML
│   ├── text.js                      # TXT/HTML/Markdown/RTF
│   └── encode.js                      # Base64/URL/Hex (UTF-8 safe)
└── scene/
    └── antigravity.js                 # Three.js hero visual
tests/                                   # Vitest unit tests
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide, including how to add a new format.

## Design

Filaxy Convert uses its own signature duotone — **teal → amber** — distinct from the rest of the
Filaxy family (Filaxy Files is gold; everything else is violet → sky). The two colors stand for
the two sides of every conversion: what you have, and what you're turning it into.

## Tech

Vite + vanilla JS (no framework). [`three`](https://threejs.org) for the hero visual,
[`js-yaml`](https://github.com/nodeca/js-yaml) for YAML parsing. [Vitest](https://vitest.dev) for tests.

## License

MIT — see [LICENSE](LICENSE).
