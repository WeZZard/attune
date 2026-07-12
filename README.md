# Attune

Give every session the knowledge a model cannot internalize: the user's
communication guidelines, output-style rulings, and external agent usage
rules. A Claude Code plugin.

## The epistemology

Every open question in a discussion has exactly one oracle:

- **World knowledge comes from the world.** Research it — background `Explore`
  agents with web search, launched eagerly the moment the unknown is
  classified. Never ask the user what the world can answer.
- **Subjective judgments come from the human.** Ask — one decision-changing
  question at a time, each carrying a recommended answer.
- **Knowledge nobody owns yet** is settled by experiment: blind candidates
  judged by an external panel, ruled on by the human.

What the human rules is written into the guidelines documents; research and
experiments survive only as provenance marks on the rules they informed.

## How it works

- **Guidelines** — `references/communication-guidelines.md` (output style)
  and `references/external-agents-guidelines.md` (external agent usage).
  These documents are the product: version-controlled markdown, edited in
  place when a ruling settles. Git history is the ledger.
- **Session start** — a hook injects both documents plus an availability
  report from `scripts/detect-external-agents.sh` (free `command -v`
  detection of codex, kimi, agy, cursor-agent, grok). Output stays under the
  platform's 10,000-character hook limit.
- **Usability probing** — `scripts/probe-external-agents.sh` (vendored from
  amplify) proves an agent actually works — binary, login, network, model —
  with one minimal paid prompt per agent, run on demand in the background.
- **Skills** — `attune:interview` (route unknowns by oracle, record rulings
  into the guidelines), `attune:experiment` (blind comparison with an
  external judge panel).
- **External agents** — driver subagents for Codex, Grok, Kimi, Agy, and
  Cursor Agent over the shared runner (`scripts/run-external-agent.sh`),
  serving as blind judges, candidate producers, and a general delegation
  surface. An external agent that must write to a repository runs in a git
  worktree (`scripts/worktree.sh`); its diff returns as evidence, and merging
  stays an explicit step in the main conversation.

## Install

```bash
/plugin marketplace add WeZZard/skills
/plugin install attune@wezzard-skills
```

(Marketplace entry pending; during development, install from this repository
path.)

## Layout

```
.claude-plugin/plugin.json   manifest
agents/                      external-agent drivers (vendored from amplify)
hooks/                       SessionStart guidelines + availability injection
references/                  the guidelines documents (the product)
scripts/                     detection, usability probe, runner, worktree
skills/                      interview, experiment
```

## Tests

```bash
node --test scripts/*.test.mjs
```

## License

MIT — see [LICENSE](LICENSE).
