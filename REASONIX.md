# REASONIX.md — NJU-ProblemCollection

## Stack
- **Language:** HTML5 + CSS3 + vanilla JavaScript (no framework)
- **Math rendering:** KaTeX 0.16.11 (loaded via CDN — `katex.min.js` + `auto-render.min.js`)
- **Data files:** JSON in `js/data/`, loaded via `fetch()` at runtime

## Layout
- `index.html` — single-page app: header + sidebar (chapter tree) + main content (problem cards)
- `css/style.css` — all styles (flexbox layout, dark header, card-based UI)
- `js/data/textbooks-教材与章节信息.json` — textbook list + chapter trees + problem file mapping
- `js/data/problems-*.json` — per-textbook problem files (loaded on-demand)
- `js/script.js` — all runtime logic: IIFE-wrapped, `fetch()`-based API, DOM, KaTeX rendering, keyboard handler
- `.nojekyll` — disables GitHub Pages Jekyll processing
- `.zed/tasks.json` — editor task config (Zed)

## Commands
No build system, package manager, or test runner. Serve locally:
```sh
python -m http.server 8080
```
Then open `http://localhost:8080`.

## Conventions
- **IIFE pattern** — `script.js` wraps everything in `(function () { "use strict"; … })()`; only `API` is closure-local
- **No global variables** — the `API` object holds all internal state (textbooks, chapters, problems cache, chapter→textbook lookup)
- **CamelCase** — all functions and variables (`loadTree`, `renderProblems`, `currentChapterId`)
- **Semicolons** — consistently used throughout
- **Esc key clears answers** — `document.addEventListener("keydown", ...)` on `Escape` collapses all visible `.answer-body`

## Watch out for
- **CDN dependency** — KaTeX loaded from `cdn.jsdelivr.net`; offline dev needs a local KaTeX copy
- **Lazy-loaded problems** — problem JSON files are fetched on first chapter click per textbook, then cached (`_problemsCache`). Adding new problems requires editing the correct `problems-*.json` file
- **Chapter→textbook mapping is auto-built** — `_buildChapterLookup()` recursively scans the chapter tree at startup. Adding a new chapter in the JSON is enough; no manual mapping needed
- **No server-side rendering** — this is a plain static site; any backend integration needs a separate API service
