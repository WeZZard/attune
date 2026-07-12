# CLAUDE.md

## Domain boundary (human ruled)

Attune holds human-ruled subjective knowledge only: communication and
output-style guidelines, and external agent usage rules. It is fully disjoint
from every other knowledge system (retrospect, project docs, Claude Code auto
memory) — no shared vocabulary, no cross-routing. World facts and measured
lessons are never recorded here; they survive only as inline provenance marks
(`(per <source>)`, `(per experiment <name>)`) on rules they informed.

## The guidelines are the product

`references/*.md` is what the plugin exists to deliver. The documents are
edited in place when a ruling settles (the interview skill's Record step);
git history is the ledger. Never introduce a parallel database, store, or
generated view of the rulings.

`references/communication-guidelines.md` was seeded from amplify's
`references/communication-style-guidelines.md` and diverges from it by design
as rulings accumulate — it is NOT vendored-frozen.

## Injection budget

Hook output is capped at 10,000 characters per event
(code.claude.com/docs/en/hooks). `hooks/session-start.mjs` injects every
reference document plus the availability report and truncates past 9,500
characters with a visible warning. Adding a reference document means checking
the combined size still fits.

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
