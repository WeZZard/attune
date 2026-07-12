#!/bin/bash
# external-agents.sh — the public command for external agent facts, one
# subcommand per fact layer (references/external-agents-guidelines.md):
#
#   external-agents.sh installed [--lines]
#       Free PATH detection of every agent in the capabilities.json registry.
#       No probes, no cost, no side effects — safe at every session start.
#
#   external-agents.sh usable <marker.json>
#       Behavioral usability probe (vendored from amplify): one minimal PAID
#       prompt per agent, proving binary + login + network + model.
#
#   external-agents.sh capable <marker.json> [--only agent.capability ...]
#       Tool-capability probe: one meaningful PAID prompt per agent×capability
#       (browser use, computer use), reduced fail-closed to flags.

set -euo pipefail
# Builtin-only directory resolution — this wrapper must work on a minimal
# PATH (no coreutils), since callers control PATH tightly in tests.
src="${BASH_SOURCE[0]:-$0}"
case "$src" in
  */*) DIR="$(cd "${src%/*}" && pwd)" ;;
  *) DIR="$(pwd)" ;;
esac

cmd="${1:?usage: external-agents.sh installed|usable|capable ...}"
shift
case "$cmd" in
  installed) exec node "$DIR/_detect-external-agents.mjs" "$@" ;;
  usable)    exec bash "$DIR/probe-external-agents.sh" "$@" ;;
  capable)   exec node "$DIR/_probe-capabilities.mjs" "$@" ;;
  *)
    echo "unknown subcommand: $cmd (installed|usable|capable)" >&2
    exit 64
    ;;
esac
