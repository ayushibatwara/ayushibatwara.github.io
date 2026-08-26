# ayushibatwara.github.io

Personal website. Plain HTML/CSS; page content is written in markdown and rendered in the browser by [marked](https://marked.js.org/) (vendored, no build step). Typst math is pre-rendered to SVGs by a small script.

## Daily workflow

```
./preview.sh                       # local preview at localhost:8000, math re-renders as you save
./publish.sh "what changed"        # render math + commit + push + deploy
```

While `./preview.sh` is running, **http://localhost:8000/editor.html** is a browser editor: pick any page or draft, type markdown on the left, see the fully rendered page (sidenotes, math) on the right. It autosaves to disk about a second after you stop typing (Cmd+S to save immediately), and "new draft" creates a file in `drafts/`. The **publish** button (with an optional commit message) runs the same flow as `./publish.sh` — commit everything, push, deploy. Note it commits *all* pending changes in the repo, not just the open file. Editing in MarkText or any other editor still works the same as before.

## Pages

- `content/home.md` → /
- `content/reading.md` → /reading/
- `content/writing.md` → /writing/ (the index, with Technical and Essays sections)
- `content/writing/<slug>.md` → /writing/`<slug>`/ (individual pieces)

## Drafts → published pieces

1. Write in `drafts/my-piece.md` (gitignored — never published).
2. Preview it at `http://localhost:8000/draft.html?f=drafts/my-piece.md` while running `./preview.sh`.
3. When it's ready:

```
mv drafts/my-piece.md content/writing/my-piece.md
tools/new-piece.sh my-piece "My Piece Title"     # creates the /writing/my-piece/ page
# add a link under Technical or Essays in content/writing.md
./publish.sh "publish: My Piece Title"
```

## Typst math

Write Typst notation directly in the markdown:

- Inline: `$x^2 + y^2 = z^2$` (no space just inside the `$`)
- Display: `$$ integral_0^infinity e^(-x^2) dif x = sqrt(pi)/2 $$`
- Literal dollar sign: `\$`

`tools/render-math.cjs` (run automatically by preview/publish) compiles each snippet with the Typst CLI (`brew install typst`) into an SVG in `assets/math/`, keyed by content hash; the page swaps them in at render time. Unused SVGs are pruned automatically.

## Sidenotes

Write `^[note text]` immediately after the text it annotates:

```
Some claim worth qualifying.^[The qualification, in the margin.] The paragraph continues.
```

Numbered automatically; inline markdown and math work inside. On small screens they collapse behind a tappable number. Small-caps lead-in: `<span class="newthought">Like this</span>`.

## Styling

`assets/css/style.css`. The accent color is `#003262` (the `--accent` variable at the top).

## Deploy plumbing

GitHub Pages currently deploys from the `gh-pages` branch; `publish.sh` mirrors `main` onto it after each push. Once repo Settings → Pages is switched to deploy from `main`, that block in `publish.sh` can be deleted along with the `gh-pages` branch.
