---
name: verification
description: The standard for calling work done — a result is done only when it has survived its use path, driven the way a human would use it, through its real interface. Use before declaring any nontrivial change done, when reporting results, or when deciding how much verification a change deserves. Complements the verify skill where one exists; this skill sets the standard, that one carries the procedure.
---

<!-- GENERATED from skills/verification/SKILL.md by utils/generate-platform-assets.sh — edit the source, then regenerate. -->

# Verification — Done Means Survived Its Use Path

**Announce at start:** "Holding this to the verification standard."

## The Done Rule

**MUST:**

1. You **MUST** treat a result as done only when it has survived its use path — being used the way a human would use it, through its real interface.

**MUST NOT:**

1. You **MUST NOT** accept a substitute for driving the use path.
   - Exemplars: reasoning that it should work; reading the code instead of running it; a passing test suite when it differs from the use path; output that merely looks right.

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
2. You **MUST** route an independent re-check of a claim through the dispatch plugin's `audit` skill when it is installed — invoke it by name; without it, re-check the claim yourself from fresh evidence, re-derived from the primary source, never from your earlier conclusion.
3. You **MUST** invoke the `verify` skill before declaring a nontrivial change done when the session offers one; when none exists, this standard alone governs. This skill sets the standard; that one carries the procedure.

## Proportionality

**MUST:**

1. You **MUST** always drive the happy path.
2. You **MUST** scale the forks with the blast radius: a typo fix earns none; a user-facing or state-mutating change earns its mechanism forks; a release earns them all.

## Honesty

**MUST:**

1. You **MUST** report verified and unverified as different things: state what was driven and what was observed, fork by fork.
2. You **MUST** report a fork you could not drive as unverified, with the reason.
