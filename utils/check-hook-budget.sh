#!/bin/bash
# check-hook-budget.sh — commit gate over the SessionStart hook budgets.
set -euo pipefail
src="${BASH_SOURCE[0]:-$0}"
case "$src" in
  */*) DIR="$(cd "${src%/*}" && pwd)" ;;
  *) DIR="$(pwd)" ;;
esac
exec node "$DIR/_check-hook-budget.mjs" "$@"
