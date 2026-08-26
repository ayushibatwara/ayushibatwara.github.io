// Shared between the browser (site.js) and tools/render-math.cjs so both
// sides agree exactly on what counts as math and which SVG file it maps to.
//
// Syntax: $...$ for inline Typst math (no space just inside the $),
// $$...$$ for display math, \$ for a literal dollar sign.
(function (global) {
  const ESC = "\u0000D\u0000"; // placeholder for \$ (control char cannot appear in prose)

  function fnv64(str) {
    const bytes = new TextEncoder().encode(str);
    let h = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;
    const mask = 0xffffffffffffffffn;
    for (const b of bytes) {
      h = ((h ^ BigInt(b)) * prime) & mask;
    }
    return h.toString(16).padStart(16, "0");
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function svgPath(hash) {
    return `/assets/math/m-${hash}.svg`;
  }

  // Returns { text, snippets: [{mode, content, hash}] }. Code blocks and
  // inline code are left untouched.
  function transformMath(md) {
    const snippets = [];
    const seen = new Set();

    function add(mode, raw) {
      const content = raw.trim();
      const hash = fnv64(`${mode}:${content}`);
      if (!seen.has(hash)) {
        seen.add(hash);
        snippets.push({ mode, content, hash });
      }
      const cls = mode === "display" ? "math math-display" : "math math-inline";
      return `<img class="${cls}" src="${svgPath(hash)}" alt="${escapeHtml(content)}">`;
    }

    const protectedMd = md.replace(/\\\$/g, ESC);
    const parts = protectedMd.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/);
    const out = parts.map((part, i) => {
      if (i % 2 === 1) return part; // code — leave alone
      let t = part.replace(/\$\$([\s\S]+?)\$\$/g, (_, m) => `\n\n${add("display", m)}\n\n`);
      // inline math: $x$ or space-padded $ x $ (spaces required on BOTH
      // sides inside, so "$5 and $10" is never mistaken for math).
      // The tight form must run first or a tight snippet's closing $ can
      // mispair with the following snippet's opening $.
      t = t.replace(/\$(?!\s)([^$\n]+?)(?<!\s)\$/g, (_, m) => add("inline", m));
      t = t.replace(/\$[ \t]+([^$\n]+?)[ \t]+\$/g, (_, m) => add("inline", m));
      return t;
    });
    return { text: out.join("").replace(new RegExp(ESC, "g"), "\\$"), snippets };
  }

  const api = { fnv64, transformMath, svgPath };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.TypstMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
