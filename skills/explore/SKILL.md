---
name: explore
description: <EXTREMELY_IMPORTANT>You MUST use explore when discussing solutions, designs, or approaches with the user, and whenever a user preference or output-style judgment surfaces. It routes every open unknown to its oracle — research the world, ask the human, experiment on the unknown — so discussions settle on evidence and rulings instead of assumptions.</EXTREMELY_IMPORTANT>
---

# Explore — Settle Unknowns by Oracle

**Announce at start:** "I'm using the attune explore skill to route unknowns by oracle."

## Overview

Knowledge has three sources, and each source settles a question in exactly one way:

- **WORLD-owned** — feasibility, prior art, API truth, current fact. The world holds the answer. Settle by research; never ask the user.
- **HUMAN-owned** — preference, taste, budget, tacit constraints, output style. Only the user's head holds the answer. Settle by asking; never assume.
- **NOBODY-owned** — no one knows until it is tried. Settle by experiment (the attune:experiment skill); never ask, never assume.

This skill runs that routing eagerly during any discussion. Until its oracle answers, a question stays open, no matter what is already written down.

## Eager research (WORLD-owned)

The moment you classify an unknown as WORLD-owned, launch one background `Explore` subagent per unknown or candidate, in parallel (one message, multiple tool calls), each grounded with `WebSearch`. The conversation continues while they run, but the report back does not: wait for every spawned explorer to complete, then report once, carrying every brief — never a partial report as briefs land. Keep only compact briefs in this thread, never the raw research.

**Designing Spawning Prompts:**

**MUST:**

1. You **MUST** carry the whole response contract in the spawning prompt — the `Agent` tool enforces no schema.
2. You **MUST** state the response requirements as **MUST:** / **MUST NOT:** lists.
3. You **MUST** require the explorer's response to take the template below.
4. You **MUST** require a dated source for every claim.
5. You **MUST** keep every field fail-open — "none" is a valid entry.

**MUST NOT:**

1. You **MUST NOT** let the template bind the research behind the response — it binds only the returned brief.
2. You **MUST NOT** let the template pressure a fabricated source, conflict, or confidence.
3. You **MUST NOT** use all-caps section titles or labels in the template.

Required response template:

```markdown
## Findings
- Claim: <one sentence>
  Evidence: <what supports it>
  Source: <name or URL, date>
(one entry per claim)

## Conflicts
<disagreements between sources, or "none">

## Confidence
<one line: how settled this is, and what would change it>
```

The shape is the explorer's duty alone: relay its brief to the user verbatim, and never compile or reshape subagent output into the template in the main thread.

Validate every brief against its fields: check source credibility; check dates and discard stale facts; resolve conflicts by source authority and recency; never conclude without validation. Validation is a judgment passed on the brief, not a rewrite of it.

## The interview (HUMAN-owned)

1. Pick the single most decision-changing open HUMAN-owned unknown.
2. Ask exactly one question via `AskUserQuestion`, carrying your recommended answer and the reason for it — never a bare open prompt, and never a menu for a decision you can reason out yourself.
3. Before the next question, state the settled ruling explicitly and carry it into the work at hand — the decision it unblocks, the artifact the current task owns (the active plan, the document under discussion, the code). A ruling left implicit is not settled.

Constraints, verified against the Claude Code docs:

- `AskUserQuestion` works only in the main thread. Never delegate the interview to a subagent.
- A session tolerates roughly 4–6 question calls. Ration them: ask only the unknowns that change decisions, and batch up to 4 related forks into one call when they are independent.

## Experiments (NOBODY-owned)

Dispatch the attune:experiment skill. Its outcome returns here as evidence; the user still rules on it, and the ruling carries into the task like any other.

## Boundaries

Never ask the user a WORLD-owned question; never silently assume a HUMAN-owned answer; never guess a NOBODY-owned one.
