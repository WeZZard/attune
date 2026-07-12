---
name: interview
description: <EXTREMELY_IMPORTANT>You MUST use interview when discussing solutions, designs, or approaches with the user, and whenever a user preference or output-style judgment surfaces. It routes every open unknown to its oracle — research the world, ask the human, experiment on the unknown — and records what the human rules.</EXTREMELY_IMPORTANT>
---

# Interview — Capture Rulings by Oracle

**Announce at start:** "I'm using the attune interview skill to route unknowns and record rulings."

## Overview

Knowledge has three sources, and each source settles a question in exactly one way:

- **WORLD-owned** — feasibility, prior art, API truth, current fact. The world holds the answer. Settle by research; never ask the user.
- **HUMAN-owned** — preference, taste, budget, tacit constraints, output style. Only the user's head holds the answer. Settle by asking; never assume.
- **NOBODY-owned** — no one knows until it is tried. Settle by experiment (the attune:experiment skill); never ask, never assume.

This skill runs that routing eagerly during any discussion and persists what the human rules. Until its oracle answers, a question stays open, no matter what is already written down.

## Eager research (WORLD-owned)

The moment you classify an unknown as WORLD-owned, launch one background `Explore` subagent per unknown or candidate, in parallel (one message, multiple tool calls), each grounded with `WebSearch`. The conversation continues while they run; fold each brief in when it lands. Keep only compact briefs in this thread, never the raw research.

Validate every brief: check source credibility; check dates and discard stale facts; resolve conflicts by source authority and recency; never conclude without validation.

## The interview (HUMAN-owned)

1. Pick the single most decision-changing open HUMAN-owned unknown.
2. Ask exactly one question via `AskUserQuestion`, carrying your recommended answer and the reason for it — never a bare open prompt, and never a menu for a decision you can reason out yourself.
3. Record the ruling (below) before asking the next question, so the store always reflects what is settled.

Constraints, verified against the Claude Code docs:

- `AskUserQuestion` works only in the main thread. Never delegate the interview to a subagent.
- A session tolerates roughly 4–6 question calls. Ration them: ask only the unknowns that change decisions, and batch up to 4 related forks into one call when they are independent.

## Experiments (NOBODY-owned)

Dispatch the attune:experiment skill. Its outcome returns here as evidence; the user still rules on it, and the ruling records the experiment as provenance.

## Record

A ruling is recorded the moment it settles:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/record-ruling.mjs" '<one JSON object>'
```

The object follows `${CLAUDE_PLUGIN_ROOT}/schemas/ruling.schema.json`:

- `id` — kebab-case, unique; the meaning lives in the name, never in a numeric suffix.
- `date` — the ISO date the ruling settled.
- `ruling` — the enforceable judgment, written so a future session can apply it without this conversation.
- `rationale` — why the user ruled this way; present when the reason was stated.
- `oracle` — provenance marks: `human ruled` on every ruling; `per <source>` when research informed it; `per experiment <name>` when an experiment produced the evidence.
- `scope` — validity: `global`, `medium:<blog|code|commit|chat|…>`, `project:<dir-basename>`.
- `status` — `active`. To change a ruling later, append a new row: a later row with the same `id` replaces the earlier one; a row with `supersedes: <old-id>` retires that id. Never edit or delete existing lines.

A `global` or `medium:*` ruling goes to the user store (the default path). A `project:*` ruling goes to the project store — pass `<project>/.claude/attune/rulings.jsonl` as the second argument.

## What never enters the store

- World facts on their own — they decay, and the web re-derives them. They persist only as `per <source>` marks on a ruling.
- Workflow lessons and measured results — out of attune's domain (human ruled: attune is fully disjoint from every other knowledge system).
- Anything the user has not ruled on.
