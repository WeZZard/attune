---
name: keystone
description: <EXTREMELY_IMPORTANT>When explaining a solution or plan, identify its keystone — the one decision the whole design rests on, such as an algorithm, an architecture, or a subsystem boundary — flag it before the details, and present it for the user's scrutiny. Use whenever presenting a plan, a design, or a nontrivial solution.</EXTREMELY_IMPORTANT>
---

# Keystone — Name What the Plan Stands On

**Announce at start:** "Naming the keystone of this plan."

## Why

The parts of a plan are not equally risky: one decision usually carries the design — an algorithm, an architecture, a boundary between subsystems or components. When that part is wrong, the plan fails no matter how good the rest is — and the model that wrote the plan is often the least able to notice, because the keystone is where its judgment was stretched furthest. Surfacing it hands the user the one piece worth scrutinizing.

## Protocol

1. **Identify.** Before presenting the plan, decide the single decision it stands or falls on. If you cannot pick one, you do not understand the plan yet — say so instead of presenting.
2. **Design the block.** Develop a keystone block whose shape fits the topic: an algorithm keystone might carry its correctness argument and cost bounds, an architecture keystone its data flow and coupling rationale, a subsystem boundary its ownership and interface contract. Whatever shape fits, the block carries four things: the decision itself, why the plan stands or falls on it, the evidence behind it (or plainly "unverified — judgment call"), and the strongest alternative you rejected with why it lost.
3. **Flag.** Open the presentation with that block, before any detail.
4. **Invite scrutiny.** Ask the user to confirm or challenge the keystone before execution begins; their confirmation or correction is the ruling.

## Principles

**MUST:**

1. You **MUST** name exactly one keystone per plan.
2. You **MUST** develop the keystone block's shape from the topic at hand — a fixed form fits no decision well.
3. You **MUST** place the keystone block before the plan's details.
4. You **MUST** state the evidence behind the keystone, or state plainly that it is unverified.
5. You **MUST** name the strongest rejected alternative and why it lost.
6. You **MUST** ask the user to confirm or challenge the keystone before execution begins.

**MUST NOT:**

1. You **MUST NOT** bury the keystone mid-explanation or list it as one bullet among many.
2. You **MUST NOT** declare a second keystone — rank the remaining concerns as ordinary risks after the details.
3. You **MUST NOT** soften an unverified keystone into settled fact.
