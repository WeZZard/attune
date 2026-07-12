# External Agents Guidelines

<EXTERNAL_AGENTS_GUIDELINES>

## The interface

Two paths delegate work to an external agent:

1. **The router (attune:router)** — the default path. Compose a task brief (contract below) and spawn the router; it selects agents from the selection matrix, verifies CLI parameters against each agent's current `--help`, launches headless runs, and returns outputs and artifact paths verbatim.
2. **The fixed drivers** (attune:codex-driver, attune:kimi-driver, attune:agy-driver, attune:cursor-agent-driver, attune:grok-driver) — one fixed, read-only invocation each over the shared runner (`scripts/run-external-agent.sh`); suited to audit-style text tasks such as the experiment skill's judges.

### Task brief contract (router input)

```text
GOAL: <one line — what the task must accomplish>
OUTPUT: <text | artifact — what comes back>
TAGS: <task traits, e.g. browser, computer-use, image-generation, auditing>
AGENTS: <optional explicit agent list; omit to let the matrix decide>
CAPABILITIES_MARKER: <optional path to a capability marker from an earlier probe; omit to let the router probe what it needs>
---
<the full, self-contained task prompt for the external agent — it sees nothing else>
```

The main conversation composes the brief because it holds the context; the router never invents context it was not given.

## Selection matrix

The matrix is categorized by task, not by agent. Within a category, agents stand in priority order (human ruled): take the first whose availability and required capability flags all hold, and fall down the list otherwise. Category names double as `TAGS` vocabulary. The matrix lists only work worth sending out — a task the session handles natively (e.g. reading images: Claude has vision) stays in-session and gets no category.

- **browser** — 1. Codex (requires `codex.playwright` or `codex.chrome_devtools`); 2. Kimi (requires `kimi.playwright` or `kimi.chrome_devtools`).
- **computer-use** — 1. Codex (requires `codex.computer_use`).
- **image-generation** — 1. Codex; 2. Antigravity (`agy`, Gemini image models).
- **auditing** — 1. Codex; 2. Antigravity; 3. Cursor (`cursor-agent`); 4. Grok.

### Last-verified invocations

The known-good headless baseline per agent; the router re-checks each against the CLI's current `--help` before use.

- `kimi -p "<prompt>" --output-format text`
- `codex exec --skip-git-repo-check -s read-only -c approval_policy=never` (prompt on stdin)
- `agy -p "<prompt>" --sandbox --print-timeout 30m`
- `cursor-agent -p --mode ask --output-format text --trust --model auto "<prompt>"`
- `grok -p "<prompt>" --output-format plain --permission-mode plan`

## Availability: facts before use

Whether an agent works right now is a volatile fact — probe it, never assume it:

1. **Installed** — the binary is on PATH. Detected free of charge at session start by `scripts/detect-external-agents.sh`; the report is injected below these guidelines.
2. **Usable** — binary, login, network, and model all work. Proven behaviorally by `scripts/probe-external-agents.sh <marker.json>` — one minimal paid prompt per agent, run in the background, results written to the marker file. Run it before the first real delegation of a session, and re-run it when an invocation contradicts the marker.
3. **Capable** — a tool-dependent strength (an MCP the agent must be armed with) actually functions. Defined as data in `capabilities.json` and proven by `node scripts/probe-capabilities.mjs <marker.json>` — one meaningful paid prompt per agent×capability that makes the agent exercise the tool and echo tool-derived data back. Results reduce to flags named `<agent>.<capability>` (e.g. `kimi.playwright`, `codex.computer_use`).

Select an agent only when every layer the task needs holds: installed and usable always, plus each capability flag the matched strength names. A failed, missing, or simulated probe fails closed to false; report the failure detail so the human sees what would enable it (e.g. "codex is installed but not logged in — `codex login` enables it").

## Roles

1. **Blind judge** — rank or critique anonymized candidates against a stated criterion (the attune:experiment skill). An external judge adds evidence Claude cannot produce about itself.
2. **Candidate producer** — render the same content in the external model's own voice to widen an experiment's candidate set.
3. **General delegation** — any task the router dispatches from a brief.

## Write isolation (human ruled)

An external agent never writes to a repository directly — it runs as its own process with its own unsynchronized git behavior. When a delegation requires repository writes, create a worktree first:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh" create <repo-dir> <name>
```

Point the external agent at the worktree, collect `worktree.sh diff` as evidence, merge explicitly in the main conversation or discard, then `worktree.sh remove`. Non-repository artifacts (generated images and similar) are different: the prompt requires the agent to reply with each artifact's path, and the path is passed back verbatim.

## Conduct

- The fixed drivers never choose models or permission flags — the runner owns those invocations. The router derives parameters from the matrix baseline verified against fresh `--help` output — never from memory; external CLIs update frequently.
- One invocation per task; parallelize independent tasks across agents.
- External output is evidence, never a decision: synthesis and every ruling stay in the main conversation with the human.

</EXTERNAL_AGENTS_GUIDELINES>
