# CLAUDE.md

## Domain boundary (human ruled)

Attune stores human-ruled subjective knowledge only: preferences and
output-style rulings. It is fully disjoint from every other knowledge system
(retrospect, project docs, Claude Code auto memory) — no shared vocabulary, no
cross-routing. World facts and measured lessons never persist here; they
appear only as provenance marks (`per <source>`, `per experiment <name>`) on a
ruling.

## Store semantics

Append-only JSONL, event-sourced: never edit or delete an existing line. A
later row with the same `id` replaces the earlier row; a row whose
`supersedes` names an id retires that id. `scripts/generate-sheet.mjs` owns
this resolution — change the semantics there and in
`schemas/ruling.schema.json` together, and keep the skills' descriptions of it
in sync.

## Vendored code

`scripts/run-external-agent.sh` and `agents/*-driver.md` are vendored verbatim
from amplify (only the `<!-- amplify:region -->` markers are stripped). Never
hand-edit them; re-vendor from amplify and reapply the marker strip.
Divergences belong in new files (e.g. `scripts/worktree.sh`).

## Budget

Hook output is capped at 10,000 characters per event
(code.claude.com/docs/en/hooks); the sheet generator budgets 8,000
(`SHEET_BUDGET`). Any change to injection must respect this, and the
consolidate skill exists to keep the store distillable under it.

## Open items

- Per-tool write-mode invocations for the external drivers. Worktree
  isolation exists (`scripts/worktree.sh`), but the runner's invocations stay
  read-only until each tool's write flags are verified against its own docs —
  never guess CLI flags.
- Driver descriptions still carry amplify's audit wording; re-word on the next
  vendoring pass.
- Marketplace registration in the WeZZard/skills repository.
- Amplify still injects its static communication style guidelines at
  SessionStart; once attune is installed alongside it, that injection is
  redundant with the seed rulings and should be retired from amplify.
