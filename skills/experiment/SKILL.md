---
name: experiment
description: Settle a NOBODY-owned unknown — typically an output-style question no one can answer before trying — by a blind comparison. Produce candidates, strip provenance, collect an external judge panel's verdicts, then present everything to the user for the ruling. Use when the attune:interview skill classifies an unknown as NOBODY-owned, or when the user asks to settle a style question by evidence.
---

# Experiment — Settle by Evidence

**Announce at start:** "I'm running an attune experiment to settle this by evidence."

## When

A question neither the world nor the user can answer until it is tried: "does the shorter opening actually read better?", "does this voice survive the blog medium?". If the user can answer it directly, it is HUMAN-owned — interview instead. If the web can answer it, it is WORLD-owned — research instead.

## Protocol

1. **Frame.** Name the experiment (kebab-case) and write the single criterion the candidates compete on. A candidate set without a criterion is taste-polling, not an experiment.
2. **Produce.** Render 2–4 candidates of the same content into `${TMPDIR}/attune-experiments/<name>/`. Produce at least one yourself. Widen the set with external producers via the driver agents (attune:codex-driver, attune:grok-driver, attune:kimi-driver, attune:agy-driver, attune:cursor-agent-driver) — read-only, prompt in, text out.
3. **Blind.** Copy the candidates to letter names (`A.md`, `B.md`, …) in shuffled order (use `$RANDOM`), stripping every provenance hint from the content. Write the letter-to-producer mapping to `mapping.txt`; never show it to a judge and never quote it before the ruling.
4. **Judge.** Send each judge the letter-named candidates and the criterion. Use 2–3 different driver agents, one invocation each, in parallel. Each judge ranks the candidates against the criterion and justifies its ranking in two sentences.
5. **Rule.** Present the candidates and the anonymized verdicts to the user. The user rules. Reveal the mapping only after the ruling.
6. **Conclude.** Report the ruling as the experiment's outcome to the task that dispatched it, then delete the experiment directory — its artifacts are evidence, never design artifacts. This skill never writes the outcome into this plugin; the plugin does not learn.

## Isolation

Producers and judges run read-only. When a future experiment requires an external agent to write into a repository, create a git worktree first (human ruled: external agents never write to a repo directly):

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh" create <repo-dir> <experiment-name>
```

Collect the changes with `worktree.sh diff` as evidence; merging stays an explicit main-thread step, then `worktree.sh remove` cleans up.
