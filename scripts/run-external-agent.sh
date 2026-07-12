#!/bin/bash
# run-external-agent.sh — the shared runner behind the external-agent driver
# subagents (codex, kimi, agy, cursor-agent, grok). One implementation of the
# setup / launch / probe-window / verbatim-return protocol; each driver .md is
# a thin prompt that calls these subcommands and returns `return`'s output.
#
# Usage:
#   run-external-agent.sh setup                     -> prints a fresh workdir; the
#                                                      caller writes the task prompt
#                                                      to <workdir>/prompt
#   run-external-agent.sh launch <tool> <workdir>   -> runs the tool headless and
#                                                      read-only over <workdir>/prompt
#                                                      (run this in the background);
#                                                      output -> <workdir>/out, single
#                                                      trailer line -> <workdir>/meta
#                                                      on exit
#   run-external-agent.sh probe <workdir>           -> one foreground probe window
#                                                      (<= ~9 min); prints exactly one
#                                                      of: [hb] heartbeat, [window]
#                                                      still-running, [done], [dead]
#   run-external-agent.sh return <workdir>          -> guarded degraded-trailer
#                                                      synthesis if the launch died
#                                                      without one, then cat out +
#                                                      "---" + trailer
#
# Tools and their fixed, read-only invocations (no model choice, no extra flags):
#   codex         codex exec --skip-git-repo-check -s read-only -c approval_policy=never -C "$PWD"  (prompt on stdin)
#   kimi          kimi -p "<prompt>" --output-format text, under a clone of the real
#                 KIMI_CODE_HOME (~/.kimi-code) whose config gains deny rules for the
#                 Write/Edit/Bash tools (login and model config survive the clone)
#   agy           agy -p "<prompt>" --sandbox --print-timeout 30m (permission-gated tools stay denied)
#   cursor-agent  cursor-agent -p --mode ask --output-format text --trust --model auto "<prompt>"
#   grok          grok -p "<prompt>" --output-format plain --permission-mode plan
#
# Heartbeat cadence (anchored to the launch epoch): every 60 s for the first ten
# minutes, every 300 s to twenty minutes, every 600 s after; a probe window with
# no beat due returns a [window] line at ~9 min. No deadline is imposed and the
# tool is never killed — STALL / FAILURE-SIGNATURE markers are report-only.

set -u

cmd="${1:?usage: run-external-agent.sh setup | launch <tool> <workdir> | probe <workdir> | return <workdir>}"

trailer() { # tool pid exit state -> the single machine trailer line
  printf '[amplify-external-agent] tool=%s pid=%s exit=%s state=%s\n' "$1" "$2" "$3" "$4"
}

case "$cmd" in

setup)
  d="$(mktemp -d)"
  echo "$d"
  ;;

launch)
  tool="${2:?launch needs <tool>}"; d="${3:?launch needs <workdir>}"
  prompt="$d/prompt"; out="$d/out"; meta="$d/meta"; state="$d/state"
  [ -s "$prompt" ] || { echo "run-external-agent: $prompt is missing or empty" >&2; exit 1; }
  : > "$out"; : > "$meta"
  printf 'start=%s\nnext=60\nlastlines=0\nstall=0\n' "$(date +%s)" > "$state"
  echo "$tool" > "$d/tool"

  case "$tool" in
    codex)
      codex exec --skip-git-repo-check -s read-only -c approval_policy=never -C "$PWD" < "$prompt" > "$out" 2>&1 &
      ;;
    kimi)
      # Clone the real Kimi home (login credentials + model config survive),
      # then APPEND deny rules for the file-modifying built-in tools.
      kimihome="$(mktemp -d)"
      kimisrc="${KIMI_CODE_HOME:-$HOME/.kimi-code}"
      [ -d "$kimisrc" ] && cp -R "$kimisrc/." "$kimihome/" 2>/dev/null
      cat >> "$kimihome/config.toml" <<'EOF'

[[permission.rules]]
decision = "deny"
pattern = "Write"

[[permission.rules]]
decision = "deny"
pattern = "Edit"

[[permission.rules]]
decision = "deny"
pattern = "Bash"
EOF
      KIMI_CODE_HOME="$kimihome" kimi -p "$(cat "$prompt")" --output-format text < /dev/null > "$out" 2>&1 &
      ;;
    agy)
      agy -p "$(cat "$prompt")" --sandbox --print-timeout 30m < /dev/null > "$out" 2>&1 &
      ;;
    cursor-agent)
      cursor-agent -p --mode ask --output-format text --trust --model auto "$(cat "$prompt")" < /dev/null > "$out" 2>&1 &
      ;;
    grok)
      grok -p "$(cat "$prompt")" --output-format plain --permission-mode plan < /dev/null > "$out" 2>&1 &
      ;;
    *)
      echo "run-external-agent: unknown tool \"$tool\"" >&2; exit 1
      ;;
  esac

  cpid=$!
  echo "cpid=$cpid" >> "$state"
  wait "$cpid"; rc=$?
  trailer "$tool" "$cpid" "$rc" exited > "$meta"
  ;;

probe)
  d="${2:?probe needs <workdir>}"
  out="$d/out"; meta="$d/meta"; state="$d/state"
  wstart=$(date +%s)
  while :; do
    sleep 15
    . "$state"
    now=$(date +%s)
    if [ -s "$meta" ]; then
      echo "[done] lines=$(( $(wc -l < "$out") )) workdir=$d"
      exit 0
    fi
    if [ -z "${start:-}" ] || [ -z "${cpid:-}" ]; then
      [ $(( now - wstart )) -ge 60 ] && { echo "[dead] launch never recorded state/cpid; run the return step"; exit 0; }
      continue
    fi
    el=$(( now - start ))
    if ! kill -0 "$cpid" 2>/dev/null; then
      sleep 5
      if [ -s "$meta" ]; then
        echo "[done] lines=$(( $(wc -l < "$out") )) workdir=$d"
      else
        echo "[dead] elapsed=${el}s pid=${cpid} gone without trailer; run the return step"
      fi
      exit 0
    fi
    if [ "$el" -ge "$next" ]; then
      lines=$(( $(wc -l < "$out") )); delta=$(( lines - lastlines )); lastlines=$lines
      [ "$delta" -eq 0 ] && stall=$((stall+1)) || stall=0
      warn=""; [ "$stall" -ge 2 ] && warn=" STALL(no-growth ${stall} beats)"
      fail=""; grep -qE 'Traceback|Killed|OOM|Segmentation fault' "$out" && fail=" FAILURE-SIGNATURE"
      echo "[hb] elapsed=${el}s lines=${lines} (+${delta})${warn}${fail} | $(tail -n1 "$out" | cut -c1-100)"
      if   [ "$el" -lt 600 ];  then next=$((next+60))
      elif [ "$el" -lt 1200 ]; then next=$((next+300))
      else next=$((next+600)); fi
      printf 'start=%s\nnext=%s\nlastlines=%d\nstall=%d\ncpid=%s\n' "$start" "$next" "$lastlines" "$stall" "$cpid" > "$state"
      echo "[window] beat emitted; run the next probe"
      exit 0
    fi
    [ $(( now - wstart )) -ge 540 ] && { echo "[window] elapsed=${el}s still running; run the next probe"; exit 0; }
  done
  ;;

return)
  d="${2:?return needs <workdir>}"
  out="$d/out"; meta="$d/meta"; state="$d/state"
  tool="$(cat "$d/tool" 2>/dev/null || echo unknown)"
  if [ ! -s "$meta" ]; then
    cpid="$(. "$state" 2>/dev/null; echo "${cpid:-unknown}")"
    if [ "$cpid" = "unknown" ]; then
      trailer "$tool" unknown unknown launch-failed > "$meta"
    else
      trailer "$tool" "$cpid" unknown killed > "$meta"
    fi
  fi
  cat "$out"; printf '\n---\n'; cat "$meta"
  ;;

*)
  echo "run-external-agent: unknown subcommand \"$cmd\"" >&2; exit 1
  ;;
esac
