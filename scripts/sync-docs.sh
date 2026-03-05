#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p docs/css docs/js docs/data

cp index.html docs/index.html
cp css/style.css docs/css/style.css
cp js/app.js docs/js/app.js
cp data/playas.geojson docs/data/playas.geojson

: > docs/.nojekyll

echo "✅ docs sincronizado desde raíz"
