# CLAUDE.md

## Domain boundary (human ruled)

Attune holds human-ruled subjective knowledge only: communication and
output-style guidelines, and external agent usage rules. It is fully disjoint
from every other knowledge system (retrospect, project docs, Claude Code auto
memory) — no shared vocabulary, no cross-routing. World facts and measured
lessons are never recorded here.

## The guidelines are the product

`references/*.md` is what the plugin exists to deliver: the user's standing
rulings, injected at session start. They change solely by the user's explicit
editorial decision — an ordinary edit the user makes or directs, outside any
attune skill — and git history is the review trail. When the user does fold
research- or experiment-informed rules in, inline provenance marks
(`(per <source>)`, `(per experiment <name>)`) carry the evidence.

`references/communication-guidelines.md` was seeded from amplify's
`references/communication-style-guidelines.md` and diverges as the user
maintains it — it is NOT vendored-frozen.

**Guidelines authoring style (human ruled):** principles are numbered
**MUST:** / **MUST NOT:** lists ("1. You **MUST** …"). Factual material —
contract templates, category tables, findings, command blocks — stays
structural; only the rules take the list form.

## Injection budget

Hook output is capped at 10,000 characters per command
(code.claude.com/docs/en/hooks). Injection is split into one hook per
guidelines document (`hooks/session-start-*.mjs`) so each document has its
own cap. All truncate past 9,500 characters (`CONTEXT_LIMIT` in
`hooks/_lib.mjs`, the single source of truth) with a visible warning. The pre-commit gate
(`utils/check-hook-budget.sh`, wired through `.githooks/pre-commit`;
enable per clone with `git config core.hooksPath .githooks`) fails any commit
that would truncate: it runs each real hook against a fixture PATH with every
agent installed and requires 300 characters of headroom for machine-dependent
path lengths. A new reference document means a new hook, not a bigger one —
or no hook at all when a command's output surfaces it progressively
(`references/resource-guidelines.md` is the latter: `external-agents.sh
matrix` prints the lock instructions when they apply and points to the doc
for the reasons; it is never injected).

## External agent routing

The task categories in `references/external-agents-guidelines.md` are the
single source of truth for agent selection; the router
(`agents/external-agent.md`) reads them at runtime and never restates them.
Each category lists agents in priority order (human ruled: Codex before Kimi
for browser and computer use) — never reshape it back into per-agent
strength lists, and never list invocations there (they live in the
registry). The
router verifies parameters against each CLI's current `--help` before every
launch (human ruled: external CLIs update frequently — never invoke from
memory). When the router reports that a CLI's help contradicts the matrix,
updating the matrix's last-verified line is the user's editorial act. The
brief is markdown: `## Metadata` (GOAL/TAGS/AGENTS/CAPABILITIES_MARKER), the
task prompt inside `<EXTERNAL_AGENT_TASK_PROMPT>` tags, and `## Response` —
the report shape the router owes the main conversation. A Response section
that demands artifact paths makes the external agent reply with explicit
`ARTIFACT_PATH:` lines, which the router passes through verbatim.

Tool-dependent strengths (MCP-armed: browser use, computer use) are gated by
capability flags probed behaviorally. The router's single probe step is
`external-agents.sh matrix` — one call, all agents, installed/usable/capable
in parallel, memoized in a marker (Fable-class turns cost minutes; never
design a flow that probes layer-by-layer). The matrix output also carries the
lock commands for exclusive resources — progressive disclosure: the lock
protocol reaches an agent exactly when a locked capability concerns it, and
`references/resource-guidelines.md` (never injected) holds the reasons.
`capabilities.json` fields:

- `capabilities.<name>` — one probe definition, shared by every agent that
  lists it: `prompt` (must make the agent exercise the tool, echo
  tool-derived data back, and offer `CAPABILITY_MISSING` as the honest
  failure reply), `expect` (the substring proving success; reduction is
  fail-closed: ok = exit 0, `expect` present, `CAPABILITY_MISSING` absent),
  and `strength` (what the flag gates, for the human reading the file).
- `agents.<agent>.invocation` — argv template for one headless run of this
  agent; `{prompt}` marks the argument the prompt replaces. Serves the probes
  AND the router's last-verified launch baseline — the registry is the only
  place invocations live; never restate them in a guidelines document.
- `agents.<agent>.prompt_via` — present and `"stdin"` when the CLI takes the
  prompt on stdin; the argv then carries no `{prompt}`.
- `agents.<agent>.probe` — the capability names probed for this agent; each
  reduces to the flag `<agent>.<capability>`.
- `capabilities.<name>.resource` — present when the capability occupies an
  exclusive machine resource (verified: default-config Chrome DevTools MCP
  and Playwright MCP each collide on a shared persistent browser profile;
  the desktop is exclusive by ruling). The router serializes use through
  `scripts/resource-lock.sh` (mkdir-atomic, token-guarded release, 900 s
  lease reclaim). Absent when the resource is parallel-safe — remove it when
  the user's MCP configs run `--isolated`.

Adding a tool-dependent strength = one `capabilities` entry plus its
`requires` note in the matrix; checking whether another agent supports an
existing tool = adding the capability name to that agent's `probe` list. No
script or router change either way.

## Command naming convention (human ruled)

Every public command is a shell script; when the implementation is
JavaScript, the wrapper just `exec`s node on it. JavaScript not exposed as a
command carries an underscore prefix (`_*.mjs`) — wrappers are the stable
surface, underscored internals may be reshaped freely. Hook entry points
(`hooks/session-start-*.mjs`) are wired in `hooks.json`, not typed by users,
and keep plain names; their shared internals are underscored
(`hooks/_lib.mjs`). Placement: `scripts/` holds runtime commands the plugin
surface calls; `utils/` holds development tooling (the commit gate).

`scripts/external-agents.sh` is the one public command for agent facts —
subcommands `installed` (free), `usable` (paid), `capable` (paid) mirror the
guidelines' three fact layers, and `capabilities.json` is the agent registry
every layer reads (an agent with an empty `probe` list exists for identity
and detection alone). The free and paid paths stay separate underneath so no
unconditional caller can drift into paid probes.

## Vendored code (never hand-edit)

- `scripts/probe-external-agents.sh` — from amplify
  `skills/capability-preflight/probe.sh`, verbatim.

Re-vendor from amplify to update; divergences belong in new files (e.g.
`scripts/worktree.sh`, `scripts/external-agents.sh` and its underscored
internals).

## Open items

- The vendored probe script still probes `cua-driver` (an amplify concern);
  harmless, drop on the next vendoring pass if amplify splits it.
- If the injected verification guidelines do not move the model's behavior,
  escalate to a Stop hook that checks for unverified claims before the turn
  ends; reconsider an attune verify skill only if Claude Code's built-in one
  proves absent or too shallow — never ship a competing duplicate.
- Amplify injects the same communication guidelines at SessionStart; once
  attune is installed alongside it, that injection is redundant and should be
  retired from amplify.
