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

A ruling settles the task at hand. The guidelines documents are the user's
standing rulings; only the user changes them.

## How it works

- **Guidelines** — `references/communication-guidelines.md` (output style)
  and `references/external-agents-guidelines.md` (external agent usage).
  These documents are the product: version-controlled markdown authored and
  maintained by the user.
- **Session start** — one hook per guidelines document, so each gets its own
  10,000-character platform output cap: the communication guidelines, the
  external agents guidelines plus an availability report
  (`scripts/external-agents.sh installed` — free PATH detection over the
  agent registry), and the verification guidelines (a result is done only
  when it survived its use path — designed, forked, and driven end to end).
- **Usability probing** — `scripts/probe-external-agents.sh` (vendored from
  amplify) proves an agent actually works — binary, login, network, model —
  with one minimal paid prompt per agent, run on demand in the background.
- **Skills** — `attune:interview` (route unknowns by oracle during
  discussions), `attune:experiment` (blind comparison with an external judge
  panel).
- **External agents** — a Haiku router (`attune:external-agent`) dispatches
  task briefs composed by the main conversation. Its single probe step is
  `scripts/external-agents.sh matrix`: one call returns installed / usable /
  capable for every registry agent (probes in parallel, memoized in a
  marker), plus lock instructions for exclusive resources — progressive
  disclosure, with the reasons in `references/resource-guidelines.md` (never
  injected). The router selects by task category, holds the printed locks,
  verifies CLI parameters against each agent's current `--help` against the
  registry baseline in `capabilities.json`, and responds as each brief's
  Response section specifies. It is the single delegation path — one
  communication contract, in the external agents guidelines. An external
  agent that must write to a repository runs in a git worktree
  (`scripts/worktree.sh`); its diff returns as evidence, and merging stays an
  explicit step in the main conversation.

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
agents/                      external-agent (the router — the one delegation path)
capabilities.json            agent registry + capability probe definitions
hooks/                       SessionStart guidelines + availability injection
references/                  the guidelines documents (the product)
scripts/                     external-agents facts command, usability probe, worktree
skills/                      interview, experiment
utils/                       development tooling (the commit gate)
```

## Tests and the commit gate

```bash
node --test scripts/*.test.mjs
git config core.hooksPath .githooks   # enable the pre-commit gate, once per clone
```

The pre-commit gate syntax-checks the hook, runs the tests, and fails any
commit whose guidelines would overflow the platform's hook output cap
(`utils/check-hook-budget.sh`): it runs the real SessionStart hook against
a fixture PATH with every agent installed — the longest availability report —
and requires 300 characters of headroom for machine-dependent path lengths.

## License

MIT — see [LICENSE](LICENSE).
