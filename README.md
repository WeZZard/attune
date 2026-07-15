# Attune

Attune is a Claude Code plugin that injects your standing guidelines into
every session: how to write to you, when to delegate to external agents,
and what counts as verified work.

- **Explore** (`attune:explore`) routes every open question in a
  discussion to the one oracle that can settle it: research the world, ask
  the human, and run an experiment for what nobody knows yet.
- **The experiment** (`attune:experiment`) settles questions that only
  trying can answer, such as "does the shorter opening actually read
  better?". It produces candidate versions, blinds them, has external
  models rank them against one criterion stated up front, and hands you
  the verdicts. You make the ruling.
- **The communication style** governs how replies read: direct engineering
  prose, one action per sentence, no internal workflow language. You author
  it; only you change it.
- **The verification** redefines done as "survived its use path": design
  the path a human would walk, fork it where mechanisms differ, drive every
  fork, and report observations. External agents extend the drivable
  boundary to web and GUI flows through Codex.
- **The external agent router** (`attune:external-agent`) puts five agents
  (Codex, Kimi, Antigravity, Cursor, Grok) behind one brief contract: facts
  probed in one call, picks by your ruled category priorities, exclusive
  resources locked, outputs returned verbatim as evidence.

## Quick Start

```bash
/plugin marketplace add wezzard/skills
/plugin install attune@wezzard-skills
```

Start a session. The guidelines appear in context, and the availability
report shows which agent CLIs your machine has installed.

## License

MIT — see [LICENSE](LICENSE).
