---
name: experiment
description: Settle a question that only trying can answer — an output-style comparison, a prompt phrasing, an error message, any unknown with comparable candidates — by a blind comparison. Produce candidates, strip provenance, collect blind verdicts against one stated criterion, then present everything to the user for the ruling. Use when the attune explore skill classifies an unknown as NOBODY-owned, or when the user asks to settle a question by evidence.
---

<!-- GENERATED from skills/experiment/SKILL.md by utils/generate-platform-assets.sh — edit the source, then regenerate. -->

# Experiment — Settle by Evidence

**Announce at start:** "I'm running an attune experiment to settle this by evidence."

## When

A question neither the world nor the user can answer until it is tried: "does the shorter opening actually read better?", "does this voice survive the blog medium?". If the user can answer it directly, it is HUMAN-owned — explore instead. If the web can answer it, it is WORLD-owned — research instead.

## External widening

When the dispatch plugin is installed, its `use-external-agents` skill reaches external models as producers and judges — invoke that skill before composing any brief; it defines the router and the task brief contract. Without it, you produce and judge yourself, and the protocol below says how at each step.

## Protocol

1. **Frame.** Name the experiment (kebab-case) and write the single criterion the candidates compete on. A candidate set without a criterion is taste-polling, not an experiment.
2. **Produce.** Render 2–4 candidates of the same content into `${TMPDIR:-/tmp}/attune-experiments/<name>/`, each committed to a genuinely different approach (structure, register, length — name each approach before writing). With dispatch installed, widen the set with external producers — one router brief per producer (`AGENTS: <agent>` pins which model renders; the brief's `## Response` section asks for the rendered text verbatim) — and always produce at least one candidate yourself.
3. **Blind.** Copy the candidates to letter names (`A.md`, `B.md`, …) in shuffled order (use `$RANDOM`), stripping every provenance hint from the content. Write the letter-to-producer mapping to `mapping.txt`; never show it to a judge and never quote it before the ruling.
4. **Judge.** With dispatch installed, send each judge the letter-named candidates and the criterion — one router brief per judge (`TAGS: auditing`, `AGENTS: <agent>` to pin it), 2–3 different agents in parallel, each brief's `## Response` section carrying the verdict contract below as **MUST:** / **MUST NOT:** lists — and save each returned verdict verbatim to `verdicts/<judge>.md` in the experiment directory. Without dispatch, judge the letter-named candidates yourself against the criterion alone: read them in letter order, one fresh pass per candidate, and write each verdict to `verdicts/` in the template below before reading on — you produced these candidates, so the verdicts share your biases; say so when you present them.
5. **Rule.** Present a compiled comparison to the user: each candidate's path, the rankings across judges, and each verdict's file path so the user can check the reasoning — never quote a verdict partially in a way that reshapes it. The user rules. Reveal the mapping only after the ruling.
6. **Conclude.** Report the ruling as the experiment's outcome to the task that dispatched it. Leave the experiment directory in place — candidates, mapping, and verdicts are the experiment's backtrace; never reuse them as design artifacts.

## The verdict contract

**MUST:**

1. You **MUST** write every verdict — external or your own — in the template below.
2. You **MUST** rank against the stated criterion alone.
3. You **MUST** justify the ranking in two sentences.

**MUST NOT:**

1. You **MUST NOT** use all-caps section titles or labels in the template.
2. You **MUST NOT** let a brief or a verdict carry any provenance hint.

Required verdict template:

```markdown
## Ranking
<letters, best to worst>

## Justification
<two sentences against the criterion>
```

## Isolation

Producers and judges run read-only. When a future experiment requires writing into a repository, work in a detached git worktree, never the repository itself: `git -C <repo-dir> worktree add --detach <worktree-path>` creates it, the diff collected there is the evidence, merging stays an explicit main-thread step, and `git -C <repo-dir> worktree remove <worktree-path>` cleans up. With dispatch installed, its `use-external-agents` skill carries the worktree tooling and the write-isolation rules for external agents.
