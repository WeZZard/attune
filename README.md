# Attune

Attune injects your standing guidelines into every session — how to write
to you and what counts as verified work — and ships the oracle method for
settling unknowns by evidence. One repo ships three plugins: Claude Code,
Codex, and Pi, all fed by the same `references/*.md` source of truth.
Claude Code always carries the full feature set; `porting.json` (the port
matrix) decides what ships to the other platforms. External-agent
delegation lives in the sibling
[dispatch](https://github.com/WeZZard/dispatch) plugin — attune's
experiment and verification widen through it when it is installed, and
degrade gracefully without it.

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
  fork, and report observations. Independent re-checks route through the
  dispatch plugin's audit panel when it is installed.
- **The keystone discipline** (Pi only) opens every plan by
  naming the one decision it stands or falls on — the part a sub-frontier
  model most often gets wrong — with its evidence and strongest rejected
  alternative, for your scrutiny before work proceeds.

## Quick Start

### Claude Code

```text
/plugin marketplace add wezzard/skills
/plugin install attune@wezzard-skills
```

Start a session. Two SessionStart hooks inject the communication and
writing-style guidelines; the skills are `attune:explore`,
`attune:experiment`, and `attune:verification`. Install
`dispatch@wezzard-skills` alongside for the external-agent router, the
audit panel, and image generation.

### Codex

```bash
codex plugin marketplace add WeZZard/skills
codex plugin add attune@wezzard-skills
```

Then one one-time step: hooks need your review before they run. Start
`codex`, and in the "Hooks need review" dialog choose **Trust all and
continue** (or run `/hooks` and press `t`). From the next session on, the
ported hooks inject the communication and writing-style guidelines. The
ported skills are `attune:explore`, `attune:experiment`, and
`attune:verification` (in variants that run without external agents — see
`/skills`); the external-agent router stays Claude-only per
`porting.json`.

### Pi

```bash
pi install https://github.com/WeZZard/attune
```

Start a session. The attune extension appends the ported guidelines
(communication, writing style) to the system prompt at session start. The
ported skills are `explore`, `experiment`, `verification` (in variants
that run without external agents), and `keystone`; the external-agent
router stays Claude-only per `porting.json`.

## License

MIT — see [LICENSE](LICENSE).
