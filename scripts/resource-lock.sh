#!/bin/bash
# resource-lock.sh — machine-wide advisory locks for exclusive resources
# (the desktop for computer use, a shared browser profile). Locks live under
# ${TMPDIR:-/tmp}/attune-locks/<resource>.lock — per-user on macOS, shared by
# every session of that user, which is exactly the contention domain.
#
#   resource-lock.sh acquire <resource> [--wait <sec>] [--ttl <sec>]
#       Prints a release token and exits 0 on success; exits 75 while busy.
#       --wait N retries for up to N seconds (default 0: one attempt).
#       --ttl N sets the lease in seconds (default 900). A lock past its
#       lease is stale and reclaimed by the next acquirer — leases exist
#       because callers are short-lived shell calls, not long-lived
#       processes, so PID liveness cannot define staleness.
#   resource-lock.sh release <resource> <token>
#       Releases only when the token matches; exits 73 on mismatch, so one
#       session cannot release another session's lock by accident.
#   resource-lock.sh status
#       One line per held lock: resource, seconds until lease expiry.

set -euo pipefail
BASE="${TMPDIR:-/tmp}/attune-locks"
mkdir -p "$BASE"

cmd="${1:?usage: resource-lock.sh acquire|release|status ...}"
shift
case "$cmd" in
  acquire)
    resource="${1:?resource name}"
    shift
    wait_s=0
    ttl=900
    while [ $# -gt 0 ]; do
      case "$1" in
        --wait) wait_s="${2:?--wait seconds}"; shift 2 ;;
        --ttl) ttl="${2:?--ttl seconds}"; shift 2 ;;
        *) echo "unknown option: $1" >&2; exit 64 ;;
      esac
    done
    lock="$BASE/$resource.lock"
    waited=0
    while :; do
      if mkdir "$lock" 2>/dev/null; then
        token="$$-$RANDOM-$RANDOM"
        printf '%s' "$token" > "$lock/token"
        printf '%s' "$(( $(date +%s) + ttl ))" > "$lock/expires"
        echo "$token"
        exit 0
      fi
      expires="$(cat "$lock/expires" 2>/dev/null || echo 0)"
      if [ "$(date +%s)" -gt "$expires" ]; then
        rm -rf "$lock"
        continue
      fi
      if [ "$waited" -ge "$wait_s" ]; then
        echo "busy: $resource (lease expires in $(( expires - $(date +%s) ))s)" >&2
        exit 75
      fi
      sleep 1
      waited=$(( waited + 1 ))
    done
    ;;
  release)
    resource="${1:?resource name}"
    token="${2:?release token}"
    lock="$BASE/$resource.lock"
    held="$(cat "$lock/token" 2>/dev/null || true)"
    if [ -z "$held" ]; then
      exit 0
    fi
    if [ "$held" != "$token" ]; then
      echo "token mismatch for $resource — not releasing" >&2
      exit 73
    fi
    rm -rf "$lock"
    ;;
  status)
    now="$(date +%s)"
    found=0
    for lock in "$BASE"/*.lock; do
      [ -d "$lock" ] || continue
      found=1
      name="$(basename "$lock" .lock)"
      expires="$(cat "$lock/expires" 2>/dev/null || echo 0)"
      echo "- $name: held, lease expires in $(( expires - now ))s"
    done
    [ "$found" -eq 1 ] || echo "(no locks held)"
    ;;
  *)
    echo "unknown subcommand: $cmd (acquire|release|status)" >&2
    exit 64
    ;;
esac
