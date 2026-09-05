---
name: review-doc
description: "Review a document section by section: split it, brief one blind expert subagent per section with the section's 5W1H, run the experts as a workflow beside one whole-document expert, and write the findings to .reviews/."
argument-hint: "[file]"
disable-model-invocation: true
---

# Review a Document

**Announce at start:** "I'm using the attune review-doc skill."

You orchestrate: you split the document, brief the experts, run them, and write the review. You never review a section yourself. Each expert is blind — it sees its own section and its brief, nothing else — so the brief must carry everything the rest of the document would have told it.

## 1. Resolve the argument

The argument is: `$ARGUMENTS`

**MUST:**

1. You **MUST** stop and ask for the file when the argument is empty — never pick a document yourself.
2. You **MUST** use a path that exists as it is.
3. You **MUST** search a bare name by basename from the project root — the git top level inside a repository, else the working directory — with `git ls-files` inside a repository and `find` otherwise, skipping `.git/`, `node_modules/`, and `.reviews/`.
4. You **MUST** use a single match, put several matches to the user, and stop on none.

## 2. Split the document

**MUST:**

1. You **MUST** read the whole document before splitting it.
2. You **MUST** split at the document's own headings; without headings, at the topic changes you can see.
3. You **MUST** merge a fragment shorter than a paragraph into its neighbour — no expert reviews a fragment.
4. You **MUST** record each section's title and line range.
5. You **MUST**, when the section count exceeds the session's workflow size guideline, merge the smallest neighbouring sections until it fits, and name the merges in the review.

## 3. Brief each section

Write for every section:

- **Who:** whom the section speaks to, and whom or what it is about.
- **What:** what it says or claims, in two or three sentences.
- **When:** where it falls on the reader's path — what the reader knows on arrival, and what follows.
- **Where:** the file path, the line range, and the section's place in the document's structure.
- **Why:** what it is for in the whole document, and what would be lost without it.
- **How:** how it makes its case — form, evidence, register, length.
- **Expert:** the specialist the section needs, chosen by its subject and form — a technical editor for prose, a domain specialist for claims in a field, both when a section carries both.

## 4. Run the experts

Call the Workflow tool with the script below unchanged as `script`, and this value as `args`:

```json
{
  "document": { "path": "<path>", "text": "<the whole document>" },
  "sections": [
    {
      "title": "<title>",
      "lines": "<first>-<last>",
      "text": "<the section, verbatim>",
      "expert": "<expert>",
      "brief": { "who": "…", "what": "…", "when": "…", "where": "…", "why": "…", "how": "…" }
    }
  ]
}
```

**MUST:**

1. You **MUST** wait for the workflow's completion notification — never report while it runs.
2. You **MUST**, when the Workflow tool is absent from the session, run the same prompts as background Agent calls — one per section plus the whole-document one, each with `model: "fable"` — and say so.

The experts run on Fable by the user's ruling (2026-09-05); the script pins it, so the execution guidelines' default does not apply here.

```js
export const meta = {
  name: 'review-doc',
  description: 'One blind expert per section plus one whole-document expert',
  phases: [{ title: 'Review' }],
}
const FINDING = {
  type: 'object',
  properties: {
    quote: { type: 'string' },
    issue: { type: 'string' },
    fix: { type: 'string' },
    kind: { type: 'string', enum: ['mechanical', 'judgment'] },
    severity: { type: 'string', enum: ['blocking', 'major', 'minor'] },
  },
  required: ['quote', 'issue', 'fix', 'kind', 'severity'],
}
const FINDINGS = {
  type: 'object',
  properties: { findings: { type: 'array', items: FINDING } },
  required: ['findings'],
}
const CONTRACT = `## Checks

1. Truth: a claim that is wrong, unsupported, or against the brief.
2. Fit: the text fails its Why or its Who.
3. Clarity: a sentence the reader must read twice, a term left undefined, a term invented.
4. Completeness: what the purpose needs and the text omits.
5. Economy: what the text carries that the purpose does not need.

## Each finding

- quote: the exact text the finding anchors to, copied verbatim — it will be replaced by exact match, so it must appear in the text exactly once.
- issue: what is wrong, in one or two sentences.
- fix: for a mechanical finding, the exact replacement text; for a judgment finding, the change proposed and the choice it turns on.
- kind: "mechanical" when the replacement is exact and no reasonable author would object; "judgment" when the fix changes meaning, scope, emphasis, or structure, or rests on a fact only the author holds.
- severity: "blocking" when the text fails without the fix; "major" when a reader is misled or lost; "minor" for polish.

## Rules

- You MUST return an empty findings list when nothing is wrong.
- You MUST NOT open the reviewed document or any other part of it — the brief is all you know of the rest.
- You MAY check a claim against this machine — a file the text names, a command's help.
- You MUST NOT rewrite the text; report findings only.
- You MUST NOT file taste as mechanical.`
const brief = (b) =>
  `Who: ${b.who}\nWhat: ${b.what}\nWhen: ${b.when}\nWhere: ${b.where}\nWhy: ${b.why}\nHow: ${b.how}`
const sectionPrompt = (s) =>
  `You are ${s.expert}. Review one section of a document you cannot see; the brief is all you know of the rest.\n\n## Brief\n${brief(s.brief)}\n\n## Section\n${s.text}\n\n${CONTRACT}`
const wholePrompt = () =>
  `You are a senior editor. Review the whole document, given below in full, for order, repetition, contradiction between sections, missing sections, and whether it delivers what its opening promises. Leave sentence-level faults to the section experts.\n\n## Section briefs\n${args.sections.map((s, i) => `### ${i + 1}. ${s.title}\n${brief(s.brief)}`).join('\n\n')}\n\n## Document\n${args.document.text}\n\n${CONTRACT}`
const opts = (label) => ({ label, phase: 'Review', model: 'fable', schema: FINDINGS })
const results = await parallel([
  ...args.sections.map((s, i) => () => agent(sectionPrompt(s), opts(`section ${i + 1}: ${s.title}`))),
  () => agent(wholePrompt(), opts('whole document')),
])
const whole = results.pop()
return {
  sections: results.map((r) => (r ? r.findings : null)),
  whole: whole ? whole.findings : null,
}
```

## 5. Write the review

**MUST:**

1. You **MUST** stamp the run with `date -u +%Y-%m-%d-%H-%M-%SZ`.
2. You **MUST** write to `.reviews/<stamp>-<stem>.md` at the project root — `<stem>` is the document's basename without its extension — creating `.reviews/` when it is missing.
3. You **MUST** number a section's findings `<section>.<n>` and the whole-document findings `W.<n>`, in the order the expert returned them, and give every finding `Outcome: pending` — the fix-issues skill fills it.
4. You **MUST** write "No findings." for a section whose expert returned none, and "Expert failed; not reviewed." for one whose result is null.
5. You **MUST** report the review's path and its finding counts.

Required review format:

```markdown
# Review of <path>

- Source: `<path>`
- Reviewed: <stamp>
- Sections: <n>
- Findings: <n> (<a> mechanical, <b> judgment)
- Outcomes: <n> pending

## Section 1: <title> (lines <first>-<last>)

Expert: <expert>

### 1.1 <severity>, <kind>

- Quote: "<quote>"
- Issue: <issue>
- Fix: <fix>
- Outcome: pending

## Whole document

Expert: senior editor

### W.1 <severity>, <kind>

- Quote: "<quote>"
- Issue: <issue>
- Fix: <fix>
- Outcome: pending
```
