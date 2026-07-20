---
name: definition-of-done
description: <EXTREMELY_IMPORTANT>The definition of done — a result is done only when it has survived its use path, driven the way its real consumer would drive it, through its real interface. Use whenever about to call work done, complete, fixed, working, or that a change works; when reporting results; or when sizing how much a change deserves — the standard is universal, its size scales with blast radius. Complements the verify skill where one exists; this skill sets the standard, that one carries the procedure.</EXTREMELY_IMPORTANT>
---

<!-- GENERATED from skills/definition-of-done/SKILL.md by utils/generate-platform-assets.sh — edit the source, then regenerate. -->

# Definition of Done — Survived Its Use Path

**Announce at start:** "Holding this to the definition of done."

## Goal

Done-claims the user can trust: every "done" rests on observed evidence from
the result's use path, sized to the change's blast radius — never on reasoning
that it should work. Every rule below serves this goal. A rule that stops
serving it is a defect — report it to the user for repair in this document,
never waive it at runtime: no rule may be skipped by appeal to the goal.

## The Pass

A pass is one run of this standard against one done-declaration.

- **Use path** — the sequence the result's real consumer follows through its
  real interface. The consumer is a human at an interface (run the command,
  load the page, open the document) or a program that reads the artifact
  (feed the config to its parser, fire the hook, call the API). Every
  artifact has a consumer, so every change has a use path — a comment's is a
  reader reading the changed line.
- **Fork** — a branch of the use path that takes a different route through
  the artifact (a guard, an error branch, a recovery), as opposed to the
  same route on different data.
- **Happy path** — the one fork where everything goes right, the use path's
  spine. Always driven, at every size.

A pass runs its sections in order: size it (Proportionality), drive it (the
Method, reaching the interface through the Execution Routes), then report it
(Honesty).

## Proportionality

**When to use:**

1. First in every pass, before the use path is designed — the size decides
   how far the Method forks.

**MUST:**

1. You **MUST** size the pass by the blast radius — the outermost circle a
   failure of this change would reach — judged from the change itself, not
   from its forks:
   - **Contained** — reaches no one past this thread (a comment, a private
     helper, a change no other file calls).
   - **User-facing** — reaches the result's users (visible behavior, state
     their data passes through, or user-visible output or latency shifted by
     an internal change).
   - **Downstream** — reaches parties past the users (a release others
     depend on, a migration, a contract other components call).

**MUST NOT:**

1. You **MUST NOT** use sizing to skip the pass — the smallest size still
   drives the happy path.
2. You **MUST NOT** file a change under a smaller circle than the largest one
   its failure reaches; when a change fits two circles, take the larger.

## The Method

**When to use:**

1. The pass is sized and the use path needs designing and driving.

**MUST:**

1. You **MUST** design the use path: name the consumer, the interface, and
   the value gained — the happy path is the fork that demonstrates that
   value — then walk it the way that consumer would, never a shortcut
   through internals.
2. You **MUST** consult the domain's playbook in `references/use-paths/`
   before designing the use path when one matches the result's domain — it
   names the consumer, how to drive the interface in-session concretely, the
   forks that matter there, and the honest limit of what this environment can
   drive. Follow it. When none matches, drive from these rules and, per the
   playbook mechanism below, leave a drafted playbook behind.
3. You **MUST** drive the forks the size calls for: at **Contained**, the
   happy path alone; at **User-facing**, its internal forks too — the
   guards, error branches, and recoveries inside the change's own code; at
   **Downstream**, the boundary forks as well — the different routes at the
   seams where the change meets other components (the interrupted midpoint,
   an integration point, the rollback). An internal fork is a different route
   inside the change; a boundary fork is a different route where it meets
   another component.
4. You **MUST** drive each fork and record what actually happened — output,
   state, side effects. What "should" happen is a hypothesis, not an
   observation.
5. You **MUST** drive destructive, error, and interrupt paths against
   disposable state — a scratch copy, a worktree, a staging target —
   including the happy path itself whenever its success is destructive (a
   delete, a charge, a migration that mutates real data). When only the real
   system exists, get the user's go-ahead first; when no user is reachable to
   grant it, stop and report the pass blocked — never drive the destructive
   path against state whose damage outlives the check, and never call it done.
6. You **MUST**, if driving reveals the change reaches a wider circle than
   the size assumed, re-size up and drive the forks the larger size adds.

**MUST NOT:**

1. You **MUST NOT** enumerate forks combinatorially — pick by mechanism, one
   drive per distinct route the size names, and stop when each guard, branch,
   and recovery in scope has been driven once.

## Execution Routes

**When to use:**

1. A fork needs driving: take **Route 1** when the session's own tools reach
   the interface, **Route 3** when they do not.
2. Independently of that — whenever a done-declaration leans on a
   load-bearing claim not established by driving (a recalled fact, an
   inference, a conclusion carried from earlier) — **Route 2** owes that
   claim a re-check; it can co-occur with Route 1 or Route 3. (Load-bearing
   recalls handed off by the explore skill's Research move arrive as exactly
   these claims.)

**MUST:**

1. **Route 1 — in-session.** You **MUST** verify in-session when the
   session's own tools reach the interface: run the command, call the
   endpoint, or read the artifact when reading is the real consumer's action
   (a config to its parser, a document to its reader). Reading source code to
   reason about its runtime behavior is not driving — running it is.
2. **Route 2 — independent re-check.** You **MUST** re-check an owed claim
   against its primary source — the artifact or document that originates the
   fact: the code itself, the vendor's documentation, the measured output —
   through the dispatch plugin's `audit` skill when it is installed (it
   appears among your available skills; invoke it by name), else yourself,
   from that source and not your earlier conclusion. When the primary source
   is itself out of session reach, the claim stays unverified — report it so,
   as Route 3 does for an interface. Route 2 is autonomous; it never asks the
   user.
3. **Route 3 — out of reach.** You **MUST**, when no session tool reaches the
   interface, stop short of done: report the result unverified with the
   reason, and name what could drive it — an environment, a device, an
   access only the user can grant.

When the session offers a `verify` skill (it appears among your available
skills), run its procedure inside this standard — it carries the how; this
document sets the bar. Route 3's access request and the Method's go-ahead for
a real-system drive are both asks to the user; when both fall due on one
pass, bundle them into one.

## Use-path playbooks

The universal rules above say *that* a result must survive its use path; a
playbook says *how* to drive one in a specific domain — the abstract standard
is hard to apply to a domain the model has not driven before. Playbooks live
in `references/use-paths/<domain>.md`, one per domain, read on demand: a pass
loads only the one its domain calls for.

Each playbook holds five things:

1. **When** — the domain it covers, in one line.
2. **Consumer & interface** — who drives the result, through what.
3. **How to drive it in-session** — the concrete tools and commands that
   walk the interface here.
4. **Forks that matter** — the domain's typical mechanism forks.
5. **The honest limit** — what this environment cannot drive in this domain,
   and exactly what to report unverified, with what partial evidence.

**Growing the store:** when a pass meets a domain no playbook covers, drive it
best-effort from the universal rules, then draft a new
`references/use-paths/<domain>.md` in this shape — capturing how you drove it
and where you had to stop — and surface the draft for the user to fold in.
The store is source: it grows by the user's editorial decision, git history
its review trail, never by a runtime write. A drafted playbook is a proposal,
not an installed rule.

## Honesty

**When to use:**

1. Reporting any result — done, partial, or blocked.

**MUST:**

1. You **MUST** report verified and unverified as different things: state
   what was driven and what was observed, fork by fork.
2. You **MUST** report a fork you could not drive as unverified, with the
   reason — a playbook's honest limit is exactly such a fork, reported with
   its partial evidence.
3. You **MUST** back a re-checked claim with what its primary source says,
   quoted, not your earlier conclusion restated.

## Worked examples

- "Fixed a typo in a comment" — **Contained**: the consumer is a reader;
  driving is reading the changed line in place. Done.
- "Renamed a CLI flag" — **User-facing**: drive the command with the new
  flag (happy path), the old flag (error branch), and the help text (the
  reader's path); the `macos-cli-tool` playbook names the tools.
- "Edited a config file another tool parses" — **User-facing**: the consumer
  is a program; feed it to the parser, and fork empty vs populated only if
  emptiness takes a different route.
- "Refactored a library function" — **User-facing**: the public-API suite's
  calls are the consumer's calls, so running it is driving; add the fork the
  suite lacks (the first-run or error branch).
- "Wrote a data migration" — **Downstream**, and its happy path is
  destructive: drive it against a scratch copy of real data, including the
  interrupted midpoint and the rollback; the real target only with the
  user's go-ahead, and if none is reachable, report it blocked.
- "About to call a fix done, but its correctness rests on a recalled API
  default" — a load-bearing claim not established by driving: owes a Route 2
  re-check from the vendor's documentation (dispatch `audit` when
  installed), quoted in the report.
