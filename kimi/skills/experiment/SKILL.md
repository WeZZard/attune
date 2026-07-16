---
name: experiment
description: Settle a question that only trying can answer — an output-style comparison, a prompt phrasing, an error message, any unknown with comparable candidates — by a blind comparison. Produce candidates, strip provenance, collect an external judge panel's verdicts, then present everything to the user for the ruling. Use when the attune explore skill classifies an unknown as NOBODY-owned, or when the user asks to settle a question by evidence.
---

<!-- GENERATED from skills/experiment/SKILL.md by utils/generate-platform-assets.sh — edit the source, then regenerate. -->

# Experiment — Settle by Evidence

**Announce at start:** "I'm running an attune experiment to settle this by evidence."

## When

A question neither the world nor the user can answer until it is tried: "does the shorter opening actually read better?", "does this voice survive the blog medium?". If the user can answer it directly, it is HUMAN-owned — explore instead. If the web can answer it, it is WORLD-owned — research instead.

## Protocol

1. **Frame.** Name the experiment (kebab-case) and write the single criterion the candidates compete on. A candidate set without a criterion is taste-polling, not an experiment.
2. **Produce.** Render 2–4 candidates of the same content into `${TMPDIR}/attune-experiments/<name>/`. Produce at least one yourself. Widen the set with external producers: one external-agent router brief per producer (`AGENTS: <agent>` pins which model renders; the brief's `## Response` section asks for the rendered text verbatim).
3. **Blind.** Copy the candidates to letter names (`A.md`, `B.md`, …) in shuffled order (use `$RANDOM`), stripping every provenance hint from the content. Write the letter-to-producer mapping to `mapping.txt`; never show it to a judge and never quote it before the ruling.
4. **Judge.** Send each judge the letter-named candidates and the criterion: one external-agent router brief per judge (`TAGS: auditing`, `AGENTS: <agent>` to pin it), 2–3 different agents, in parallel. Design each brief's `## Response` section per **Designing Spawning Prompts** below.
5. **Rule.** Present the candidates and the anonymized verdicts to the user — each verdict verbatim as the judge returned it; never compile or reshape a judge's report in the main thread. The user rules. Reveal the mapping only after the ruling.
6. **Conclude.** Report the ruling as the experiment's outcome to the task that dispatched it, then delete the experiment directory — its artifacts are evidence, never design artifacts.

**Designing Spawning Prompts:**

**MUST:**

1. You **MUST** carry each delegate's response contract in its brief's `## Response` section.
2. You **MUST** state the response requirements as **MUST:** / **MUST NOT:** lists — the same contract style as the explore skill's explorer prompts.
3. You **MUST** require a producer's response to carry the rendered candidate verbatim.
4. You **MUST** require a judge's response to take the template below.
5. You **MUST** require the ranking judged against the stated criterion alone.
6. You **MUST** require a two-sentence justification of the ranking.

**MUST NOT:**

1. You **MUST NOT** use all-caps section titles or labels in the template.
2. You **MUST NOT** let a judge's brief carry any provenance hint.

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
