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
function typstSource({ mode, content }) {
  const body = mode === "display" ? `$ ${content} $` : `$${content}$`;
  return `#set page(width: auto, height: auto, margin: 1.5pt)\n#set text(size: 15.75pt)\n${body}\n`;
}

const snippets = new Map();
for (const file of [...mdFiles("content"), ...mdFiles("drafts")]) {
  for (const s of transformMath(fs.readFileSync(file, "utf8")).snippets) {
    snippets.set(s.hash, s);
  }
}

let rendered = 0;
let failed = 0;
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
    console.error(`✗ typst failed on: ${snippet.mode} $${snippet.content}$`);
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
process.exitCode = failed ? 1 : 0;
