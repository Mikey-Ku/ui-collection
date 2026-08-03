# ui-collection

A personal collection of small UI components and animations — live, interactive,
and grown one at a time.

The idea is simple: see an interaction somewhere that works, rebuild it here,
pin it up. Then pull from the collection when building anything real, instead of
reaching for a component library that makes every project look the same.

```bash
node build.mjs && node serve.mjs
```

- **`/board/`** — the collection. A 2-wide grid of live specimens you can poke.
- **`/foundation/`** — the base: colour ramps, elevation, and how it all fits together.

---

## Two layers, on purpose

**Layer 1 — CSS custom properties and plain classes.** `dist/mk-ui.css` is one
file with no build step and no framework. It drops into anything that renders
HTML: a Jinja template, a Streamlit page, a static report, Next.js.

**Layer 2 — React wrappers** over those same classes, in `react/`. Only worth
pulling in when the project is already React.

The rule that keeps this honest: **a component exists in Layer 1 first.** One
that lives only as JSX silently disappears from every non-React project.

## Colour

Two levels, and the separation is the whole point:

```
ramp      --blue-50 … --blue-700, --ink-50 … --ink-900   the ONLY place a hex appears
semantic  --mk-bg: var(--ink-50)   --mk-accent: var(--blue-500)   everything else
```

**There are no neutral greys.** Every "grey" is a desaturated version of the same
blue, so text, borders, backgrounds and shadows all belong to one hue family.
Shadows are tinted with the accent rather than black — a black shadow on a
blue-cast ground reads as dirt.

Candidate bases live in `tokens/bases.css` and are switched with `data-base` on
`<html>`. Compare them at `/foundation/`.

## Two kinds of specimen

- **`family`** — variants of one component in a single tile: Buttons, Selection,
  Loading. Keeps the collection scannable as it grows.
- **`motion`** — one idea on its own. An animation isn't a variant of anything,
  so it gets its own square.

## Adding one

1. **Class in `css/components.css`.** Tokens only — no hex, no pixel values
   outside the `--mk-*` scale. `.mk-thing`, `.mk-thing--variant`, `.mk-thing__part`.
2. **Entry in `registry/registry.json`** with its `demo` markup. That file is the
   source of truth for what exists; the board just renders it.
3. **Needs JS?** Add a function to `behaviors` in `board/index.html`. It takes a
   root element and wires only what's inside it — a specimen can be mounted more
   than once, so no ids and no shared state.
4. **`node build.mjs`.**

`registry/ideas.json` is a backlog of things not built yet. Nothing in it exists.

## Search

Keyword over id, name, tags, aliases, classes and notes, widened by a small
synonym map. **Not embeddings.** Real semantic search means embedding each note
and running cosine similarity at query time — the registry is shaped for it, but
calling what's there "semantic" would be a lie.

The registry is also shaped to be served over MCP later: `list`, `search`, and a
`get` that returns real code rather than a description of it.

## Layout

```
board/       the collection
foundation/  base candidates: ramps, elevation, applied
registry/    registry.json (what exists) + ideas.json (backlog)
tokens/      core.css (no colours) + bases.css + themes
css/         base.css (reset, focus, utilities) + components.css
react/       Layer 2
dist/        built bundle — committed so it can be linked directly
serve.mjs    dev server
build.mjs    bundle + cache-bust stamp
```

## Two infrastructure notes

Both exist because a stale stylesheet looks exactly like a broken component, and
that cost an afternoon:

- **`serve.mjs` instead of `python -m http.server`** — the latter sends no
  `Cache-Control`, so browsers heuristically cache CSS and JSON. Everything here
  is `no-store`.
- **`build.mjs` stamps a content hash** onto the stylesheet URLs in the dev
  pages, so the URL changes exactly when the CSS does and never otherwise.

## Accessibility floor

- One focus treatment system-wide via `--mk-focus-ring`. Themes restyle it,
  never remove it.
- `prefers-reduced-motion` zeroes every duration in `core.css`; the spinner and
  shimmer freeze flat.
- Status is never colour alone — badges carry text, meters carry `aria-valuenow`.
- The grid collapses to one column at 720px.

## License

MIT.
