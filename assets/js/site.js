// Fetches the page's markdown file, converts ^[...] sidenote syntax to
// Tufte-style margin notes, and renders the result with marked.

// ==text== -> <mark>text</mark>, skipping code blocks and inline code.
// The opening == must touch the first character and the closing == the last,
// so comparison operators in prose ("a == b") are left alone.
function convertHighlights(md) {
  return md
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/)
    .map((part, i) =>
      i % 2 ? part : part.replace(/==(\S(?:[^\n=]*?\S)?)==/g, "<mark>$1</mark>")
    )
    .join("");
}

function convertSidenotes(md) {
  let n = 0;
  // ^[note text] — note text may contain [links](...) one level deep
  return md.replace(/\^\[((?:[^\[\]]|\[[^\]]*\])*)\]/g, (_, note) => {
    n += 1;
    return (
      `<label for="sn-${n}" class="margin-toggle sidenote-number"></label>` +
      `<input type="checkbox" id="sn-${n}" class="margin-toggle">` +
      // newlines collapse to spaces: inside a list item, marked would treat
      // a line holding only an <img> as a block and split it out of the span
      `<span class="sidenote">${marked.parseInline(note).replace(/\n/g, " ")}</span>`
    );
  });
}

(async function () {
  const footer = document.getElementById("last-updated");
  if (!footer) return;
  // Show when THIS page's markdown last changed, not the repo's last push:
  // ask GitHub for the most recent commit touching the page's source file.
  // (Drafts aren't in git, so their viewer just leaves the footer empty.)
  let path = document.querySelector("article[data-md]")?.dataset.md || "";
  if (!path) {
    const f = new URLSearchParams(location.search).get("f") || "";
    if (/^\/?(drafts|content)\/[\w./ -]+\.md$/.test(f)) path = f;
  }
  path = path.replace(/^\//, "");
  if (!path) return;
  try {
    const res = await fetch(
      "https://api.github.com/repos/ayushibatwara/ayushibatwara.github.io/commits" +
        `?sha=main&per_page=1&path=${encodeURIComponent(path)}`
    );
    if (!res.ok) return;
    const [latest] = await res.json();
    if (!latest) return; // file has never been committed (e.g. a draft)
    const date = new Date(latest.commit.committer.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    footer.textContent = `last updated on ${date}`;
  } catch (err) {
    // leave the footer empty if the API is unreachable
  }
})();

// ---- Writing index: title + teaser + date/reading-time cards ----

// Markdown -> readable prose: drop fences, display math, and footnotes;
// unwrap inline math and links. Used for teasers and word counts.
function pieceText(md) {
  return md
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, "\n\n")
    .replace(/\^\[(?:[^\[\]]|\[[^\]]*\])*\]/g, "")
    .replace(/\$\$[\s\S]*?\$\$/g, "\n\n")
    .replace(/\$([^$\n]+?)\$/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
}

function pieceTeaser(md) {
  const blocks = pieceText(md).split(/\n\s*\n/);
  const para =
    blocks.find((b) => {
      const t = b.trim();
      return t && !/^#|^[-*]\s|^\d+\.\s|^>|^_|^\|/.test(t);
    }) || "";
  const clean = para.replace(/[*_]{1,2}/g, "").replace(/\s+/g, " ").trim();
  return clean.length > 220 ? clean.slice(0, 220).replace(/\s+\S*$/, "") + "…" : clean;
}

function readingMinutes(md) {
  return Math.max(1, Math.round(pieceText(md).split(/\s+/).filter(Boolean).length / 200));
}

// Last-commit date for a file, cached per session to spare the API.
async function lastEdited(path) {
  const key = `edited:${path}`;
  try {
    const cached = sessionStorage.getItem(key);
    if (cached !== null) return cached;
  } catch {}
  let date = "";
  try {
    const res = await fetch(
      "https://api.github.com/repos/ayushibatwara/ayushibatwara.github.io/commits" +
        `?sha=main&per_page=1&path=${encodeURIComponent(path)}`
    );
    if (res.ok) {
      const [latest] = await res.json();
      if (latest)
        date = new Date(latest.commit.committer.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    }
  } catch {}
  try {
    sessionStorage.setItem(key, date);
  } catch {}
  return date;
}

async function renderWritingIndex(article, md) {
  article.innerHTML = "";
  const cards = [];
  for (const line of md.split("\n")) {
    const link = line.match(/^(?:-\s+)?\[([^\]]+)\]\((\/writing\/([\w-]+)\/)\)\s*$/);
    if (link) {
      const card = document.createElement("div");
      card.className = "piece-card";
      const a = document.createElement("a");
      a.className = "piece-title";
      a.href = link[2];
      a.textContent = link[1];
      const teaser = document.createElement("p");
      teaser.className = "piece-teaser";
      const meta = document.createElement("p");
      meta.className = "piece-meta";
      card.append(a, teaser, meta);
      article.appendChild(card);
      cards.push({ slug: link[3], teaser, meta });
    } else if (/^#\s/.test(line)) {
      const h = document.createElement("h1");
      h.textContent = line.slice(2);
      article.appendChild(h);
    } else if (/^##\s/.test(line)) {
      const h = document.createElement("h2");
      h.textContent = line.slice(3);
      article.appendChild(h);
    } else if (line.trim()) {
      const div = document.createElement("div");
      div.innerHTML = marked.parse(line);
      while (div.firstChild) article.appendChild(div.firstChild);
    }
  }
  await Promise.all(
    cards.map(async (c) => {
      try {
        const piece = await (await fetch(`/content/writing/${c.slug}.md`)).text();
        c.teaser.textContent = pieceTeaser(piece);
        const minutes = `${readingMinutes(piece)} min read`;
        c.meta.textContent = minutes;
        lastEdited(`content/writing/${c.slug}.md`).then((d) => {
          if (d) c.meta.textContent = `${d} · ${minutes}`;
        });
      } catch {}
    })
  );
}

// Place each sidenote in the right margin, level with its number, nudging
// notes down as needed so they never overlap.
function layoutSidenotes(article) {
  const notes = article.querySelectorAll(".sidenote, .marginnote");
  // Note heights depend on images (math SVGs) that may still be loading;
  // measure again once each one lands so notes don't overlap. The dataset
  // flag keeps repeat layout calls from stacking up duplicate listeners.
  article.querySelectorAll("img").forEach((img) => {
    if (!img.complete && !img.dataset.relayout) {
      img.dataset.relayout = "1";
      img.addEventListener("load", () => layoutSidenotes(article), { once: true });
    }
  });
  if (window.matchMedia("(max-width: 760px)").matches) {
    notes.forEach((n) => (n.style.top = ""));
    article.style.minHeight = "";
    return;
  }
  const articleTop = article.getBoundingClientRect().top;
  let lastBottom = -Infinity;
  notes.forEach((note) => {
    const anchor = note.previousElementSibling?.previousElementSibling || note.parentElement;
    let top = anchor.getBoundingClientRect().top - articleTop;
    if (top < lastBottom + 10) top = lastBottom + 10;
    note.style.top = `${top}px`;
    lastBottom = top + note.offsetHeight;
  });
  if (lastBottom > 0) article.style.minHeight = `${lastBottom}px`;
}

(async function () {
  const article = document.querySelector("article[data-md]");
  if (!article) return;
  let src = article.dataset.md;
  if (!src) {
    // draft.html viewer: /draft.html?f=drafts/my-piece.md
    const f = new URLSearchParams(location.search).get("f") || "";
    if (/^\/?(drafts|content)\/[\w./-]+\.md$/.test(f)) src = "/" + f.replace(/^\//, "");
  }
  if (!src) return;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`${res.status} fetching ${src}`);
    const md = await res.text();
    if (src === "/content/writing.md") {
      await renderWritingIndex(article, md);
      return;
    }
    article.innerHTML = marked.parse(
      convertSidenotes(convertHighlights(TypstMath.transformMath(md).text))
    );
    layoutSidenotes(article);
    // re-layout once webfonts land and whenever the window resizes
    document.fonts.ready.then(() => layoutSidenotes(article));
    window.addEventListener("resize", () => layoutSidenotes(article));
  } catch (err) {
    article.innerHTML =
      "<p>Couldn't load this page's content. If you opened the file directly, " +
      "run <code>python3 -m http.server</code> in the repo and open " +
      "<a href='http://localhost:8000'>localhost:8000</a> instead.</p>";
    console.error(err);
  }
})();
