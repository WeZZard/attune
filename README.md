# Attune

Attune is a Claude Code plugin that injects your standing guidelines into
every session: how to write to you, when to delegate to external agents,
and what counts as verified work.

## Quick Start

```bash
/plugin marketplace add WeZZard/skills
/plugin install attune@wezzard-skills
```

Start a session. The guidelines appear in context, and the availability
report at the end of the external agents section shows which agent CLIs
your machine has installed.

## What's Inside

- **The interview** (`attune:interview`) — routes every open question in a
  discussion to the one oracle that can settle it: world-owned questions
  get researched, human-owned questions get asked with a recommendation
  attached, and questions nobody can answer yet get settled by experiment.
  The core idea: a decision is settled by its oracle, never by assumption.
- **The experiment** (`attune:experiment`) — settles style questions by
  evidence instead of taste-polling: candidates are rendered, blinded, and
  ranked by external models against one stated criterion; you rule on the
  result.
- **The communication style** — guidelines injected at session start that
  govern how replies read: direct engineering prose, one action per
  sentence, no internal workflow language reaching you. Authored by you,
  changed only by you; git history is the review trail.
- **The verification** — exists because models tend to declare work done
  without driving it. The guidelines redefine done as "survived its use
  path": design the path a human would walk, fork it where mechanisms
  differ, drive every fork, and report observations rather than
  expectations. The external agents extend the verification boundary: web
  flows and GUI flows the session cannot drive itself are driven through
  Codex with its browser and computer-use tools.
- **The external agent router** (`attune:external-agent`) — exists because
  external agents (Codex, Kimi, Antigravity, Cursor, Grok) have different
  strengths, volatile availability, and tool-dependent capabilities. One
  router, one brief contract: it gathers installed / usable / capable
  facts in a single probe call, picks by task category in your ruled
  priority order, locks exclusive resources such as the desktop and shared
  browser profiles, verifies each CLI's flags against its current
  `--help`, and returns outputs as evidence, verbatim. Repository writes
  happen only in a git worktree, and merging stays a decision in the main
  conversation.

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

## License

MIT — see [LICENSE](LICENSE).
