// Fetches the page's markdown file, converts ^[...] sidenote syntax to
// Tufte-style margin notes, and renders the result with marked.

function convertSidenotes(md) {
  let n = 0;
  // ^[note text] — note text may contain [links](...) one level deep
  return md.replace(/\^\[((?:[^\[\]]|\[[^\]]*\])*)\]/g, (_, note) => {
    n += 1;
    return (
      `<label for="sn-${n}" class="margin-toggle sidenote-number"></label>` +
      `<input type="checkbox" id="sn-${n}" class="margin-toggle">` +
      `<span class="sidenote">${marked.parseInline(note)}</span>`
    );
  });
}

(async function () {
  const footer = document.getElementById("last-updated");
  if (!footer) return;
  try {
    const res = await fetch(
      "https://api.github.com/repos/ayushibatwara/ayushibatwara.github.io/commits?sha=main&per_page=1"
    );
    if (!res.ok) return;
    const [latest] = await res.json();
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

// Place each sidenote in the right margin, level with its number, nudging
// notes down as needed so they never overlap.
function layoutSidenotes(article) {
  const notes = article.querySelectorAll(".sidenote, .marginnote");
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
    article.innerHTML = marked.parse(convertSidenotes(TypstMath.transformMath(md).text));
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
