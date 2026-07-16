# External Agents Guidelines

<EXTERNAL_AGENTS_GUIDELINES>

## The Interface

One path delegates work to an external agent: the router, **{{ROUTER}}**. It selects agents, gates tool-dependent strengths on probed capability flags under their resource locks, verifies CLI parameters against each agent's current `--help`, launches headless runs, and responds as the brief's Response section specifies.

**MUST:**

1. You **MUST** delegate external agent work only through {{ROUTER}}, with a task brief in the contract below.
2. You **MUST** compose the brief in the main conversation — it holds the context — and write the task prompt fully self-contained: the external agent sees nothing else.

**MUST NOT:**

1. You **MUST NOT** invoke an external agent CLI directly from the main conversation.
2. You **MUST NOT** expect the router to invent context the brief does not carry.

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

## Task Categories

Category names double as `TAGS` vocabulary. Within a category, agents stand in priority order (human ruled):

- **browser** — 1. Codex (requires `codex.playwright` or `codex.chrome_devtools`); 2. Kimi (requires `kimi.playwright` or `kimi.chrome_devtools`).
- **computer-use** — 1. Codex (requires `codex.computer_use`).
- **image-generation** — 1. Codex; 2. Antigravity (`agy`, Gemini image models).
- **auditing** — 1. Codex; 2. Antigravity; 3. Kimi; 4. Cursor (`cursor-agent`); 5. Grok.

**MUST:**

1. You **MUST** pick by the task's category and honor its priority order: the first agent whose facts hold wins, falling down the list otherwise.
2. You **MUST** keep a task in-session when the session handles it natively (e.g. reading images: the session has vision) — only work worth sending out gets a category.

**MUST NOT:**

1. You **MUST NOT** delegate a task that maps to no category without the user directing it.

## Facts Before Use

One command answers everything in one call, printing installed / usable / capable per registry agent plus lock instructions for any exclusive resource in play (why: `references/resource-guidelines.md`):

```bash
bash "{{ATTUNE_ROOT}}/scripts/external-agents.sh" matrix <marker.json>
```

**MUST:**

1. You **MUST** treat whether an agent works right now as a volatile fact: probe it, never assume it; a failed probe fails closed.
2. You **MUST** gather the facts in one matrix call and pass the marker path in the brief's `CAPABILITIES_MARKER` so the router never re-probes.

**MUST NOT:**

1. You **MUST NOT** probe layer-by-layer or agent-by-agent — the matrix call is the single probe step.

A free installed-only report may accompany these guidelines at session start; without it, the router's matrix call gathers the same facts at dispatch.

## Write Isolation

**MUST:**

1. You **MUST** create a worktree before a delegation that writes into a repository — `bash "{{ATTUNE_ROOT}}/scripts/worktree.sh" create <repo-dir> <name>` — point the external agent at it, collect `worktree.sh diff` as evidence, merge or discard explicitly in the main conversation, then `worktree.sh remove`.
2. You **MUST** require explicit artifact paths in the reply for non-repository artifacts (generated images and similar) and pass them back verbatim.

**MUST NOT:**

1. You **MUST NOT** let an external agent write to a repository directly — it runs as its own process with its own unsynchronized git behavior.

## Conduct

**MUST:**

1. You **MUST** derive launch parameters from the registry baseline (`capabilities.json`) verified against fresh `--help` output — external CLIs update frequently.
2. You **MUST** send one invocation per task and parallelize independent tasks across agents.
3. You **MUST** treat external output as evidence, never a decision: synthesis and every ruling stay in the main conversation with the human.

**MUST NOT:**

1. You **MUST NOT** invoke an external CLI from remembered flags.

</EXTERNAL_AGENTS_GUIDELINES>
