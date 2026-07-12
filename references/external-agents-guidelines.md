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
TAGS: <task traits, e.g. visual, browser, computer-use, image-generation, documentation, open-source-stack>
AGENTS: <optional explicit agent list; omit to let the matrix decide>
---
<the full, self-contained task prompt for the external agent — it sees nothing else>
```

The main conversation composes the brief because it holds the context; the router never invents context it was not given.

## Selection matrix

Pick by the task's dominant demand; availability still gates every pick. `Last verified` is the known-good headless baseline the router re-checks against the CLI's current `--help` before use.

- **Kimi** (`kimi`) — visual tasks; browser use.
  Last verified: `kimi -p "<prompt>" --output-format text`
- **Codex** (`codex`, GPT) — computer use; visual tasks; image generation.
  Last verified: `codex exec --skip-git-repo-check -s read-only -c approval_policy=never` (prompt on stdin)
- **Antigravity** (`agy`, Gemini including its image models) — image generation; documentation.
  Last verified: `agy -p "<prompt>" --sandbox --print-timeout 30m`
- **Cursor** (`cursor-agent`) — building on open-source tech stacks.
  Last verified: `cursor-agent -p --mode ask --output-format text --trust --model auto "<prompt>"`
- **Grok** (`grok`) — building on open-source tech stacks.
  Last verified: `grok -p "<prompt>" --output-format plain --permission-mode plan`

## Availability: facts before use

Whether an agent works right now is a volatile fact — probe it, never assume it:

1. **Installed** — the binary is on PATH. Detected free of charge at session start by `scripts/detect-external-agents.sh`; the report is injected below these guidelines.
2. **Usable** — binary, login, network, and model all work. Proven behaviorally by `scripts/probe-external-agents.sh <marker.json>` — one minimal paid prompt per agent, run in the background, results written to the marker file. Run it before the first real delegation of a session, and re-run it when an invocation contradicts the marker.

Select an agent only when installed and usable both hold. A failed or unknown probe fails closed to unavailable; report the failure detail so the human sees what would enable it (e.g. "codex is installed but not logged in — `codex login` enables it").

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
