# Attune

Attune carries the standing communication guidelines — George Orwell's
rules from "Politics and the English Language" (1946) — and injects them at
session start, so they govern every reply in conversation and every prose
artifact the agent writes. Beside them it carries the execution rulings and
two skills for settling unknowns by evidence. One repo ships three plugins:
Claude Code, Codex, and Pi, all fed by the same `references/*.md` and
`skills/*` source of truth. Claude Code always carries the full feature
set; `porting.json` (the port matrix) decides what ships to the other
platforms. External-agent delegation lives in the sibling
[dispatch](https://github.com/WeZZard/dispatch) plugin — attune's
experiment widens through it when it is installed, and degrades gracefully
without it.

- **The communication guidelines** are the whole rule set, and nothing
  else here rules prose: cut a word wherever a word can be cut; never use
  a metaphor you are used to seeing in print; never a long word where a
  short one will do; never the passive where the active will serve; never
  a foreign or jargon word when an everyday English one exists — and break
  any of these sooner than say anything outright barbarous. A second
  document carries the whole-passage specimens, prose gone dead at length.
- **The plain-language reminder** is one paragraph, and it arrives with
  every prompt rather than once at session start: plain words, an area's
  own standard verbs and terms, and no jargon invented on the fly. It is
  the rule that decays first in a long conversation, so it is the one
  worth repeating. Claude Code only — on a small context window the
  repetition costs more than it buys.
- **The execution guidelines** rule how work is delegated: which model a
  spawned subagent gets, and why caution alone is never a reason to
  escalate one.
- **Explore** routes every open question in a discussion to the instrument
  that settles it: derive what reasoning alone can settle, research the
  world, run an experiment when no answer exists yet, and ask the human
  for the rulings only their judgment can make.
- **The experiment** settles questions that only trying can answer, such as
  "does the shorter opening actually read better?". It produces candidate
  versions, blinds them, has external models rank them against one
  criterion stated up front, and hands you the verdicts. You make the
  ruling.

The guidelines arrive on their own; the skills never do. Both skills are
user-invoked only and are hidden from the model's own skill list, so
`explore` and `experiment` run when you ask for them and at no other time.

## Quick Start

### Claude Code

```text
/plugin marketplace add wezzard/skills
/plugin install attune@wezzard-skills
```

Start a session. Three SessionStart hooks inject the communication
guidelines, their specimens, and the execution guidelines; a
UserPromptSubmit hook adds the plain-language reminder to every prompt.
Run the skills with `/attune:explore` and `/attune:experiment`. Install
`dispatch@wezzard-skills` alongside for the external-agent router, the
audit panel, and image generation.

### Codex

```bash
codex plugin marketplace add WeZZard/skills
codex plugin add attune@wezzard-skills
```

Two SessionStart hooks inject the communication guidelines and their
specimens; the execution guidelines and the plain-language reminder stay
Claude-only per `porting.json`.
The skills are `attune:explore` and `attune:experiment`, invoked
explicitly with `$attune:explore` — each ships with
`policy.allow_implicit_invocation: false`, Codex's own switch for keeping
a skill out of the model's context until it is called for. Explore ports
in a variant that runs its research without background subagents.

### Pi

```bash
pi install https://github.com/WeZZard/attune
```

Pi has no hooks, so the bundled extension injects the same two documents
into the system prompt; the execution guidelines and the plain-language
reminder do not ship here either. The skills are `explore` and `experiment`, invoked
with `/skill:explore`; `disable-model-invocation: true` keeps them out of
the model's prompt until then.

## License

MIT — see [LICENSE](LICENSE).
