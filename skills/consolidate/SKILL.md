---
name: consolidate
description: Compress the attune ruling store when the generated preference sheet exceeds its budget or rulings accumulate overlap — merge duplicates via supersedes rows, retire contradicted rulings, and verify the sheet fits. Use when the session-start sheet reports truncation, or when the user asks to clean up their rulings.
---

# Consolidate — Keep the Sheet Under Budget

**Announce at start:** "I'm consolidating the attune ruling store."

## Why

The SessionStart hook injects the preference sheet within a hard platform limit (10,000 chars per hook output; the generator budgets 8,000). Past the budget the sheet truncates, and truncated rulings silently stop reaching sessions. Consolidation restores headroom without losing judgments.

## Protocol

1. **Measure.** Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/generate-sheet.mjs" <project-dir>` — stderr reports the ruling count, the character size, and a TRUNCATED flag.
2. **Merge.** Find rulings that state one judgment across several rows. Record one merged row, plus one `supersedes` row per absorbed id. The store is append-only — never edit or delete existing lines.
3. **Retire.** A ruling the user's recent behavior contradicts is a question, not a deletion: confirm with one `AskUserQuestion`, then append a row with the same `id` and `status: retired` (a later row with the same id replaces the earlier one).
4. **Tighten.** Rewrite verbose ruling text into the shortest form a future session can still apply. Same append mechanics.
5. **Verify.** Re-run step 1. Every active ruling must render untruncated.

Every merged or tightened row keeps the original oracle marks; add today's date and note the consolidation in `rationale`.
