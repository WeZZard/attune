# Resource Guidelines

<RESOURCE_GUIDELINES>

Not injected at session start — `external-agents.sh matrix` surfaces the lock instructions whenever an exclusive resource is in play, and points here for the reasons.

## Exclusive resources (verified 2026-07)

- **`desktop`** (computer use) — cua itself is concurrency-safe by design: its No-Foreground Contract keeps the real cursor and frontmost app untouched, accessibility-element actions work on backgrounded windows, and per-agent app instances avoid same-app contention (per amplify `agents/computer-use-cua.md`, verified against cua.ai/docs). Attune serializes anyway because it cannot verify an external agent honors that discipline or avoids the app the human is using — a policy choice, not a technical necessity (human ruled).
- **`chrome-devtools-profile`** — default-config Chrome DevTools MCP instances share one persistent Chrome profile (`~/.cache/chrome-devtools-mcp/`); a second concurrent launch fails with "The browser is already running… Use --isolated" (github.com/ChromeDevTools/chrome-devtools-mcp issues #224, #292).
- **`playwright-profile`** — default-config Playwright MCP instances use a persistent profile guarded by the browser's own singleton lock; a concurrent second instance fails with "Browser is already in use… use --isolated" (microsoft/playwright-mcp README and issues #769, #891).

MCP instances configured with `--isolated` (or a distinct `--user-data-dir`) are parallel-safe. When every external agent's MCP config is isolated, remove that capability's `resource` field from `capabilities.json` — the lock disappears with the data.

## The lock

```bash
TOKEN=$(bash "${CLAUDE_PLUGIN_ROOT}/scripts/resource-lock.sh" acquire <resource> [--wait sec] [--ttl sec])
bash "${CLAUDE_PLUGIN_ROOT}/scripts/resource-lock.sh" release <resource> "$TOKEN"
bash "${CLAUDE_PLUGIN_ROOT}/scripts/resource-lock.sh" status
```

- `acquire` prints a release token and exits 0; it exits 75 while the resource is busy. `--wait N` retries for up to N seconds.
- `release` frees the lock only for the matching token, so one session cannot release another's lock by accident.
- Locks carry leases (default 900 s, `--ttl` to change): a lock abandoned by an interrupted run frees itself when the lease expires. Leases define staleness because callers are short-lived shell calls, not long-lived processes.
- Locks are machine-wide per user (they live under the user's temporary directory), which is exactly the contention domain of a desktop and its browser profiles.

Acquire before ANY use of the capability — probing already exercises the resource — and release when done, on success and failure alike. The router does this for its dispatches; anything else touching these resources directly owes the same discipline.

</RESOURCE_GUIDELINES>
