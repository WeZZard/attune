# Attune

Capture and apply the knowledge a model cannot internalize: the user's
preferences and output-style rulings. A Claude Code plugin.

## The epistemology

Every open question in a discussion has exactly one oracle:

- **World knowledge comes from the world.** Research it — background `Explore`
  agents with web search, launched eagerly the moment the unknown is
  classified. Never ask the user what the world can answer.
- **Subjective judgments come from the human.** Ask — one decision-changing
  question at a time, each carrying a recommended answer.
- **Knowledge nobody owns yet** is settled by experiment: blind candidates
  judged by an external panel, ruled on by the human.

Only human-ruled judgments persist. Research and experiments persist only as
provenance marks on a ruling.

## Install

```bash
/plugin marketplace add WeZZard/skills
/plugin install attune@wezzard-skills
```

(Marketplace entry pending; during development, install from this repository
path.)

## How it works

- **Store** — `~/.claude/attune/store/rulings.jsonl`, seeded on first session
  from `seeds/rulings.jsonl` (migrated from amplify's communication style
  guidelines), plus an optional per-project store at
  `<project>/.claude/attune/rulings.jsonl`. Append-only JSONL, one ruling per
  line (`schemas/ruling.schema.json`): a later row with the same `id` replaces
  the earlier one; a row with `supersedes` retires the referenced id.
- **Sheet** — at SessionStart, a hook distills the active in-scope rulings
  into a preference sheet and injects it. The sheet budgets 8,000 characters
  under the platform's 10,000-character hook output limit; when it truncates,
  run the attune:consolidate skill.
- **Skills** — `attune:interview` (route unknowns by oracle, capture rulings),
  `attune:experiment` (blind comparison with an external judge panel),
  `attune:consolidate` (keep the sheet under budget).
- **External agents** — driver agents for Codex, Grok, Kimi, Agy, and
  Cursor Agent, vendored from amplify over the shared runner
  (`scripts/run-external-agent.sh`). They serve as blind judges, candidate
  producers, and a general delegation surface. An external agent that must
  write to a repository runs in a git worktree (`scripts/worktree.sh`); its
  diff returns as evidence, and merging stays an explicit step in the main
  conversation.

## Layout

```
.claude-plugin/plugin.json   manifest
agents/                      external-agent drivers (vendored from amplify)
hooks/                       SessionStart sheet injection
schemas/ruling.schema.json   one store row
scripts/                     sheet generator, ruling recorder, runner, worktree
seeds/rulings.jsonl          initial store content
skills/                      interview, experiment, consolidate
```

## Tests

```bash
node --test scripts/*.test.mjs
```

## License

MIT — see [LICENSE](LICENSE).
