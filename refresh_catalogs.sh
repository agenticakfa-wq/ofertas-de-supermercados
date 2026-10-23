#!/bin/sh
set -eu
cd /home/openclaw/.openclaw/workspace/ofertas-supermercados
python3 scrape_catalogs.py
git add -- data/latest.json
if git diff --cached --quiet -- data/latest.json; then
  exit 0
fi
git commit --only -m "Refresh daily supermarket offer snapshot" -- data/latest.json
git push origin main
