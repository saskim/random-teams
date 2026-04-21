#!/usr/bin/env bash
# Runs after every file edit — formats the changed file with Prettier.
set -euo pipefail

FILE_PATH=$(python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only format files Prettier understands
case "$FILE_PATH" in
  *.ts|*.html|*.scss|*.css|*.json|*.js|*.md)
    REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
    PRETTIER="$REPO_ROOT/node_modules/.bin/prettier"
    if [[ -x "$PRETTIER" ]]; then
      "$PRETTIER" --write "$FILE_PATH" 2>/dev/null || true
    fi
    ;;
esac
