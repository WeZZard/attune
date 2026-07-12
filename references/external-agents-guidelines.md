# External Agents Guidelines

<EXTERNAL_AGENTS_GUIDELINES>

## The interface

One path delegates work to an external agent: the router, **attune:external-agent**. Compose a task brief (the one contract below) and spawn it; the router selects agents from the selection matrix, gates tool-dependent strengths on capability flags, verifies CLI parameters against each agent's current `--help`, launches headless runs, and returns outputs and artifact paths verbatim.

### Task brief contract (the one communication contract)

```text
## Metadata

- GOAL: <one line — what the task must accomplish>
- TAGS: <task traits, e.g. browser, computer-use, image-generation, auditing>
- AGENTS: <optional explicit agent list; omit to let the matrix decide>
- CAPABILITIES_MARKER: <optional path to an existing capability marker; omit to let the router probe what it needs>

## External Agent Task Prompt

<EXTERNAL_AGENT_TASK_PROMPT>
<the full, self-contained task prompt for the external agent — it sees nothing else>
</EXTERNAL_AGENT_TASK_PROMPT>

## Response

<how the router responds to the main conversation — the report shape, including artifact paths when the task produces artifacts>
```

The main conversation composes the brief because it holds the context; the router never invents context it was not given.

## Selection matrix

The matrix is categorized by task, not by agent. Within a category, agents stand in priority order (human ruled): take the first whose availability and required capability flags all hold, and fall down the list otherwise. Category names double as `TAGS` vocabulary. The matrix lists only work worth sending out — a task the session handles natively (e.g. reading images: Claude has vision) stays in-session and gets no category.

- **browser** — 1. Codex (requires `codex.playwright` or `codex.chrome_devtools`); 2. Kimi (requires `kimi.playwright` or `kimi.chrome_devtools`).
- **computer-use** — 1. Codex (requires `codex.computer_use`).
- **image-generation** — 1. Codex; 2. Antigravity (`agy`, Gemini image models).
- **auditing** — 1. Codex; 2. Antigravity; 3. Kimi; 4. Cursor (`cursor-agent`); 5. Grok.

### Last-verified invocations

The known-good headless baseline per agent; the router re-checks each against the CLI's current `--help` before use.

- `kimi -p "<prompt>" --output-format text`
- `codex exec --skip-git-repo-check -s read-only -c approval_policy=never` (prompt on stdin)
- `agy -p "<prompt>" --sandbox --print-timeout 30m`
- `cursor-agent -p --mode ask --output-format text --trust --model auto "<prompt>"`
- `grok -p "<prompt>" --output-format plain --permission-mode plan`

## Availability: facts before use

Whether an agent works right now is a volatile fact — probe it, never assume it:

One public command owns all three fact layers, one subcommand each: `scripts/external-agents.sh installed|usable|capable`.

1. **Installed** — the binary is on PATH. `external-agents.sh installed [--lines]`: free, side-effect-free, run at every session start over the agent registry in `capabilities.json`; the report is injected below these guidelines.
2. **Usable** — binary, login, network, and model all work. `external-agents.sh usable <marker.json>`: one minimal paid prompt per agent, run in the background, results written to the marker file. Run it before the first real delegation of a session, and re-run it when an invocation contradicts the marker.
3. **Capable** — a tool-dependent strength (an MCP the agent must be armed with) actually functions. `external-agents.sh capable <marker.json> [--only agent.capability ...]`: one meaningful paid prompt per agent×capability that makes the agent exercise the tool and echo tool-derived data back. Results reduce to flags named `<agent>.<capability>` (e.g. `kimi.playwright`, `codex.computer_use`).

Select an agent only when every layer the task needs holds: installed and usable always, plus each capability flag the matched strength names. A failed, missing, or simulated probe fails closed to false; report the failure detail so the human sees what would enable it (e.g. "codex is installed but not logged in — `codex login` enables it").

## Roles

Every role is one brief to attune:external-agent:

1. **Blind judge** — rank or critique anonymized candidates against a stated criterion (`TAGS: auditing`; the attune:experiment skill sends one brief per judge). An external judge adds evidence Claude cannot produce about itself.
2. **Candidate producer** — render the same content in the external model's own voice to widen an experiment's candidate set (`AGENTS: <agent>` pins the producer).
3. **General delegation** — any other task dispatched from a brief.

## Resource exclusivity

Some capabilities occupy an exclusive machine resource — concurrent use fails or cross-talks (verified 2026-07):

- **computer use** — cua itself is concurrency-safe by design: its No-Foreground Contract keeps the real cursor and frontmost app untouched, and per-agent app instances avoid same-app contention (per amplify `agents/computer-use-cua.md`, verified against cua.ai/docs). Attune serializes anyway because it cannot verify an external agent honors that discipline or avoids the app the human is using — a policy choice, not a technical necessity (human ruled). Resource: `desktop`.
- **Chrome DevTools MCP** — default-config instances share one persistent Chrome profile (`~/.cache/chrome-devtools-mcp/`); a second concurrent launch fails with "The browser is already running… Use --isolated" (per github.com/ChromeDevTools/chrome-devtools-mcp issues #224, #292). Resource: `chrome-devtools-profile`.
- **Playwright MCP** — default-config instances use a persistent profile guarded by the browser's own singleton lock; a concurrent second instance fails with "Browser is already in use… use --isolated" (per the microsoft/playwright-mcp README and issues #769, #891). Resource: `playwright-profile`.

Instances configured with `--isolated` (or a distinct `--user-data-dir`) are parallel-safe — when every external agent's MCP config is isolated, remove that capability's `resource` field from `capabilities.json` and the lock disappears with it.

The lock: `scripts/resource-lock.sh acquire <resource> [--wait sec] [--ttl sec]` prints a release token; `release <resource> <token>` frees it; leases (default 900 s) reclaim locks abandoned by interrupted runs. The router acquires the resource of every capability its pick relies on before probing or launching, and releases in its report step.

## Write isolation (human ruled)

An external agent never writes to a repository directly — it runs as its own process with its own unsynchronized git behavior. When a delegation requires repository writes, create a worktree first:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh" create <repo-dir> <name>
```

Point the external agent at the worktree, collect `worktree.sh diff` as evidence, merge explicitly in the main conversation or discard, then `worktree.sh remove`. Non-repository artifacts (generated images and similar) are different: the prompt requires the agent to reply with each artifact's path, and the path is passed back verbatim.

## Conduct

- The router derives parameters from the matrix baseline verified against fresh `--help` output — never from memory; external CLIs update frequently.
- One invocation per task; parallelize independent tasks across agents.
- External output is evidence, never a decision: synthesis and every ruling stay in the main conversation with the human.

</EXTERNAL_AGENTS_GUIDELINES>
