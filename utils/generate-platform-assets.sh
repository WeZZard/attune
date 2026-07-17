#!/bin/bash
# generate-platform-assets.sh — regenerate the Codex and Pi plugin skill
# trees (codex/, pi/) from the shared sources; --check verifies instead.
set -euo pipefail
src="${BASH_SOURCE[0]:-$0}"
case "$src" in
  */*) DIR="$(cd "${src%/*}" && pwd)" ;;
  *) DIR="$(pwd)" ;;
esac
exec node "$DIR/_generate-platform-assets.mjs" "$@"
