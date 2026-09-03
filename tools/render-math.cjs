#!/usr/bin/env node
// Pre-renders every Typst math snippet found in content/**/*.md and
// drafts/**/*.md to an SVG in assets/math/, and prunes SVGs that are no
// longer referenced. Only missing SVGs are compiled, so re-runs are cheap.
//
// Usage: node tools/render-math.cjs [--quiet]

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const { transformMath } = require(path.join(root, "assets/js/math-common.js"));

const quiet = process.argv.includes("--quiet");
const mathDir = path.join(root, "assets/math");
fs.mkdirSync(mathDir, { recursive: true });

function mdFiles(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs, { recursive: true })
    .filter((f) => f.toString().endsWith(".md"))
    .map((f) => path.join(abs, f.toString()));
}

// 15.75pt ≈ the site's 21px body text, so math matches the prose size.
//
// Inline snippets need extra care: Typst sizes the auto page from the line's
// font metrics, and tall glyphs (a text-style integral, say) paint outside
// them and get cropped by the SVG viewBox. Ascender/descender edges put the
// baseline at the same offset in every inline SVG, and the 7pt vertical
// margin leaves room for the overflow; style.css cancels the padding with
// negative margins and realigns the baseline with a fixed vertical-align,
// so these numbers and the img.math-inline rule must move together.
function typstSource({ mode, content }) {
  if (mode === "typst") {
    // Content blocks (```typst fences): fixed page width = the site's 60%
    // text column (544px ≈ 408pt), so Typst wraps long lines itself and the
    // SVG renders 1:1 without CSS downscaling. New Computer Modern matches
    // the math snippets' text face.
    // bottom margin leaves room for the last line's descenders, which the
    // auto page height (sized from baseline metrics) would otherwise crop
    return (
      "#set page(width: 408pt, height: auto, margin: (x: 1.5pt, top: 1.5pt, bottom: 5pt))\n" +
      '#set text(font: "New Computer Modern", size: 15.75pt)\n' +
      `${content}\n`
    );
  }
  if (mode === "display") {
    return `#set page(width: auto, height: auto, margin: 1.5pt)\n#set text(size: 15.75pt)\n$ ${content} $\n`;
  }
  return (
    "#set page(width: auto, height: auto, margin: (x: 1.5pt, y: 7pt))\n" +
    '#set text(size: 15.75pt, top-edge: "ascender", bottom-edge: "descender")\n' +
    `$${content}$\n`
  );
}

const snippets = new Map();
for (const file of [...mdFiles("content"), ...mdFiles("drafts")]) {
  const inContent = !path.relative(root, file).startsWith("drafts");
  for (const s of transformMath(fs.readFileSync(file, "utf8")).snippets) {
    const existing = snippets.get(s.hash);
    snippets.set(s.hash, { ...s, inContent: (existing && existing.inContent) || inContent });
  }
}

let rendered = 0;
let failed = 0;
let contentFailed = 0;
const tmp = path.join(os.tmpdir(), `typst-math-${process.pid}.typ`);
for (const [hash, snippet] of snippets) {
  const out = path.join(mathDir, `m-${hash}.svg`);
  if (fs.existsSync(out)) continue;
  fs.writeFileSync(tmp, typstSource(snippet));
  try {
    execFileSync("typst", ["compile", tmp, out], { stdio: ["ignore", "ignore", "pipe"] });
    rendered++;
  } catch (err) {
    failed++;
    if (snippet.inContent) contentFailed++;
    console.error(
      `✗ typst failed on ${snippet.inContent ? "" : "(draft) "}${snippet.mode}: $${snippet.content}$`
    );
    console.error(String(err.stderr || err.message).trim());
  }
}
if (fs.existsSync(tmp)) fs.unlinkSync(tmp);

let pruned = 0;
for (const f of fs.readdirSync(mathDir)) {
  const m = f.match(/^m-([0-9a-f]{16})\.svg$/);
  if (m && !snippets.has(m[1])) {
    fs.unlinkSync(path.join(mathDir, f));
    pruned++;
  }
}

if (!quiet || rendered || failed || pruned) {
  console.log(
    `math: ${snippets.size} snippet(s), ${rendered} rendered, ${pruned} pruned` +
      (failed ? `, ${failed} FAILED` : "")
  );
}
// Only failures in published content block a publish; draft errors just warn.
process.exitCode = contentFailed ? 1 : 0;
