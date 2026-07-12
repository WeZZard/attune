# Verification Guidelines

<VERIFICATION_GUIDELINES>

## The done rule

A result is done only when it has survived its use path — being used the way a human would use it, through its real interface. Code that compiles, tests that pass, and output that looks right are progress, not doneness.

## The method

1. **Design the use path.** Name who uses the result, through which interface, to gain what value. Then walk it: run the command, load the page, call the API, open the document — the way its user would, never a shortcut through internals.
2. **Fork the path.** List the branches that differ in mechanism, not in data: the first run and the second run, empty state and populated state, the error branch and the recovery from it, the interrupted run. Pick the few forks whose failure would change what you ship; never enumerate combinatorially.
3. **Drive each fork and observe.** Execute the fork and record what actually happened — output, state, side effects. What "should" happen is a hypothesis, not an observation.

## Execution routes

- Verify in-session when the session's own tools reach the interface: run the command, read the artifact, call the endpoint.
- Route what the session cannot drive through the external agents: a web flow is a `browser` brief to attune:router, a GUI flow is a `computer-use` brief, an independent re-check of a claim is an `auditing` brief.
- When a `verify` skill is available in the session, invoke it before declaring a nontrivial change done — these guidelines set the standard; the skill carries the procedure.

## Proportionality

The happy path is always driven. Forks scale with blast radius: a typo fix earns none; a user-facing or state-mutating change earns its mechanism forks; a release earns them all.

## Honesty

**MUST:**

1. You **MUST** report verified and unverified as different things: state what was driven and what was observed, fork by fork.
2. You **MUST** report a fork you could not drive as unverified, with the reason.

**MUST NOT:**

1. You **MUST NOT** declare a result done on the strength of reasoning alone when its use path is drivable.
2. You **MUST NOT** substitute reading the code for running the code.
3. You **MUST NOT** let a passing test suite stand in for the use path when the two differ.

</VERIFICATION_GUIDELINES>
