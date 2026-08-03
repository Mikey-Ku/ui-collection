#!/usr/bin/env node
// 1. Concatenates the stylesheet layers into dist/mk-ui.css — one file you can
//    <link> from a Jinja template, a Streamlit page, or a static eval report.
//    Order matters: core defines the primitives every theme overrides.
// 2. Stamps a content hash onto the stylesheet URLs in the dev pages, because
//    browsers will happily serve a cached stylesheet from before your edit and
//    the result looks like a broken component, not a stale file.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const LAYERS = [
  "tokens/core.css",
  "tokens/theme-mk.css",
  "css/base.css",
  "css/components.css",
];

const PAGES = ["board/index.html", "foundation/index.html"];

const parts = await Promise.all(
  LAYERS.map(async (rel) => `/* ---- ${rel} ---- */\n${await readFile(join(root, rel), "utf8")}`)
);

const banner = `/*! mk-ui — set data-theme on <html>. Canonical theme: board. */\n`;
const bundle = banner + parts.join("\n");
const out = join(root, "dist", "mk-ui.css");

await mkdir(dirname(out), { recursive: true });
await writeFile(out, bundle, "utf8");

// Short hash of every layer's contents. Changes only when the CSS changes, so
// the browser refetches exactly when it should and caches the rest of the time.
const stamp = createHash("sha256").update(bundle).digest("hex").slice(0, 8);

let stamped = 0;
for (const page of PAGES) {
  let html;
  try {
    html = await readFile(join(root, page), "utf8");
  } catch {
    continue; // page removed — not an error
  }
  const next = html.replace(
    /(href="\.\.\/(?:tokens|css)\/[a-z0-9-]+\.css)(\?v=[a-f0-9]+)?"/g,
    `$1?v=${stamp}"`
  );
  if (next !== html) {
    await writeFile(join(root, page), next, "utf8");
    stamped++;
  }
}

console.log(
  `dist/mk-ui.css  ${(Buffer.byteLength(bundle) / 1024).toFixed(1)} kB  (${LAYERS.length} layers)\n` +
  `stamp ?v=${stamp}  →  ${stamped} page(s) updated`
);
