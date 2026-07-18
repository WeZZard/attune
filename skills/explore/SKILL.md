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
- **NOBODY-owned** — no one knows until it is tried. Settle by experiment (the attune experiment skill); never ask, never assume.

This skill runs that routing eagerly during any discussion. Until its oracle answers, a question stays open, no matter what is already written down.

## Eager research (WORLD-owned)

The moment you classify an unknown as WORLD-owned, settle it by grounded web research, one researcher per unknown or candidate. Every researcher writes its full brief to `${TMPDIR}/attune-explore/<topic>/<unknown>.md` — the brief files are the evidence trail the user can check; the thread carries only the compiled digest.

<!-- @port claude -->
Launch the researchers as background subagents, in parallel (one message, multiple tool calls). The conversation continues while they run, but the digest does not: wait for every spawned explorer to complete — never a partial digest as briefs land.
<!-- @end -->
<!-- @port codex pi
Without background research subagents, run the web searches yourself, one unknown at a time, before the discussion continues — and write each unknown's brief to its file before moving on.

**Writing briefs:**

**MUST:**

1. You **MUST** write each unknown's brief file in the template below.
2. You **MUST** give a dated source for every claim.
3. You **MUST** keep every field fail-open — "none" is a valid entry.

**MUST NOT:**

1. You **MUST NOT** let the template pressure a fabricated source, conflict, or confidence.
2. You **MUST NOT** use all-caps section titles or labels in the template.
-->

<!-- @port claude -->
**Spawning explorers:**

**MUST:**

1. You **MUST** spawn every explorer with `model: "sonnet"` — never the session model.
2. You **MUST** spawn `general-purpose` explorers, restricted by prompt to research plus one brief-file write — the built-in `Explore` type cannot write files.
3. You **MUST** ground every explorer with web search.
4. You **MUST** carry the whole response contract in the spawning prompt — the subagent interface enforces no schema.
5. You **MUST** state the response requirements as **MUST:** / **MUST NOT:** lists.
6. You **MUST** require the brief file to take the template below.
7. You **MUST** require a dated source for every claim.
8. You **MUST** keep every field fail-open — "none" is a valid entry.
9. You **MUST** require the explorer's reply to carry only the brief's file path and an abstract of at most three sentences.

**MUST NOT:**

1. You **MUST NOT** let the template bind the research behind the brief — it binds only the written brief.
2. You **MUST NOT** let the template pressure a fabricated source, conflict, or confidence.
3. You **MUST NOT** use all-caps section titles or labels in the template.
4. You **MUST NOT** let a full brief travel back through an explorer's reply — it lives in the file.
<!-- @end -->
Required brief template:

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

**Compiling the digest:** read every brief file and validate it — check source credibility, check dates and discard stale facts, resolve conflicts by source authority and recency; never conclude without validation, and never rewrite a brief file while validating it. Then report one digest: for each unknown, the settled answer in one or two sentences, the confidence, any conflict worth surfacing, and the brief's file path so the user can check the facts.

## The interview (HUMAN-owned)

1. Pick the single most decision-changing open HUMAN-owned unknown.
2. Ask exactly one question via your platform's structured question tool (`AskUserQuestion` on Claude Code), or directly in conversation when none exists, carrying your recommended answer and the reason for it — never a bare open prompt, and never a menu for a decision you can reason out yourself.
3. Before the next question, state the settled ruling explicitly and carry it into the work at hand — the decision it unblocks, the artifact the current task owns (the active plan, the document under discussion, the code). A ruling left implicit is not settled.

Constraints:

- The interview belongs to the main thread. Never delegate it to a subagent.
- A session tolerates roughly 4–6 question calls. Ration them: ask only the unknowns that change decisions, and batch up to 4 related forks into one call when they are independent.

## Experiments (NOBODY-owned)

Dispatch the attune experiment skill. Its outcome returns here as evidence; the user still rules on it, and the ruling carries into the task like any other.

## Boundaries

Never ask the user a WORLD-owned question; never silently assume a HUMAN-owned answer; never guess a NOBODY-owned one.
