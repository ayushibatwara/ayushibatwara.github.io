#!/bin/sh
# Publish the site: ./publish.sh "commit message"
# Renders math, commits everything, pushes main, and keeps the gh-pages
# deploy branch in sync. drafts/ is gitignored and never published.
set -e
cd "$(dirname "$0")"

node tools/render-math.cjs
git add -A
if git diff --cached --quiet; then
  echo "Nothing to publish."
  exit 0
fi
git commit -m "${1:-Update site}"
git push origin main

# GitHub Pages currently deploys from gh-pages; mirror main onto it.
# (Once Settings → Pages is switched to deploy from main, this block can go.)
git fetch origin gh-pages
MERGE=$(git commit-tree 'main^{tree}' -p origin/gh-pages -p main -m "Sync gh-pages with main")
git push origin "${MERGE}:refs/heads/gh-pages"

echo "Published — live at https://ayushibatwara.github.io in about a minute."
