# Attune

Attune carries the standing communication guidelines — George Orwell's rules from "Politics and the English Language" (1946) — and injects them at session start, so they govern every reply in conversation and every prose artifact the agent writes. Beside them it carries the execution rulings and two user-invoked skills for the questions a design discussion turns on. Explore drives the discussion and brings you only what only you can settle. Experiment settles a question by blind comparison. Two more skills, Claude Code only, review a document with one blind expert per section and fix what the review found. One repo ships three plugins: Claude Code, Codex, and Pi, all fed by the same `references/*.md` and `skills/*` source of truth. Claude Code always carries the full feature set; `porting.json` (the port matrix) decides what ships to the other platforms.

- **The communication guidelines** are the whole rule set, and nothing else here rules prose: cut a word wherever a word can be cut; never use a metaphor you are used to seeing in print; never a long word where a short one will do; never the passive where the active will serve; never a foreign or jargon word when an everyday English one exists — and break any of these sooner than say anything outright barbarous. A second document carries the whole-passage specimens, prose gone dead at length.
- **The clear-expression reminder** is one paragraph, and it arrives with every prompt and again before every Write tool call rather than once at session start. It carries four rules.

  1. Output in plain and simple language.
  2. Treat the user as a lay reader who did not watch the work.
  3. Use a structured ordered or unordered list rather than a comma-, semicolon-, or period-separated inline list, and write a complete sentence for each list item.
  4. Use the standard and established concepts and terms of the relevant fields, and never invent terminology on the fly.

  These are the rules that decay first in a long conversation, so they are the ones worth repeating. Claude Code only — on a small context window the repetition costs more than it buys.
- **The execution guidelines** rule how work is delegated: which model a spawned subagent gets, and why caution alone is never a reason to escalate one.
- **Explore** drives a design discussion by four moves. The model drives; you spend judgment, never legwork.

  1. Ask raises the purpose, alternative, and shortcut questions at the model itself first, then puts what is left to you well-shaped.
  2. Sort splits every open point into a world fact, a fact only you hold, or a judgment. A world fact is never asked of you, at most routed through you.
  3. Research settles world facts through the cheapest sufficient source, trying memory, then this machine, then the web.
  4. Experiment creates the answer nothing existing holds.
- **The experiment** settles questions that only trying can answer, such as "does the shorter opening actually read better?". It produces candidate versions, blinds them, has judges rank them against one criterion stated up front, and hands you the verdicts. You make the ruling.
- **Review-doc** reviews a document section by section. It splits the document, briefs one blind expert subagent per section with that section's who, what, when, where, why, and how, runs the experts as a workflow beside one whole-document expert, and writes the findings to `.reviews/` under the project. Claude Code only.
- **Fix-issues** applies what a review found. Mechanical fixes it applies itself; judgments it puts to you in batches of four, then it records every outcome in the review. Claude Code only.

The guidelines arrive on their own; the skills never do. All four skills are user-invoked only and are hidden from the model's own skill list, so they run when you ask for them and at no other time.

## Quick Start

### Claude Code

```text
/plugin marketplace add wezzard/skills
/plugin install attune@wezzard-skills
```

Start a session. Three SessionStart hooks inject the communication guidelines, their specimens, and the execution guidelines; a UserPromptSubmit hook adds the clear-expression reminder to every prompt, and a PreToolUse hook repeats it before every Write tool call. Run the skills with `/attune:explore`, `/attune:experiment`, `/attune:review-doc <file>`, and `/attune:fix-issues <review>`.

### Codex

```bash
codex plugin marketplace add WeZZard/skills
codex plugin add attune@wezzard-skills
```

Two SessionStart hooks inject the communication guidelines and their specimens; the execution guidelines and the clear-expression reminder stay Claude-only per `porting.json`. The skills are `attune:explore` and `attune:experiment`, invoked explicitly with `$attune:explore` — each ships with `policy.allow_implicit_invocation: false`, Codex's own switch for keeping a skill out of the model's context until it is called for. Explore ports in a variant that runs its research without background subagents. Review-doc and fix-issues do not ship here: they drive the Workflow and AskUserQuestion tools, which only Claude Code carries.

### Pi

```bash
pi install https://github.com/WeZZard/attune
```

Pi has no hooks, so the bundled extension injects the same two documents into the system prompt; the execution guidelines and the clear-expression reminder do not ship here either. The skills are `explore` and `experiment`, invoked with `/skill:explore`; `disable-model-invocation: true` keeps them out of the model's prompt until then. Review-doc and fix-issues do not ship here either.

## License

MIT — see [LICENSE](LICENSE).
