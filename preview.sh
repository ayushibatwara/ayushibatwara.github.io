#!/bin/sh
# Local preview with live math rendering: ./preview.sh
# Watches content/ and drafts/ and re-renders Typst math every 2s.
cd "$(dirname "$0")"
node tools/render-math.cjs
( while true; do sleep 2; node tools/render-math.cjs --quiet; done ) &
WATCHER=$!
trap 'kill $WATCHER 2>/dev/null' EXIT INT TERM
node tools/serve.cjs
