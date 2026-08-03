#!/usr/bin/env node
// Static dev server for the board.
//
// Exists for one reason: python3 -m http.server sends no Cache-Control, so
// browsers heuristically cache CSS and JSON. Editing a stylesheet then
// reloading would silently show the previous version — which reads as a
// broken component rather than a stale file. Everything here is no-store.

import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  // Strip the query and refuse to climb out of the root.
  const rel = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, rel);

  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    return res.end("Not found");
  }

  try {
    await stat(file);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    return res.end("Not found");
  }

  res.writeHead(200, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store, must-revalidate",
  });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`mk-ui board → http://localhost:${port}/board/`));
