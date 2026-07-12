#!/bin/bash
# detect-external-agents.sh — fast, free availability detection: which
# external agent CLIs are on PATH right now. Installed-only — it proves the
# binary exists, not that login, network, and model work. For the behavioral
# (paid) usability probe, run probe-external-agents.sh instead.
#
# Usage: detect-external-agents.sh          -> one JSON object to stdout
#        detect-external-agents.sh --lines  -> one "name: installed|missing" line per agent

set -u
AGENTS=(codex kimi agy cursor-agent grok)

if [ "${1:-}" = "--lines" ]; then
  for a in "${AGENTS[@]}"; do
    if p="$(command -v "$a" 2>/dev/null)"; then
      echo "- $a: installed ($p)"
    else
      echo "- $a: missing"
    fi
  done
  exit 0
fi

printf '{'
sep=""
for a in "${AGENTS[@]}"; do
  key="${a//-/_}"
  if p="$(command -v "$a" 2>/dev/null)"; then
    printf '%s"%s":{"installed":true,"path":"%s"}' "$sep" "$key" "$p"
  else
    printf '%s"%s":{"installed":false}' "$sep" "$key"
  fi
  sep=","
done
printf '}\n'
