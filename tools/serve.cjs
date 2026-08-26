#!/usr/bin/env node
// Local preview + editor server (used by ./preview.sh). Serves the site
// statically and exposes a tiny API for editor.html:
//   GET  /api/files          -> { files: ["content/home.md", "drafts/x.md", ...] }
//   GET  /api/file?f=<path>  -> raw markdown
//   POST /api/save           -> { path, text }  writes the file, re-renders math
// Only *.md files under content/ and drafts/ are readable/writable.
// Binds to 127.0.0.1 — never exposed beyond this machine.

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const root = path.join(__dirname, "..");
const PORT = 8000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function safeMdPath(p) {
  if (typeof p !== "string") return null;
  const clean = p.replace(/^\/+/, "");
  if (!/^(content|drafts)\/[\w./ -]+\.md$/.test(clean) || clean.includes("..")) return null;
  return path.join(root, clean);
}

function listMd(dir) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs, { recursive: true })
    .filter((f) => f.toString().endsWith(".md"))
    .map((f) => `${dir}/${f}`)
    .sort();
}

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function renderMath(cb) {
  execFile("node", [path.join(__dirname, "render-math.cjs"), "--quiet"], (err, stdout, stderr) => {
    cb(err ? String(stderr || err.message).trim() : null, String(stdout).trim());
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/files") {
    return json(res, 200, { files: [...listMd("content"), ...listMd("drafts")] });
  }

  if (url.pathname === "/api/file") {
    const abs = safeMdPath(url.searchParams.get("f"));
    if (!abs || !fs.existsSync(abs)) return json(res, 404, { error: "not found" });
    res.writeHead(200, { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store" });
    return res.end(fs.readFileSync(abs));
  }

  if (url.pathname === "/api/save" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        return json(res, 400, { error: "bad json" });
      }
      const abs = safeMdPath(payload.path);
      if (!abs || typeof payload.text !== "string") return json(res, 400, { error: "bad path or text" });
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, payload.text);
      renderMath((mathErr, mathOut) => json(res, 200, { ok: true, mathError: mathErr, math: mathOut }));
    });
    return;
  }

  if (url.pathname === "/api/publish" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let message = "Update site";
      try {
        const m = JSON.parse(body).message;
        if (typeof m === "string" && m.trim()) message = m.trim();
      } catch {}
      execFile(
        path.join(root, "publish.sh"),
        [message],
        { cwd: root, timeout: 180000 },
        (err, stdout, stderr) => {
          const output = `${stdout}${stderr}`.trim();
          if (err) return json(res, 500, { ok: false, output });
          json(res, 200, { ok: true, nothing: output.includes("Nothing to publish"), output });
        }
      );
    });
    return;
  }

  // static files
  let p = decodeURIComponent(url.pathname);
  if (p.includes("..")) return json(res, 400, { error: "bad path" });
  let abs = path.join(root, p);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) abs = path.join(abs, "index.html");
  if (!fs.existsSync(abs)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("404");
  }
  res.writeHead(200, {
    "Content-Type": MIME[path.extname(abs)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(fs.readFileSync(abs));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`  Site:   http://localhost:${PORT}`);
  console.log(`  Editor: http://localhost:${PORT}/editor.html`);
});
