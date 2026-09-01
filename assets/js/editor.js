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
      if (out.mathError) console.error(out.mathError);
      setStatus(out.mathError ? "saved (math error — see console)" : "saved");
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
    updatePromote();
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

  const draftName = document.getElementById("draft-name");
  document.getElementById("new-draft").addEventListener("click", () => {
    draftName.style.display = "inline-block";
    draftName.focus();
  });
  draftName.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
      draftName.value = "";
      draftName.style.display = "none";
    }
    if (e.key !== "Enter") return;
    const name = draftName.value.trim();
    const slug = name.toLowerCase().replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) return;
    draftName.value = "";
    draftName.style.display = "none";
    const file = `drafts/${slug}.md`;
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: file, text: `# ${name}\n\n` }),
    });
    await loadList(file);
  });

  // "move to writing": promotes the open draft to content/writing/ and lists
  // it on the Writing page (see /api/promote in tools/serve.cjs). The button
  // reveals a select of the "## …" sections in content/writing.md; picking
  // one does the move. Nothing is committed — that's still the publish button.
  const promoteBtn = document.getElementById("promote-btn");
  const promoteSection = document.getElementById("promote-section");

  function updatePromote() {
    promoteBtn.style.display = current && current.startsWith("drafts/") ? "" : "none";
    promoteSection.style.display = "none";
  }

  promoteBtn.addEventListener("click", async () => {
    const md = await (await fetch("/api/file?f=content/writing.md")).text();
    const sections = [...md.matchAll(/^##\s+(.+)$/gm)].map((s) => s[1].trim());
    if (!sections.length) {
      setStatus("no ## sections in content/writing.md");
      return;
    }
    promoteSection.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.textContent = "section…";
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    promoteSection.appendChild(placeholder);
    for (const s of sections) {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      promoteSection.appendChild(opt);
    }
    promoteSection.style.display = "inline-block";
    promoteSection.focus();
  });

  promoteSection.addEventListener("keydown", (e) => {
    if (e.key === "Escape") promoteSection.style.display = "none";
  });

  promoteSection.addEventListener("change", async () => {
    const section = promoteSection.value;
    if (!section) return;
    promoteSection.style.display = "none";
    await save();
    setStatus("moving…");
    try {
      const res = await fetch("/api/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: current, section }),
      });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "promote failed");
      if (out.mathError) console.error(out.mathError);
      await loadList(out.file);
      setStatus("moved to writing ✓");
    } catch (err) {
      setStatus("MOVE FAILED — see console");
      console.error(err);
    }
  });

  const publishBtn = document.getElementById("publish-btn");
  const commitMsg = document.getElementById("commit-msg");
  async function publish() {
    publishBtn.disabled = true;
    await save();
    setStatus("publishing…");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commitMsg.value }),
      });
      const out = await res.json();
      console.log(out.output);
      if (!out.ok) throw new Error(out.output);
      setStatus(out.nothing ? "nothing to publish" : "published ✓");
      if (!out.nothing) commitMsg.value = "";
    } catch (err) {
      setStatus("PUBLISH FAILED — see console");
      console.error(err);
    } finally {
      publishBtn.disabled = false;
    }
  }
  publishBtn.addEventListener("click", publish);
  commitMsg.addEventListener("keydown", (e) => {
    if (e.key === "Enter") publish();
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
