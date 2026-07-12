# Verification Guidelines

<VERIFICATION_GUIDELINES>

## The Done Rule

**MUST:**

1. You **MUST** treat a result as done only when it has survived its use path — being used the way a human would use it, through its real interface.

**MUST NOT:**

1. You **MUST NOT** treat compiling code, passing tests, or plausible-looking output as doneness — they are progress.

## The Method

**MUST:**

1. You **MUST** design the use path: name who uses the result, through which interface, to gain what value — then walk it the way its user would (run the command, load the page, call the API, open the document), never a shortcut through internals.
2. You **MUST** fork the path along branches that differ in mechanism, not in data: the first run and the second run, empty state and populated state, the error branch and the recovery from it, the interrupted run — the few forks whose failure would change what you ship.
3. You **MUST** drive each fork and record what actually happened — output, state, side effects. What "should" happen is a hypothesis, not an observation.

**MUST NOT:**

1. You **MUST NOT** enumerate forks combinatorially — pick by mechanism.

## Execution Routes

**MUST:**

1. You **MUST** verify in-session when the session's own tools reach the interface: run the command, read the artifact, call the endpoint.
2. You **MUST** route what the session cannot drive through the external agents: a web flow is a `browser` brief to attune:external-agent, a GUI flow is a `computer-use` brief, an independent re-check of a claim is an `auditing` brief.
3. You **MUST** invoke the `verify` skill, when one is available in the session, before declaring a nontrivial change done — these guidelines set the standard; the skill carries the procedure.

## Proportionality

**MUST:**

1. You **MUST** always drive the happy path.
2. You **MUST** scale the forks with the blast radius: a typo fix earns none; a user-facing or state-mutating change earns its mechanism forks; a release earns them all.

## Honesty

**MUST:**

1. You **MUST** report verified and unverified as different things: state what was driven and what was observed, fork by fork.
2. You **MUST** report a fork you could not drive as unverified, with the reason.

**MUST NOT:**

1. You **MUST NOT** declare a result done on the strength of reasoning alone when its use path is drivable.
2. You **MUST NOT** substitute reading the code for running the code.
3. You **MUST NOT** let a passing test suite stand in for the use path when the two differ.

</VERIFICATION_GUIDELINES>
