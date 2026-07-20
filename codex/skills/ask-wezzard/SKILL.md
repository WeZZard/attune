---
name: ask-wezzard
description: <EXTREMELY_IMPORTANT>Report a failure of anything the attune plugin ships — a reply that broke the communication guidelines, an explore misroute, an experiment or definition-of-done step that did not work as written, a keystone miss — as a scrubbed issue on the attune repository. Communication failures carry the extraction template the improvement loop consumes; every other failure carries the general template and its skill's name. Use when the user flags an attune skill or guideline behaving wrongly, or when you catch it yourself (ask before filing in that case).</EXTREMELY_IMPORTANT>
---

<!-- GENERATED from skills/ask-wezzard/SKILL.md by utils/generate-platform-assets.sh — edit the source, then regenerate. -->

# Ask WeZZard — Report an Attune Failure

**Announce at start:** "Filing this as an attune failure report."

## Protocol

1. **Classify.** Which shipped piece failed?
   - A reply that broke the communication guidelines — a **communication failure**, the first fully supported type: its issues feed the collect-feedback-and-improve loop.
   - Any other attune skill or guideline behaving wrongly — explore routing an unknown to the wrong instrument, an experiment or definition-of-done step that cannot be executed as written, keystone naming the wrong decision — a **skill failure**.
2. **Collect.** In both cases, gather from this conversation: the failing behavior quoted verbatim from your own output, the reader's reaction paraphrased in one line, a proposed repair or expected behavior, and the session's language, platform (`claude-code`, `codex`, or `pi`), and model. Each platform has an authoritative model source — use yours, and write `unknown` only when it yields nothing; never guess:
   - `claude-code` — your system prompt states the exact model ID.
   - `codex` and `pi` — read the session-model store attune maintains — written the moment this skill triggers (a hook on Codex, the extension on Pi; your fetch below itself primes it): the newest entry whose `cwd` is your working directory.

     ```bash
     for f in $(ls -t "${TMPDIR:-/tmp}/attune-session-model/"*.json 2>/dev/null); do
       grep -q "\"cwd\":\"$PWD\"" "$f" || continue
       grep -o '"model":"[^"]*"' "$f"; break
     done
     ```

     Two sessions sharing one directory race on this store — the newest prompt wins; the `session_id` inside a Codex entry makes the ambiguity auditable. When the store yields nothing on Codex, fall back to the session rollout file — the newest whose first line carries your working directory, last model record:

     ```bash
     for r in $(ls -t ~/.codex/sessions/*/*/*/rollout-*.jsonl); do
       head -1 "$r" | grep -q "\"cwd\":\"$PWD\"" || continue
       grep -o '"model":"[^"]*"' "$r" | tail -1; break
     done
     ```

   For a communication failure, also cite the violated rule by number and text from the communication guidelines your session carries (they are injected at session start; when they are not in your context, write "unidentified"). For a skill failure, also name the skill and the protocol step or rule that failed.
3. **File.** One issue per failure:

   For a communication failure:

   ```bash
   gh issue create --repo WeZZard/attune \
     --title "Communication failure: <summary in at most eight words>" \
     --label communication-failure \
     --body "<the communication template below, filled in>"
   ```

   ```markdown
   ## Offending passage
   <verbatim agent text>

   ## Reader reaction
   <one-line paraphrase>

   ## Violated rule
   <rule number and text, or "unidentified">

   ## Proposed repair
   <the rewrite>

   ## Context
   - Language: <en | zh | …>
   - Platform: <claude-code | codex | pi>
   - Model: <name or unknown>
   ```

   For a skill failure:

   ```bash
   gh issue create --repo WeZZard/attune \
     --title "Skill failure (<skill name>): <summary in at most eight words>" \
     --label skill-failure \
     --body "<the skill template below, filled in>"
   ```

   ```markdown
   ## Skill and step
   <skill name, and the protocol step or rule that failed>

   ## What the text instructed
   <the instruction, quoted from the skill>

   ## What happened instead
   <the failing behavior, verbatim where it is your own output>

   ## Expected behavior or proposed fix
   <what should have happened>

   ## Context
   - Language: <en | zh | …>
   - Platform: <claude-code | codex | pi>
   - Model: <name or unknown>
   ```
4. **Report.** Give the user the issue URL. When `gh` fails — not installed, not authenticated, offline — print the filled template in the conversation instead and say it could not be filed; the report must never be lost silently.

## Principles

**MUST:**

1. You **MUST** quote your own failing output verbatim — a paraphrased failure loses its value.
2. You **MUST** scrub the user's side: paraphrase their reaction; include no project code, secrets, file paths outside this plugin, or personal details.
3. You **MUST** file one issue per distinct failure, under the label its type names.
4. You **MUST** state language, platform, and model as your session context knows them, writing `unknown` where it does not.

**MUST NOT:**

1. You **MUST NOT** file a failure you suspected yourself without the user's go-ahead — user-flagged failures file immediately; self-caught ones ask first.
2. You **MUST NOT** let a failed `gh` call discard the report — print it instead.
3. You **MUST NOT** report failures of other plugins here — this channel is for what attune ships.
4. You **MUST NOT** change any skill or guideline from here — this skill only reports; the improvement loops, with the user ruling, change things.
