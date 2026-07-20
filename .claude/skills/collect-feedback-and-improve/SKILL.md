---
name: collect-feedback-and-improve
description: <EXTREMELY_IMPORTANT>The attune maintenance loop — turn filed communication-failure issues into contrastive examples for the communication guidelines. Reads the open issues, drafts one bad/good pair per failure with its anchoring rule and scope (language, platform, model), presents every pair for the user's ruling, folds accepted pairs into the guidelines with per-issue provenance, closes the folded issues, and reports which rules keep failing (escalation candidates) and which never fail (prune candidates). Use only inside the attune repository, when the user asks to process accumulated feedback.</EXTREMELY_IMPORTANT>
---

# Collect Feedback and Improve

**Announce at start:** "Processing the communication-failure backlog."

## Ground rule

The guidelines change solely by the user's ruling. This skill drafts and proposes; it edits `references/communication-guidelines.md` only after the user accepts each pair, and it never adds, rewords, or removes a numbered rule — new rules are the user's editorial act alone.

## Protocol

1. **Guard.** Run only in a working copy of the attune repository (`git remote get-url origin` names `WeZZard/attune`); otherwise stop and say so.
2. **Fetch.** List the backlog:

   ```bash
   gh issue list --repo WeZZard/attune --label communication-failure --state open \
     --json number,title,body --limit 100
   ```
3. **Draft.** Issues follow the ask-wezzard skill's template — the offending passage, reader reaction, violated rule, proposed repair, and a Context section carrying language, platform, and model. For each issue, produce one contrastive pair: **Bad** is the offending passage, verbatim from the issue; **Good** is the repair, refined if the issue's proposal can be improved; plus the anchoring rule number and the scope from the issue's context fields. A failure that fits no existing rule is flagged "needs a rule — the user's call", never drafted into one.
4. **Rule.** Present every drafted pair to the user — issue link, anchoring rule, scope, the pair itself — and take a ruling per pair: fold, amend, or reject.
5. **Fold.** Insert each accepted pair as an EXAMPLE block under its rule in `references/communication-guidelines.md`, with provenance and scope:

   ```markdown
   <EXAMPLE>

   **Bad (zh, codex):** <the verbatim failure> (per issue #12)
   **Good (zh, codex):** <the repair>

   </EXAMPLE>
   ```

   A universal pair carries no scope tag; a scoped pair names the language and, when the failure is platform- or model-specific, the platform or model. Keep separate pairs for separate scopes — never merge a Chinese failure and an English failure into one example.
6. **Close.** For each folded issue: `gh issue comment <number> --repo WeZZard/attune --body "<the ruling and the folded example's rule>"`, then `gh issue close <number> --repo WeZZard/attune`. A rejected pair closes the same way with `--reason "not planned"` and the ruling in the comment.
7. **Report.** End with two lists: rules that keep collecting failures despite existing examples — candidates for Stop-hook enforcement — and rules that have never collected one — candidates for pruning. Both are the user's decisions; this skill only surfaces the tallies.
8. **Gate.** Run `sh .githooks/pre-commit` from the repository root before handing back: the hook budget check guards the guidelines' growth. When the communication document nears its injection cap, propose sharding examples by language rather than trimming rules — the user rules on that too.

## Principles

**MUST:**

1. You **MUST** keep every Bad side verbatim from its issue.
2. You **MUST** carry a provenance mark `(per issue #N)` on every folded example.
3. You **MUST** take the user's ruling pair by pair — never fold a batch on one blanket yes.
4. You **MUST** keep scopes separate — one pair per language and platform combination that actually failed.

**MUST NOT:**

1. You **MUST NOT** add, reword, or remove a numbered rule.
2. You **MUST NOT** invent failures, repair text the issue does not support, or close an issue without a ruling.
3. You **MUST NOT** fold anything while the pre-commit gate fails.
