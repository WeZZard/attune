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

## Injection budget

Hook output is capped at 10,000 characters per command
(code.claude.com/docs/en/hooks). Injection is split into one hook per
guidelines document — `hooks/session-start-communication.mjs` and
`hooks/session-start-external-agents.mjs` — so each document has its own cap.
Both truncate past 9,500 characters (`CONTEXT_LIMIT` in `hooks/lib.mjs`, the
single source of truth) with a visible warning. The pre-commit gate
(`scripts/check-hook-budget.mjs`, wired through `.githooks/pre-commit`;
enable per clone with `git config core.hooksPath .githooks`) fails any commit
that would truncate: it runs each real hook against a fixture PATH with every
agent installed and requires 300 characters of headroom for machine-dependent
path lengths. A new reference document means a new hook, not a bigger one.

## External agent routing

The selection matrix in `references/external-agents-guidelines.md` is the
single source of truth for agent strengths and last-verified invocations; the
router (`agents/router.md`) reads it at runtime and never restates it. The
router verifies parameters against each CLI's current `--help` before every
launch (human ruled: external CLIs update frequently — never invoke from
memory). When the router reports that a CLI's help contradicts the matrix,
updating the matrix's last-verified line is the user's editorial act. Briefs
with `OUTPUT: artifact` make the external agent reply with explicit
`ARTIFACT_PATH:` lines, which the router passes through verbatim.

Tool-dependent strengths (MCP-armed: browser use, computer use) are gated by
capability flags probed behaviorally by `scripts/probe-capabilities.mjs` from
`capabilities.json` — the matrix names them as `requires <agent>.<capability>`
and the router never proceeds on an unprobed flag. `capabilities.json` fields:

- `invocation` — argv template for one headless probe run of this agent;
  `{prompt}` marks the argument the probe prompt replaces.
- `prompt_via` — present and `"stdin"` when the CLI takes the prompt on
  stdin; the argv then carries no `{prompt}`.
- `capabilities.<name>.prompt` — the probe prompt; it must make the agent
  exercise the tool and echo tool-derived data back, and it must offer
  `CAPABILITY_MISSING` as the honest failure reply.
- `capabilities.<name>.expect` — the substring proving success. Reduction is
  fail-closed: ok = exit 0, `expect` present, `CAPABILITY_MISSING` absent.
- `capabilities.<name>.strength` — the matrix strength this flag gates, for
  the human reading the file.

Adding a tool-dependent strength = one `capabilities.json` entry plus its
`requires` note in the matrix — no script or router change.

## Vendored code (never hand-edit)

- `scripts/run-external-agent.sh` — from amplify `scripts/`.
- `agents/*-driver.md` — from amplify `agents/`, `<!-- amplify:region -->`
  markers stripped.
- `scripts/probe-external-agents.sh` — from amplify
  `skills/capability-preflight/probe.sh`, verbatim.

Re-vendor from amplify to update; divergences belong in new files (e.g.
`scripts/worktree.sh`, `scripts/detect-external-agents.sh`).

## Open items

- Driver descriptions still carry amplify's audit wording; re-word on the next
  vendoring pass.
- The vendored probe script still probes `cua-driver` (an amplify concern);
  harmless, drop on the next vendoring pass if amplify splits it.
- Marketplace registration in the WeZZard/skills repository.
- Amplify injects the same communication guidelines at SessionStart; once
  attune is installed alongside it, that injection is redundant and should be
  retired from amplify.
