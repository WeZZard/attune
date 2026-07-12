# Attune

Attune is a Claude Code plugin that injects your standing guidelines into
every session: how to write to you, when to delegate to external agents,
and what counts as verified work.

Models start every session knowing nothing about you. Attune carries the
part that never becomes model knowledge: your preferences and your rules.

## What you get

Three documents arrive in context at session start, each through its own
hook:

- **Communication guidelines** — the voice and sentence discipline replies
  must follow.
- **External agents guidelines** — task categories with a ruled priority
  order over Codex, Kimi, Antigravity, Cursor, and Grok; one task-brief
  contract; and a live report of which agent CLIs are installed.
- **Verification guidelines** — a result is done only when it has survived
  its use path. The rules define the path, its forks, and honest reporting.

One subagent does the delegating. `attune:external-agent` is a Haiku
router: it gathers agent facts in one probe call, picks by task category,
locks exclusive resources, checks each CLI's current `--help` before
launching, and reports back in the shape your brief asks for.

## Quick start

```bash
claude --plugin-dir /path/to/attune
```

Start a session. The guidelines appear in context, and the availability
report at the end of the external agents section shows what your machine
has installed.

## How it works

The guidelines are the product. They are markdown files under
`references/`, written and maintained by you. Only you change them, and
git history is the review trail. Each file is injected by its own
SessionStart hook, so each gets the platform's full 10,000-character
output budget. A pre-commit gate fails any commit whose document would
overflow it.

Facts about external agents are probed, never assumed.
`scripts/external-agents.sh matrix` answers installed, usable, and capable
for every agent in one call; probes run in parallel and results memoize in
a marker file. When a capability occupies an exclusive resource, such as
the desktop or a shared browser profile, the matrix output prints the
exact lock commands, and `scripts/resource-lock.sh` serializes access with
leased, token-guarded locks.

External agents never write to a repository directly. A writing delegation
gets a git worktree (`scripts/worktree.sh`); the diff comes back as
evidence, and merging stays a decision in the main conversation.

Three sources of knowledge, three ways to settle a question: research the
world, ask the human, and settle by experiment what neither knows. Two
skills run that loop. `attune:interview` routes open unknowns to their
oracle during discussions; `attune:experiment` settles style questions
with blind comparisons judged by external models.

## Layout

```
.claude-plugin/plugin.json   manifest
agents/                      the external-agent router
capabilities.json            agent registry and capability probe definitions
hooks/                       one SessionStart hook per guidelines document
references/                  the guidelines documents
scripts/                     agent facts, resource locks, worktree isolation
skills/                      interview, experiment
utils/                       the commit gate
```

## Tests and the commit gate

```bash
node --test scripts/*.test.mjs
git config core.hooksPath .githooks   # enable the gate, once per clone
```

The gate syntax-checks the hooks, runs the tests, and fails any commit
whose guidelines would overflow the hook output cap. It runs each real
hook against a fixture PATH with every agent installed and requires 300
characters of headroom for machine-dependent paths.

## License

MIT — see [LICENSE](LICENSE).
