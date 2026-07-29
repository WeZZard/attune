# Attune

Attune captures your standing operational rulings — what counts as
verified work, how the agent executes and delegates — and ships the
oracle method for settling unknowns by evidence. One repo ships three
plugins: Claude Code, Codex, and Pi, all fed by the same `references/*.md`
and `skills/*` source of truth. Claude Code always carries the full
feature set; `porting.json` (the port matrix) decides what ships to the
other platforms. External-agent delegation lives in the sibling
[dispatch](https://github.com/WeZZard/dispatch) plugin — attune's
experiment and definition-of-done widen through it when it is installed, and
degrade gracefully without it. The standing communication guidelines that
attune carried through 0.12.0 moved to the sibling
[additive](https://github.com/WeZZard/additive) plugin.

- **Explore** routes every open question in a discussion to the instrument
  that settles it: derive what reasoning alone can settle, research the
  world, run an experiment when no answer exists yet, and ask the human
  for the rulings only their judgment can make.
- **The experiment** settles questions that only trying can answer, such as
  "does the shorter opening actually read better?". It produces candidate
  versions, blinds them, has external models rank them against one
  criterion stated up front, and hands you the verdicts. You make the
  ruling.
- **The definition of done** redefines done as "survived its use path":
  size the change by blast radius, design the path its real consumer would
  walk, fork it where mechanisms differ, drive every fork, and report
  observations — verified apart from unverified. It carries a growing store
  of per-domain use-path playbooks (macOS GUI, web app, macOS CLI …), each
  naming how to drive that domain in-session and the honest limit of what
  cannot be. Independent re-checks route through the dispatch plugin's audit
  panel when it is installed.
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

Start a session. One SessionStart hook injects the execution guidelines;
the skills are `attune:explore`, `attune:experiment`, and
`attune:definition-of-done`. Install `dispatch@wezzard-skills` alongside
for the external-agent router, the audit panel, and image generation.

### Codex

```bash
codex plugin marketplace add WeZZard/skills
codex plugin add attune@wezzard-skills
```

The ported skills are `attune:explore`, `attune:experiment`, and
`attune:definition-of-done` (in variants that run without external agents —
see `/skills`); the external-agent router stays Claude-only per
`porting.json`. Attune ships no Codex hooks — the execution guidelines are
Claude-only.

### Pi

```bash
pi install https://github.com/WeZZard/attune
```

The ported skills are `explore`, `experiment`, `definition-of-done` (in
variants that run without external agents), and `keystone`; the
external-agent router stays Claude-only per `porting.json`. Attune ships
no Pi extension.

## License

MIT — see [LICENSE](LICENSE).
