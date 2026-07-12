---
name: interview
description: <EXTREMELY_IMPORTANT>You MUST use interview when discussing solutions, designs, or approaches with the user, and whenever a user preference or output-style judgment surfaces. It routes every open unknown to its oracle — research the world, ask the human, experiment on the unknown — and records what the human rules into the guidelines documents.</EXTREMELY_IMPORTANT>
---

# Interview — Settle Unknowns by Oracle

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
3. Record the ruling (below) before asking the next question, so the documents always reflect what is settled.

Constraints, verified against the Claude Code docs:

- `AskUserQuestion` works only in the main thread. Never delegate the interview to a subagent.
- A session tolerates roughly 4–6 question calls. Ration them: ask only the unknowns that change decisions, and batch up to 4 related forks into one call when they are independent.

## Experiments (NOBODY-owned)

Dispatch the attune:experiment skill. Its outcome returns here as evidence; the user still rules on it, and the ruling records the experiment as provenance.

## Record

A ruling is recorded the moment it settles — before the next question — by editing the guidelines document it belongs to, in place:

- Output style and communication rulings → `references/communication-guidelines.md`.
- External agent usage rulings → `references/external-agents-guidelines.md`.
- A ruling that fits neither starts a new document under `references/`; the SessionStart hook (`hooks/session-start.mjs`) must then also inject it, within the hook output limit noted there.

Write the ruling as an enforceable rule in the document's existing shape (MUST / MUST NOT), placed in the section it belongs to. Human ruling is the default oracle of these documents, so a directly ruled preference needs no mark; carry provenance inline only where it matters: `(per <source>)` for research-informed rules, `(per experiment <name>)` for experiment-settled ones.

The documents are version-controlled — git history is the ledger. Never keep a parallel database of rulings.

## Boundaries

- World facts on their own are never recorded — they decay, and research re-derives them. They survive only as `(per <source>)` marks on a rule they informed.
- Workflow lessons and measured results are out of attune's domain (human ruled: attune is fully disjoint from every other knowledge system).
- Nothing the user has not ruled on enters the guidelines.
