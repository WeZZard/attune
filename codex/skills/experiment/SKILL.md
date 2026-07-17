---
name: experiment
description: Settle a question that only trying can answer — an output-style comparison, a prompt phrasing, an error message, any unknown with comparable candidates — by a blind comparison. Produce candidates, strip provenance, collect a blind judge panel's verdicts, then present everything to the user for the ruling. Use when the attune explore skill classifies an unknown as NOBODY-owned, or when the user asks to settle a question by evidence.
---

<!-- GENERATED from skills/experiment/SKILL.md by utils/generate-platform-assets.sh — edit the source, then regenerate. -->

# Experiment — Settle by Evidence

**Announce at start:** "I'm running an attune experiment to settle this by evidence."

## When

A question neither the world nor the user can answer until it is tried: "does the shorter opening actually read better?", "does this voice survive the blog medium?". If the user can answer it directly, it is HUMAN-owned — explore instead. If the web can answer it, it is WORLD-owned — research instead.

## Protocol

1. **Frame.** Name the experiment (kebab-case) and write the single criterion the candidates compete on. A candidate set without a criterion is taste-polling, not an experiment.
2. **Produce.** Render 2–4 candidates of the same content into `${TMPDIR}/attune-experiments/<name>/`, yourself, each committed to a genuinely different approach (structure, register, length — name each approach before writing) so the set spans real alternatives rather than one draft re-worded.
3. **Blind.** Copy the candidates to letter names (`A.md`, `B.md`, …) in shuffled order (use `$RANDOM`), stripping every provenance hint from the content. Write the letter-to-producer mapping to `mapping.txt`; never show it to a judge and never quote it before the ruling.
4. **Judge.** Judge the letter-named candidates yourself against the criterion alone: read them in letter order, one fresh pass per candidate, and write each verdict in the template below before reading on. You produced these candidates, so the panel shares your biases — say so when you present the verdicts.
5. **Rule.** Present the candidates and the anonymized verdicts to the user — each verdict verbatim as the judge returned it; never compile or reshape a judge's report in the main thread. The user rules. Reveal the mapping only after the ruling.
6. **Conclude.** Report the ruling as the experiment's outcome to the task that dispatched it, then delete the experiment directory — its artifacts are evidence, never design artifacts.

**Writing verdicts:**

**MUST:**

1. You **MUST** write each verdict in the template below.
2. You **MUST** rank against the stated criterion alone.
3. You **MUST** justify the ranking in two sentences.

**MUST NOT:**

1. You **MUST NOT** use all-caps section titles or labels in the template.
2. You **MUST NOT** let a verdict mention or guess any candidate's producer.

Required judge response template:

```markdown
## Ranking
<letters, best to worst>

## Justification
<two sentences against the criterion>
```

## Isolation

Producers and judges run read-only. When a future experiment requires an external agent to write into a repository, create a git worktree first (external agents never write to a repo directly):

```bash
bash "<attune plugin root>/scripts/worktree.sh" create <repo-dir> <experiment-name>
```

(Resolve the attune plugin root from this skill file's location; on Claude Code it is `${CLAUDE_PLUGIN_ROOT}`.)

Collect the changes with `worktree.sh diff` as evidence; merging stays an explicit main-thread step, then `worktree.sh remove` cleans up.
