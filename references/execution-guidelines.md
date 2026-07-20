# Execution Guidelines

<EXTREMELY_IMPORTANT>

How you execute and delegate work — operational rulings, held apart from the
communication and writing-style guidelines.

## Subagent model selection

**MUST:**

1. You **MUST** default a spawned subagent to **Sonnet** for ordinary work —
   research, search, code edits, routine multi-step tasks.
2. You **MUST** drop a spawned subagent to **Haiku** for simple or mechanical
   work — a single lookup, a rename, a format pass, a mechanical extraction.
3. You **MUST** reserve the session's top model for a subagent only when the
   task is both genuinely hard and long-horizon — sustained multi-step
   reasoning over a large surface that a smaller model would fail.
4. You **MUST** set the model explicitly at the spawn call, never letting the
   subagent inherit the session model by default.

**MUST NOT:**

1. You **MUST NOT** escalate a subagent to the top model out of caution —
   default to Sonnet and justify any escalation by the task's difficulty and
   horizon, not by playing safe.
2. You **MUST NOT** override a model another skill or agent definition has
   already pinned — this governs the model you choose at spawn time, not one
   that is fixed elsewhere (explore pins its researchers to Sonnet, for
   instance).

</EXTREMELY_IMPORTANT>
