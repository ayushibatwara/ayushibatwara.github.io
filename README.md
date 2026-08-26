# ayushibatwara.github.io

Personal website, rendered by GitHub Pages with Jekyll. Edit the markdown, push to `main`, and the site rebuilds automatically — no build step.

## Pages

- `index.md` — home
- `reading.md` — /reading/
- `writing.md` — /writing/

To add a page: create `foo.md` with the same front matter (`layout: default`, `title:`, `permalink: /foo/`) and add a link to it in `_layouts/default.html`.

## Sidenotes

Numbered sidenote (the `id` just needs to be unique within the page):

```
Some text{% raw %}{% include sidenote.html id="1" note="The note text." %}{% endraw %} continues here.
```

Unnumbered margin note:

```
{% raw %}{% include marginnote.html id="a" note="The note text." %}{% endraw %}
```

Small-caps lead-in for a paragraph:

```
<span class="newthought">These notes</span> form a concise...
```

## Styling

Everything lives in `assets/css/style.css`. The accent color is `#003262` (the `--accent` variable at the top).

## Local preview (optional)

```
gem install bundler && bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.
