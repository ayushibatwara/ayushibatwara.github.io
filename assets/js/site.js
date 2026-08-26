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
  const article = document.querySelector("article[data-md]");
  if (!article) return;
  try {
    const res = await fetch(article.dataset.md);
    if (!res.ok) throw new Error(`${res.status} fetching ${article.dataset.md}`);
    const md = await res.text();
    article.innerHTML = marked.parse(convertSidenotes(md));
  } catch (err) {
    article.innerHTML =
      "<p>Couldn't load this page's content. If you opened the file directly, " +
      "run <code>python3 -m http.server</code> in the repo and open " +
      "<a href='http://localhost:8000'>localhost:8000</a> instead.</p>";
    console.error(err);
  }
})();
