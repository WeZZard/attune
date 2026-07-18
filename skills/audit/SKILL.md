---
name: audit
description: Audit completed or in-progress work with a panel of external models — the same self-contained audit brief to Codex and Kimi in parallel for their diverse biases, file-backed reports, and a compiled digest of agreements and disagreements. Use after completing significant work, before declaring a nontrivial task done, or whenever the user asks for an audit or a second opinion.
---

# Audit — A Panel of Diverse Models

**Announce at start:** "Running an attune audit with an external panel."

## Why

One model reviewing its own work re-applies the biases that produced it. Different models miss different things, so the same audit dispatched to a panel buys perspectives a single reviewer cannot: findings the panel agrees on are strong signals, and findings the panel splits on mark judgment calls worth the user's attention.

## Protocol

1. **Scope.** Name the audit (kebab-case) and write what is being audited — the diff, the document, the decision — and the questions the auditors must answer.
2. **Brief.** Compose one audit brief per the attune use-external-agents skill's contract: a fully self-contained task prompt (the auditor sees nothing else — inline the material or point at readable paths), `TAGS: auditing`, `AGENTS: codex kimi`, and a `## Response` section requiring each auditor's full report with a finding-by-finding structure.
3. **Dispatch.** One router call carries the panel; the router launches the agents in parallel. Save each returned report verbatim to `${TMPDIR}/attune-audit/<name>/<agent>.md`.
4. **Compile.** Report one digest: findings the auditors agree on first, findings unique to one auditor with your assessment of each, and disagreements flagged for the user's judgment — every cited finding carries its report's file path.
5. **Rule.** The user decides which findings to act on. Act only after the ruling.

## Principles

**MUST:**

1. You **MUST** send the identical brief to every panel agent — divergent briefs make agreement and disagreement meaningless.
2. You **MUST** dispatch the whole panel through one router call, in parallel.
3. You **MUST** save every report verbatim to its file before compiling.
4. You **MUST** carry each cited finding's report path in the digest.
5. You **MUST** leave the audit directory in place — it is the audit's backtrace.

**MUST NOT:**

1. You **MUST NOT** run a one-model audit while a second panel agent is usable.
2. You **MUST NOT** drop a finding you disagree with — present it with your assessment; the user rules.
3. You **MUST NOT** act on a finding before the user's ruling.
