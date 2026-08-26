#!/bin/sh
# Scaffold a new writing piece: tools/new-piece.sh <slug> "Title"
# Creates writing/<slug>/index.html and content/writing/<slug>.md,
# or wires up an existing content/writing/<slug>.md (e.g. moved from drafts/).
set -e
cd "$(dirname "$0")/.."

SLUG=$1
TITLE=${2:-$1}
if [ -z "$SLUG" ]; then
  echo "usage: tools/new-piece.sh <slug> \"Title\"" >&2
  exit 1
fi

mkdir -p "writing/$SLUG"
sed -e "s|/content/writing.md|/content/writing/$SLUG.md|" \
    -e "s|<title>Writing|<title>$TITLE|" \
    -e 's| class="active"||' \
    -e "s|<a href=\"/writing/\">|<a href=\"/writing/\" class=\"active\">|" \
    writing/index.html > "writing/$SLUG/index.html"

if [ ! -f "content/writing/$SLUG.md" ]; then
  printf '# %s\n\nWrite here.\n' "$TITLE" > "content/writing/$SLUG.md"
fi

echo "Created /writing/$SLUG/ -> content/writing/$SLUG.md"
echo "Now add it to the list in content/writing.md, then ./publish.sh"
