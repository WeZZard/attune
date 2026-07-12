# External Agents Guidelines

<EXTERNAL_AGENTS_GUIDELINES>

## The interface

Five driver subagents delegate one task each to an external agent CLI through the shared runner (`scripts/run-external-agent.sh`): attune:codex-driver, attune:kimi-driver, attune:agy-driver, attune:cursor-agent-driver, and attune:grok-driver. A driver takes a prompt in the shape below, runs exactly one headless, read-only invocation, and returns the output verbatim:

```text
ROLE: audit
---
<the task prompt>
```

## Availability: facts before use

Whether an agent works right now is a volatile fact — probe it, never assume it:

1. **Installed** — the binary is on PATH. Detected free of charge at session start by `scripts/detect-external-agents.sh`; the report is injected below these guidelines.
2. **Usable** — binary, login, network, and model all work. Proven behaviorally by `scripts/probe-external-agents.sh <marker.json>` — one minimal paid prompt per agent, run in the background, results written to the marker file. Run it before the first real delegation of a session, and re-run it when an invocation contradicts the marker.

Select an agent only when installed and usable both hold. A failed or unknown probe fails closed to unavailable; report the failure detail so the human sees what would enable it (e.g. "codex is installed but not logged in — `codex login` enables it").

## Roles

1. **Blind judge** — rank or critique anonymized candidates against a stated criterion (the attune:experiment skill). An external judge adds evidence Claude cannot produce about itself.
2. **Candidate producer** — render the same content in the external model's own voice to widen an experiment's candidate set. Read-only: prompt in, text out.
3. **General delegation** — any read-only task another workflow hands over.

## Write isolation (human ruled)

An external agent never writes to a repository directly — it runs as its own process with its own unsynchronized git behavior. When a delegation requires writes, create a worktree first:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh" create <repo-dir> <name>
```

Point the external agent at the worktree, collect `worktree.sh diff` as evidence, merge explicitly in the main conversation or discard, then `worktree.sh remove`.

## Conduct

- Never let a driver choose models or permission flags — the runner owns the whole invocation.
- One driver invocation per task; parallelize independent tasks across drivers.
- External output is evidence, never a decision: synthesis and every ruling stay in the main conversation with the human.

</EXTERNAL_AGENTS_GUIDELINES>
