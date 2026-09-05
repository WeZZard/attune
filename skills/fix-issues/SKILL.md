---
name: fix-issues
description: "Fix what a review found: apply every mechanical finding directly, put every judgment finding to the user in batches, and record each finding's outcome in the review."
argument-hint: "[review file]"
disable-model-invocation: true
---

# Fix the Issues a Review Found

**Announce at start:** "I'm using the attune fix-issues skill."

The review is one the attune review-doc skill wrote under `.reviews/`. You apply the mechanical findings; the user rules on the judgment findings; every outcome goes back into the review.

## 1. Resolve the argument

The argument is: `$ARGUMENTS`

**MUST:**

1. You **MUST** stop and ask for the review when the argument is empty or resolves to nothing — never pick one yourself.
2. You **MUST** use a path that exists as it is.
3. You **MUST** otherwise take the file of that name under `.reviews/` at the project root — the git top level inside a repository, else the working directory.
4. You **MUST** otherwise take the newest `.reviews/*-<name>.md`, where `<name>` is the argument with its extension dropped — the timestamp prefix sorts, so the newest is last.

## 2. Read

**MUST:**

1. You **MUST** read the review and the document its `Source:` line names, and stop when the source is missing.
2. You **MUST** skip every finding whose `Outcome` is not `pending`.

## 3. Sort the findings

**MUST:**

1. You **MUST** apply a mechanical finding and ask a judgment finding.
2. You **MUST** reclassify only toward judgment: when a mechanical fix would change meaning, when the finding's quote overlaps another finding's, or when the quote appears more than once in the source.
3. You **MUST** group findings whose quotes overlap — a section expert and the whole-document expert often flag one sentence — so the user rules once on that text.
4. You **MUST** mark a finding `stale` when its quote no longer appears in the source, and neither apply nor ask it.

## 4. Apply the mechanical findings

**MUST:**

1. You **MUST** replace the quote, by exact match, with the fix — and touch nothing outside it.

## 5. Ask the judgment findings

**MUST:**

1. You **MUST** use the AskUserQuestion tool — one question per finding or per group, four questions per call, the tool's maximum.
2. You **MUST** order the questions blocking, then major, then minor, then by position in the document.
3. You **MUST** put the finding's id in the header, and the quote, the issue, and the proposed fix in the question — every finding's, for a group.
4. You **MUST** offer "Apply the proposed fix" — one such option per distinct fix in a group — and "Keep as it is"; the user's own wording arrives through the tool's Other entry.
5. You **MUST** state the rulings before the next call, and apply each the way step 4 applies a mechanical fix.

## 6. Record and report

**MUST:**

1. You **MUST** set every handled finding's `Outcome` in the review to `fixed`, `kept`, `changed: <the user's wording>`, `superseded by <id>` (a grouped finding whose text took another finding's fix), or `stale`, and rewrite the review's `Outcomes:` line with the counts of each.
2. You **MUST** report the counts and every ruling, with the review's path.

## Invariants

**MUST NOT:**

1. You **MUST NOT** ask about a mechanical finding.
2. You **MUST NOT** apply a judgment finding without a ruling.
3. You **MUST NOT** edit text outside a finding's quote.
4. You **MUST NOT** alter a finding's quote, issue, or fix in the review — only its outcome.
