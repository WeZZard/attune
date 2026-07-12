# External Agents Guidelines

<EXTERNAL_AGENTS_GUIDELINES>

## The interface

One path delegates work to an external agent: the router, **attune:external-agent**. Compose a task brief (the one contract below) and spawn it; the router selects agents, gates tool-dependent strengths on probed capability flags under their resource locks, verifies CLI parameters against each agent's current `--help`, launches headless runs, and responds as the brief's Response section specifies.

### Task brief contract (the one communication contract)

```text
## Metadata

- GOAL: <one line — what the task must accomplish>
- TAGS: <task traits, e.g. browser, computer-use, image-generation, auditing>
- AGENTS: <optional explicit agent list; omit to let the categories decide>
- CAPABILITIES_MARKER: <optional path to an existing fact marker; omit to let the router probe once itself>

## External Agent Task Prompt

<EXTERNAL_AGENT_TASK_PROMPT>
<the full, self-contained task prompt for the external agent — it sees nothing else>
</EXTERNAL_AGENT_TASK_PROMPT>

## Response

<how the router responds to the main conversation — the report shape, including artifact paths when the task produces artifacts>
```

The main conversation composes the brief because it holds the context; the router never invents context it was not given.

## Task categories

Delegate by the task's category; within a category, agents stand in priority order (human ruled): the first whose facts hold wins, and the router falls down the list otherwise. Category names double as `TAGS` vocabulary. Only work worth sending out is listed — a task the session handles natively (e.g. reading images: Claude has vision) stays in-session and gets no category.

- **browser** — 1. Codex (requires `codex.playwright` or `codex.chrome_devtools`); 2. Kimi (requires `kimi.playwright` or `kimi.chrome_devtools`).
- **computer-use** — 1. Codex (requires `codex.computer_use`).
- **image-generation** — 1. Codex; 2. Antigravity (`agy`, Gemini image models).
- **auditing** — 1. Codex; 2. Antigravity; 3. Kimi; 4. Cursor (`cursor-agent`); 5. Grok.

## Facts before use

Whether an agent works right now is a volatile fact — probe it, never assume it; a failed probe fails closed. One command answers everything in one call:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/external-agents.sh" matrix <marker.json>
```

It prints, per registry agent, installed / usable / capable-per-capability, plus lock instructions for any exclusive resource in play (why: `references/resource-guidelines.md`). Probes run in parallel and results are memoized in the marker — pass the marker path in a brief's `CAPABILITIES_MARKER` so the router never re-probes. The free installed-only report is injected below these guidelines at session start.

## Write isolation (human ruled)

An external agent never writes to a repository directly — it runs as its own process with its own unsynchronized git behavior. When a delegation requires repository writes, create a worktree first:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh" create <repo-dir> <name>
```

Point the external agent at the worktree, collect `worktree.sh diff` as evidence, merge explicitly in the main conversation or discard, then `worktree.sh remove`. Non-repository artifacts (generated images and similar) are different: the prompt requires the agent to reply with each artifact's path, and the path is passed back verbatim.

## Conduct

- The router derives launch parameters from the registry baseline (`capabilities.json`) verified against fresh `--help` output — never from memory; external CLIs update frequently.
- One invocation per task; parallelize independent tasks across agents.
- External output is evidence, never a decision: synthesis and every ruling stay in the main conversation with the human.

</EXTERNAL_AGENTS_GUIDELINES>
