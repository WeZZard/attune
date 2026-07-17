#!/bin/bash
# check-plugins.sh — commit gate over the three plugin packagings
# (Claude Code, Codex, Pi).
set -euo pipefail
src="${BASH_SOURCE[0]:-$0}"
case "$src" in
  */*) DIR="$(cd "${src%/*}" && pwd)" ;;
  *) DIR="$(pwd)" ;;
esac
exec node "$DIR/_check-plugins.mjs" "$@"
