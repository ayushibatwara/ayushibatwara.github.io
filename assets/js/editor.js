// In-browser editor (local only). Talks to the API in tools/serve.cjs:
// loads a markdown file into the textarea, live-renders the preview pane
// (reusing convertSidenotes/layoutSidenotes from site.js and TypstMath),
// and autosaves ~1s after you stop typing. Cmd+S saves immediately.

(function () {
  const select = document.getElementById("file-select");
  const textarea = document.getElementById("editor-text");
  const preview = document.getElementById("preview");
  const status = document.getElementById("save-status");
  const pageLink = document.getElementById("page-link");

  let current = null;
  let dirty = false;
  let saveTimer = null;
  let renderTimer = null;

  function pageUrlFor(file) {
    if (file.startsWith("drafts/")) return `/draft.html?f=${file}`;
    if (file === "content/home.md") return "/";
    const m = file.match(/^content\/(.+)\.md$/);
    return m ? `/${m[1]}/` : "/";
  }

  function render() {
    const { text } = TypstMath.transformMath(textarea.value);
    preview.innerHTML = marked.parse(convertSidenotes(text));
    layoutSidenotes(preview);
  }

  function setStatus(s) {
    status.textContent = s;
  }

  async function save() {
    if (!current || !dirty) return;
    dirty = false;
    setStatus("saving…");
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: current, text: textarea.value }),
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "save failed");
      setStatus(out.mathError ? "saved (math error — see terminal)" : "saved");
      render(); // math SVGs may have just been created
    } catch (err) {
      dirty = true;
      setStatus("SAVE FAILED");
      console.error(err);
    }
  }

  async function openFile(file) {
    if (dirty) await save();
    const res = await fetch(`/api/file?f=${encodeURIComponent(file)}`);
    textarea.value = await res.text();
    current = file;
    dirty = false;
    select.value = file;
    pageLink.href = pageUrlFor(file);
    history.replaceState(null, "", `/editor.html?f=${file}`);
    setStatus("saved");
    render();
  }

  async function loadList(selectFile) {
    const { files } = await (await fetch("/api/files")).json();
    select.innerHTML = "";
    for (const f of files) {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f.replace(/^content\//, "").replace(/\.md$/, "").replace(/^drafts\//, "draft: ");
      select.appendChild(opt);
    }
    const wanted = selectFile || new URLSearchParams(location.search).get("f");
    await openFile(wanted && files.includes(wanted) ? wanted : files[0]);
  }

  textarea.addEventListener("input", () => {
    dirty = true;
    setStatus("unsaved");
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 250);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 1000);
  });

  textarea.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      save();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end } = textarea;
      textarea.setRangeText("  ", s, end, "end");
      textarea.dispatchEvent(new Event("input"));
    }
  });

  select.addEventListener("change", () => openFile(select.value));

  document.getElementById("new-draft").addEventListener("click", async () => {
    const name = prompt("Draft name (becomes drafts/<name>.md):");
    if (!name) return;
    const slug = name.toLowerCase().trim().replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) return;
    const file = `drafts/${slug}.md`;
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: file, text: `# ${name}\n\n` }),
    });
    await loadList(file);
  });

  window.addEventListener("beforeunload", (e) => {
    if (dirty) {
      save();
      e.preventDefault();
    }
  });

  loadList().catch(() => {
    // no API — probably the live site, not the local server
    document.getElementById("editor-bar").style.display = "none";
    document.getElementById("editor-split").style.display = "none";
    document.getElementById("editor-offline").style.display = "block";
  });
})();
