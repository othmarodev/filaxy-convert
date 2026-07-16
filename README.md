# Filaxy Convert™

A free, privacy-first file converter that runs entirely in your browser — no uploads, no backend, no tracking.

**[Live demo](#)** · Part of the [Filaxy](https://filaxy.net) family of free tools.

## Features

- 🖼 **Images** — PNG, JPEG, WebP, GIF, BMP, ICO (via `<canvas>`)
- 📊 **Data** — JSON, CSV, XML, YAML
- 📝 **Text** — TXT, HTML, Markdown, RTF
- 🔐 **Encoding** — Base64, URL, Hex (UTF-8 safe — handles accents/emoji correctly)
- 🌐 Bilingual UI (Spanish / English)
- 🌗 Light / dark theme
- 🕐 Local conversion history (`localStorage`)
- 100% client-side — files never leave your device

## Why

Most online converters upload your file to a server. Filaxy Convert does everything in-browser with the File API, Canvas API, and `js-yaml` — nothing is ever transmitted anywhere.

## Usage

Just open `index.html` in any modern browser, or serve the folder statically:

```bash
python3 -m http.server 8080
```

No build step, no dependencies to install.

## Tech

Single-file vanilla HTML/CSS/JS. Only external dependency is [`js-yaml`](https://github.com/nodeca/js-yaml) (CDN) for YAML parsing.

## License

MIT
