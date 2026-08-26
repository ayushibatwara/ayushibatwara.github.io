# ayushibatwara.github.io

Personal website. Plain HTML/CSS; page content is written in markdown and rendered in the browser by [marked](https://marked.js.org/) (vendored at `assets/js/marked.min.js` — no build step, no dependencies).

## Editing content

All content lives in `content/*.md` — open these in MarkText (or any editor):

- `content/home.md` → /
- `content/reading.md` → /reading/
- `content/writing.md` → /writing/

Push to publish. To add a page, copy `reading/index.html` to `newpage/index.html`, point its `data-md` at a new markdown file, and add the nav link in each HTML file.

## Sidenotes

Write `^[note text]` immediately after the text it annotates:

```
Some claim worth qualifying.^[The qualification, in the margin.] The paragraph continues.
```

Notes are numbered automatically and support inline markdown (links, italics). On small screens they collapse behind a tappable number.

Small-caps lead-in for a paragraph:

```
<span class="newthought">These notes</span> form a concise...
```

## Styling

`assets/css/style.css`. The accent color is `#003262` (the `--accent` variable at the top).

## Local preview

```
python3 -m http.server
```

Then open http://localhost:8000. (A server is needed because the pages fetch their markdown; opening the HTML files directly won't load content.)
