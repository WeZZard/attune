# CLAUDE.md

## Domain boundary (human ruled)

Attune holds human-ruled subjective knowledge only: communication and
output-style guidelines, and external agent usage rules. It is fully disjoint
from every other knowledge system (retrospect, project docs, Claude Code auto
memory) — no shared vocabulary, no cross-routing. World facts and measured
lessons are never recorded here.

## No skill learns (human ruled)

Every skill in this plugin is a fixed program. No skill writes to the plugin —
not the guidelines documents, not new reference documents, not any store,
ledger, or generated view. Skill outcomes (settled rulings, experiment
verdicts) belong to the task that dispatched them, never to the plugin. Never
add a Record step or any other self-modification to a skill.

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

Hook output is capped at 10,000 characters per event
(code.claude.com/docs/en/hooks). `hooks/session-start.mjs` injects every
reference document plus the availability report and truncates past 9,500
characters (`CONTEXT_LIMIT`, the single source of truth) with a visible
warning. The pre-commit gate (`scripts/check-hook-budget.mjs`, wired through
`.githooks/pre-commit`; enable per clone with
`git config core.hooksPath .githooks`) fails any commit that would truncate:
it runs the real hook against a fixture PATH with every agent installed and
requires 300 characters of headroom for machine-dependent path lengths.

## Vendored code (never hand-edit)

- `scripts/run-external-agent.sh` — from amplify `scripts/`.
- `agents/*-driver.md` — from amplify `agents/`, `<!-- amplify:region -->`
  markers stripped.
- `scripts/probe-external-agents.sh` — from amplify
  `skills/capability-preflight/probe.sh`, verbatim.

Re-vendor from amplify to update; divergences belong in new files (e.g.
`scripts/worktree.sh`, `scripts/detect-external-agents.sh`).

## Open items

- Per-tool write-mode invocations for the external drivers. Worktree
  isolation exists (`scripts/worktree.sh`), but the runner's invocations stay
  read-only until each tool's write flags are verified against its own docs —
  never guess CLI flags.
- Driver descriptions still carry amplify's audit wording; re-word on the next
  vendoring pass.
- The vendored probe script still probes `cua-driver` (an amplify concern);
  harmless, drop on the next vendoring pass if amplify splits it.
- Marketplace registration in the WeZZard/skills repository.
- Amplify injects the same communication guidelines at SessionStart; once
  attune is installed alongside it, that injection is redundant and should be
  retired from amplify.
