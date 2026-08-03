/* Shared by the index and every element page.

   Each behaviour takes a root and wires only what is inside it, so one
   element can be mounted many times over — tile, every variant, every
   size, every usage example — with no shared state and no ids. */

export const behaviors = {
  seg(el) {
    const ind = el.querySelector(".mk-seg__ind");
    const opts = [...el.querySelectorAll(".mk-seg__opt")];
    const move = (o) => {
      if (!o || !o.offsetWidth) return; // detached or not laid out yet
      ind.style.setProperty("--w", `${o.offsetWidth}px`);
      ind.style.setProperty("--x", `${o.offsetLeft - 3}px`);
    };
    opts.forEach((o) => o.addEventListener("click", () => {
      opts.forEach((x) => x.setAttribute("aria-selected", String(x === o)));
      move(o);
    }));
    const sync = () => move(el.querySelector('[aria-selected="true"]'));
    new ResizeObserver(sync).observe(el); // fonts landing, container resizing
    sync();
  },

  copy(btn) {
    btn.addEventListener("click", () => {
      navigator.clipboard?.writeText("--accent").catch(() => {});
      btn.dataset.copied = "";
      clearTimeout(btn._t);
      btn._t = setTimeout(() => delete btn.dataset.copied, 1600);
    });
  },

  toast(btn) {
    const slot = btn.closest("[data-demo]").querySelector("[data-toast-slot]");
    btn.addEventListener("click", () => {
      slot.replaceChildren();
      const t = document.createElement("div");
      t.className = "mk-toast";
      t.innerHTML = `<span class="mk-dot" style="color: var(--mk-accent)"></span> Added`;
      slot.append(t);
      setTimeout(() => {
        t.dataset.leaving = "";
        t.addEventListener("animationend", () => t.remove(), { once: true });
      }, 2200);
    });
  },

  meter(btn) {
    const fill = btn.closest("[data-demo]").querySelector("[data-meter]");
    const run = () => {
      fill.style.width = "0%";
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = "72%"; }));
    };
    btn.addEventListener("click", run);
    run();
  },
};

export function mount(root) {
  for (const n of root.querySelectorAll("[data-behavior]")) behaviors[n.dataset.behavior]?.(n);
}

/* ---------- markup rendering ---------- */

export const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

/* The registry writes markup with single quotes so it survives JSON without
   escaping. What gets copied should be conventional HTML, so normalise the
   attribute quotes on the way out. */
export const source = (html) => html.replace(/='([^']*)'/g, '="$1"');

/* Enough highlighting to read at 10px: tag names one colour, class values
   another. Not a parser — a regex over already-escaped text.

   Order matters. Class values go first: the tag pass injects markup that
   itself contains class="t", and a later class pass would happily match its
   own output and eat the whole string. The tag pass is safe to run second
   because it only matches after &lt;, and injected spans use a literal <. */
export const highlight = (s) => esc(s)
  .replace(/(class=")([^"]*)(")/g, '$1<span class="a">$2</span>$3')
  .replace(/(&lt;\/?)([a-z][a-z0-9-]*)/g, '$1<span class="t">$2</span>');

/** A demo cell: live on top, label + copy, then its own markup. */
export const cell = (label, html, extra = "") => `
  <div class="el-cell">
    <div class="el-cell__view" data-demo>${html}</div>
    <div class="el-cell__tag">
      <span>${label}${extra}</span>
      <button class="el-copy" aria-label="Copy markup">
        <span><span>copy</span><span>copied</span></span>
      </button>
    </div>
    <pre class="el-cell__code">${highlight(source(html))}</pre>
  </div>`;

/* Copy reads straight off the rendered <pre>. Stashing the source in a data
   attribute meant it survived two rounds of entity decoding, so an &hellip;
   in the source arrived on the clipboard as a literal …. Taking textContent
   makes what you copy identical to what you read, by construction. */
export function wireCopy(scope = document) {
  scope.addEventListener("click", (e) => {
    const c = e.target.closest(".el-copy");
    if (!c) return;
    const pre = c.closest(".el-cell").querySelector(".el-cell__code");
    navigator.clipboard?.writeText(pre.textContent).catch(() => {});
    c.dataset.copied = "";
    clearTimeout(c._t);
    c._t = setTimeout(() => delete c.dataset.copied, 1600);
  });
}

/* Measure what the size classes actually produce rather than restating the
   token values — if a theme changes a height, this page says so. */
export function measureSizes(root) {
  for (const box of root.querySelectorAll("[data-measure]")) {
    // The label sits in the cell's tag row; the control it describes is up
    // in the cell's view. Look up to the cell, then back down.
    const ctl = box.closest(".el-cell")
      ?.querySelector(".mk-btn, .mk-input, .mk-select, .mk-badge, .mk-textarea");
    if (!ctl) continue;
    box.textContent = `${Math.round(ctl.getBoundingClientRect().height)}px`;
  }
}

/* ---------- accent swatches, shared by every page ---------- */
export function wireAccent() {
  const root = document.documentElement;
  const stored = localStorage.getItem("mk-accent");
  if (stored) root.dataset.accent = stored;
  const sync = () => document.querySelectorAll("[data-accent-pick]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.accentPick === (root.dataset.accent ?? ""))));
  sync();

  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-accent-pick]");
    if (!s) return;
    const v = s.dataset.accentPick;
    if (v) root.dataset.accent = v; else delete root.dataset.accent;
    localStorage.setItem("mk-accent", v);
    sync();
    document.dispatchEvent(new CustomEvent("mk:accent"));
  });
}
