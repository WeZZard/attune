# Attune

Attune injects your standing guidelines into every session — how to write
to you, when to delegate to external agents, and what counts as verified
work. One repo ships three plugins: Claude Code, Codex, and Kimi Code,
all fed by the same `references/*.md` source of truth.

- **Explore** routes every open question in a discussion to the one oracle
  that can settle it: research the world, ask the human, and run an
  experiment for what nobody knows yet.
- **The experiment** settles questions that only trying can answer, such as
  "does the shorter opening actually read better?". It produces candidate
  versions, blinds them, has external models rank them against one
  criterion stated up front, and hands you the verdicts. You make the
  ruling.
- **The communication style** governs how replies read: direct engineering
  prose, one action per sentence, no internal workflow language. You author
  it; only you change it.
- **The verification** redefines done as "survived its use path": design
  the path a human would walk, fork it where mechanisms differ, drive every
  fork, and report observations. External agents extend the drivable
  boundary to web and GUI flows through Codex.
- **The external agent router** puts five agents (Codex, Kimi, Antigravity,
  Cursor, Grok) behind one brief contract: facts probed in one call, picks
  by your ruled category priorities, exclusive resources locked, outputs
  returned verbatim as evidence.

## Quick Start

### Claude Code

```text
/plugin marketplace add wezzard/skills
/plugin install attune@wezzard-skills
```

Start a session. Four SessionStart hooks inject the guidelines, and the
availability report shows which agent CLIs your machine has installed. The
router runs as the `attune:external-agent` subagent; the skills are
`attune:explore` and `attune:experiment`.

### Codex

```bash
codex plugin marketplace add WeZZard/skills
codex plugin add attune@wezzard-skills
```

Then one one-time step: hooks need your review before they run. Start
`codex`, and in the "Hooks need review" dialog choose **Trust all and
continue** (or run `/hooks` and press `t`). From the next session on, the
same four hooks inject the guidelines and the availability report. The
router and skills are `attune:external-agent`, `attune:explore`, and
`attune:experiment` (see `/skills`).

### Kimi Code

```text
/plugins install https://github.com/WeZZard/attune
```

Choose **Trust and install**, then `/new` (or `/reload`). The guidelines
load at session start through the plugin's `guidelines` skill — Kimi runs
no context-injecting hooks, so the availability report is skipped; the
router's matrix call gathers the same facts at dispatch. The router and
skills are `/skill:external-agent`, `/skill:explore`, and
`/skill:experiment`.

## License

MIT — see [LICENSE](LICENSE).
