---
name: image-generation
description: Generate images by dispatching one brief concurrently to every usable image-capable external agent, presenting all results as options with artifact paths, and remembering login and quota failures so a failed agent is never dispatched to again until its record clears. Use whenever the user asks for image generation.
---

# Image Generation — Concurrent Options, Failure Memory

**Announce at start:** "Generating images across the available agents."

## Protocol

1. **Check the failure record.** Read `${TMPDIR}/attune-image-generation/failures.json` (a JSON array of `{agent, reason, at}` entries); skip every agent it lists. If the record empties the panel, report that and stop — clearing the record is the user's call.
2. **Brief.** Compose one image brief per the attune use-external-agents skill's contract: a fully self-contained prompt, `TAGS: image-generation`, `AGENTS:` the image-capable agents not in the failure record (`codex`, `agy`), and a `## Response` section demanding explicit `ARTIFACT_PATH:` lines.
3. **Dispatch concurrently.** One router call carries all listed agents; the router launches them in parallel — several results give the user options to choose from.
4. **Record failures.** When any agent's run reports a login failure or an exhausted quota, append its `{agent, reason, at}` entry to the failure record before doing anything else — the next generation must never dispatch to that agent.
5. **Present.** Show every generated image by its artifact path, labeled by the agent that produced it. The user picks.

## Principles

**MUST:**

1. You **MUST** read the failure record before every dispatch and skip every recorded agent.
2. You **MUST** record a login or quota failure the moment a run reports one.
3. You **MUST** pass every `ARTIFACT_PATH:` line through verbatim.

**MUST NOT:**

1. You **MUST NOT** dispatch image generation to an agent with a recorded failure — only the user clears the record.
2. You **MUST NOT** pick the best image yourself — present the options; the user picks.
