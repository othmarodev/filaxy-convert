# Contributing to Filaxy Convert

Thanks for considering a contribution. This is a small, dependency-light project — keep changes
in that spirit.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run the unit tests
npm run build    # production build to dist/
```

## Project structure

```
src/
├── main.js              # app entry point
├── style.css             # design tokens + all styles
├── i18n.js                # ES/EN translations
├── theme.js                # light/dark toggle
├── ui.js                    # DOM wiring (dropzone, tabs, convert flow)
├── history.js                # conversion history (localStorage)
├── converters/
│   ├── image.js               # canvas-based image conversion
│   ├── data.js                  # JSON/CSV/XML/YAML
│   ├── text.js                    # TXT/HTML/Markdown/RTF
│   └── encode.js                    # Base64/URL/Hex (UTF-8 safe)
└── scene/
    └── antigravity.js               # Three.js hero visual
tests/                                # Vitest unit tests for the converters
```

## Guidelines

- **No server, ever.** Every conversion must run entirely in the browser. Do not introduce a
  backend, upload endpoint, or third-party API call that sends user files anywhere.
- **UTF-8 safety.** Any byte-level code (Base64/Hex) must round-trip non-Latin1 text correctly —
  see `tests/encode.test.js` for the expected behavior.
- **Bilingual.** New user-facing strings need both an `es` and `en` entry in `src/i18n.js`, wired
  via `data-i18n` / `data-i18n-title` / `data-i18n-placeholder` attributes.
- **Both themes.** Verify new UI in light and dark (`data-theme` on `<html>`).
- Keep modules small and focused; a converter module should stay pure-function-friendly so it's
  testable without a DOM.

## Adding a new format

1. Add the extension to the relevant `from`/`to` arrays in `src/ui.js` (`formats` object).
2. Implement the conversion in the matching `src/converters/*.js` module.
3. Add a unit test covering the happy path and at least one edge case.
4. Add an icon mapping in `FILE_ICONS` (`src/ui.js`) if it's a new file type.

## Pull requests

Keep PRs focused on one change. Include a short description of what changed and why.
