#!/bin/sh
# Local preview with live math rendering: ./preview.sh
# Watches content/ and drafts/ and re-renders Typst math every 2s.
cd "$(dirname "$0")"
node tools/render-math.cjs
( while true; do sleep 2; node tools/render-math.cjs --quiet; done ) &
WATCHER=$!
trap 'kill $WATCHER 2>/dev/null' EXIT INT TERM
echo ""
echo "  Site:   http://localhost:8000"
echo "  Drafts: http://localhost:8000/draft.html?f=drafts/<name>.md"
echo ""
python3 -m http.server 8000
