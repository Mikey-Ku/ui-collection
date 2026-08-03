#!/usr/bin/env node
// 1. Concatenates the stylesheet layers into dist/mk-ui.css — one file you can
//    <link> from a Jinja template, a Streamlit page, or a static eval report.
//    Order matters: core defines the primitives every theme overrides.
// 2. Generates one page per element from registry.json, so every element has a
//    real URL instead of a query string or a client-side route.
// 3. Stamps a content hash onto every stylesheet URL, because browsers will
//    happily serve a stylesheet from before your edit and the result looks
//    like a broken component, not a stale file.

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const LAYERS = [
  "tokens/core.css",
  "tokens/theme-mk.css",
  "css/base.css",
  "css/components.css",
];

const SITE = "Mikey Ku Collection";

/* ---------------------------- 1. bundle ---------------------------- */

const parts = await Promise.all(
  LAYERS.map(async (rel) => `/* ---- ${rel} ---- */\n${await readFile(join(root, rel), "utf8")}`)
);

const banner = `/*! ${SITE} — michaelkujr.me design language. Swap the accent with data-accent on <html>. */\n`;
const bundle = banner + parts.join("\n");

await mkdir(join(root, "dist"), { recursive: true });
await writeFile(join(root, "dist", "mk-ui.css"), bundle, "utf8");

// Short hash of every layer's contents. Changes only when the CSS changes, so
// the browser refetches exactly when it should and caches the rest of the time.
const stamp = createHash("sha256").update(bundle).digest("hex").slice(0, 8);

/* ------------------------ 2. element pages ------------------------ */

const reg = JSON.parse(await readFile(join(root, "registry", "registry.json"), "utf8"));
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const ACCENTS = [
  ["", "#0f7d54", "Emerald"],
  ["cobalt", "#2f5fe0", "Cobalt"],
  ["indigo", "#5b4bd6", "Indigo"],
  ["slate", "#3f5366", "Slate"],
];

// `up` is the climb back to the root: element pages live two levels down.
const page = (it, up) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(it.name)} — ${SITE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}tokens/core.css">
<link rel="stylesheet" href="${up}tokens/theme-mk.css">
<link rel="stylesheet" href="${up}css/base.css">
<link rel="stylesheet" href="${up}css/components.css">
<link rel="stylesheet" href="${up}css/site.css">
</head>
<body>

<header class="pg-top">
  <a class="pg-mark" href="${up}">Mikey Ku <span>Collection<b>.</b></span></a>
  <span class="mk-grow"></span>
  <div class="pg-accents" role="group" aria-label="Accent">
${ACCENTS.map(([v, hex, label]) =>
  `    <button class="pg-swatch" data-accent-pick="${v}" style="background:${hex}" aria-pressed="${v === "" ? "true" : "false"}" aria-label="${label}"></button>`
).join("\n")}
  </div>
  <span class="mk-eyebrow">${esc(it.kind)}</span>
</header>

<div class="pg-wrap">
  <a class="dt-back" href="${up}"><i>&lsaquo;</i> All elements</a>

  <div class="dt-head">
    <h1>${esc(it.name)}</h1>
    <p>${esc(it.note ?? "")}</p>
  </div>

  <div class="dt-hero" data-demo>${it.demo ?? ""}</div>

  <div id="body"></div>
</div>

<script type="module">
import { mount, cell, wireCopy, wireAccent, measureSizes } from "${up}js/demo.js";

const it = ${JSON.stringify(it)};
const out = [];
const section = (title, html) =>
  out.push(\`<div class="pg-sec"><div class="pg-label"><span class="mk-eyebrow">\${title}</span></div>\${html}</div>\`);

if (it.variants?.length) {
  section("Variants", \`<div class="el-row">\${it.variants.map((v) => cell(v.label, v.demo)).join("")}</div>\`);
}

/* The size classes cascade, so wrapping the demo is all it takes — nothing
   per-element, and every control inside follows. The measured height is
   filled in at runtime rather than restated here, so if a token changes the
   page reports it instead of lying. */
if (it.sizes) {
  const one = it.sizeDemo ?? it.demo;
  section("Sizes", \`<div class="el-row">\${["sm", "md", "lg"]
    .map((s) => cell(\`.mk-\${s}\`, \`<div class="mk-\${s}">\${one}</div>\`, \` <em data-measure>·</em>\`))
    .join("")}</div>\`);
}

if (it.uses?.length) {
  section("In use", \`<div class="el-row el-row--wide">\${it.uses.map((u) => \`
    <div class="el-cell">
      <div class="el-cell__view" data-demo>\${u.demo}</div>
      <div class="el-cell__tag"><span>\${u.label}</span></div>
      \${u.note ? \`<div class="el-cell__note" style="padding-bottom:var(--mk-3)">\${u.note}</div>\` : ""}
    </div>\`).join("")}</div>\`);
}

if (it.motion?.length) {
  section("Motion", \`<div class="dt-motion">\${it.motion.map((m) => \`
    <div><strong>\${m.label}</strong><code>\${m.value}</code><span>\${m.note ?? ""}</span></div>\`).join("")}</div>\`);
}

section("Classes", \`<div class="el-classes">\${(it.css ?? []).map((c) => \`<span class="el-class">.\${c}</span>\`).join("")}</div>\`);

const body = document.querySelector("#body");
body.innerHTML = out.join("");

// Attach first, then mount — behaviours measure layout, and a detached
// element measures as zero.
mount(document.body);
measureSizes(body);
wireCopy();
wireAccent();
document.addEventListener("mk:accent", () => measureSizes(body));
</script>
</body>
</html>
`;

// Rebuilt from scratch each time, so an element removed from the registry
// does not leave an orphan page behind.
await rm(join(root, "elements"), { recursive: true, force: true });

for (const it of reg.items ?? []) {
  const dir = join(root, "elements", it.id);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), page(it, "../../"), "utf8");
}

/* --------------------------- 3. stamping --------------------------- */

const PAGES = ["index.html", ...(reg.items ?? []).map((it) => `elements/${it.id}/index.html`)];

let stamped = 0;
for (const rel of PAGES) {
  let html;
  try {
    html = await readFile(join(root, rel), "utf8");
  } catch {
    continue; // page removed — not an error
  }
  const next = html.replace(
    /(href="(?:\.\.\/)*(?:tokens|css)\/[a-z0-9-]+\.css)(\?v=[a-f0-9]+)?"/g,
    `$1?v=${stamp}"`
  );
  if (next !== html) {
    await writeFile(join(root, rel), next, "utf8");
    stamped++;
  }
}

console.log(
  `dist/mk-ui.css  ${(Buffer.byteLength(bundle) / 1024).toFixed(1)} kB  (${LAYERS.length} layers)\n` +
  `elements/       ${(reg.items ?? []).length} page(s) generated\n` +
  `stamp ?v=${stamp}  →  ${stamped} page(s) updated`
);
