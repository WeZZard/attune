# CLAUDE.md

## Domain boundary

Attune holds human-ruled subjective knowledge only: communication and
output-style guidelines. It is fully disjoint
from every other knowledge system (retrospect, project docs, Claude Code auto
memory) — no shared vocabulary, no cross-routing. World facts and measured
lessons are never recorded here.

## Source of truth: the Claude Code plugin source

The hand-authored Claude Code plugin source IS the plugin: `references/`,
`skills/` and `portable-skills/` (Claude's literal text — `@port` blocks
stay inert comments there), `hooks/hooks.json`, and the hook scripts. Everything
every other platform receives is a projection of that source: `porting.json`
selects, the generator projects (`codex/`, `pi/`, the root `hooks.json`),
and the runtime consumers read the matrix. Maintenance therefore always
edits the Claude source and regenerates — never a generated tree, never a
platform copy, never a platform-specific fork of content that has a Claude
home. Even a feature with no Claude runtime surface keeps its source in
the Claude-side tree: a skill Claude itself never runs sources from
`portable-skills/<name>/` (Claude Code auto-discovers `skills/`, so
`skills/` holds exactly what Claude runs — nothing more).

## The guidelines are the product

`references/*.md` is what the plugin exists to deliver: the user's standing
rulings, injected at session start. They change solely by the user's explicit
editorial decision — an ordinary edit the user makes or directs, outside any
attune skill — and git history is the review trail. When the user does fold
research- or experiment-informed rules in, inline provenance marks
(`(per <source>)`, `(per experiment <name>)`) carry the evidence.

`references/communication-guidelines.md` was seeded from amplify's
`references/communication-style-guidelines.md` and diverges as the user
maintains it — it is NOT vendored-frozen.

**Guidelines authoring style:** principles are numbered
**MUST:** / **MUST NOT:** lists ("1. You **MUST** …"). Each principle
carries one idea — decompose a compound rule into separate numbered items.
Factual material — contract templates, category tables, findings, command
blocks — stays structural; only the rules take the list form.

## Multi-platform packaging

One repo ships three plugins; `references/*.md` stays the single hand-edited
source. Three manifests coexist: `.claude-plugin/plugin.json` (Claude Code),
`.codex-plugin/plugin.json` (Codex — its `hooks` pointer to the root
`hooks.json` is REQUIRED: without it Codex would auto-discover
`hooks/hooks.json`, which is Claude's), and `package.json` (Pi — the `pi`
key lists `extensions` and `skills`; the `pi-package` keyword is Pi's
gallery flag). The gate enforces one version across all three; bump them
together.

**Port matrix.** `porting.json` is the single control for what ships
where: per platform, which reference docs inject and which skills ship.
Claude Code never appears in it — it ships every feature with a Claude
surface and its source tree is the source of truth; the other platforms
are projections. The keystone skill inverts the direction:
it compensates for sub-frontier models that miss a plan's load-bearing
decision, so it ships to Pi only — Claude Code and Codex run
frontier-class models and do not carry it. Re-porting any of this is a
`porting.json` edit plus regeneration, not a code change.

**Skill variants (@port DSL).** A source skill that needs per-platform text
carries `@port` blocks, spliced by the generator (`projectSkill` in
`utils/_porting.mjs`). `skills/*.md` stays Claude Code's literal version,
so the DSL is inert there: a visible block (`<!-- @port claude -->` …
`<!-- @end -->`) is plain text Claude reads anyway and must list `claude`;
another platform's variant hides inside a comment block
(`<!-- @port codex pi` … `-->`) Claude never sees and must not list
`claude` — the parser enforces both. This is how explore ports to Codex
and Pi in a variant that runs its research without background subagents.
Experiment and verification ship one text everywhere: their external
widening is conditional on the dispatch plugin's presence, which is never
true off Claude Code.

**Generated trees.** `codex/`, `pi/`, and the root `hooks.json` are build
products of `utils/generate-platform-assets.sh` — never hand-edit them;
edit the sources (`skills/`, `portable-skills/`, `porting.json`) and
regenerate. The pre-commit gate fails on stale, missing, or foreign
files there (and on any resurrected `kimi/` file). Matrix-selected skills
mirror into `<platform>/skills/`, sourced from `skills/` or
`portable-skills/` (exactly one home per skill). A new reference document means a new hook plus a
`HOOK_BY_DOC` entry in `utils/_porting.mjs` and per-platform `porting.json`
listings — never a bigger hook. Runtime consumers read the matrix too:
`extensions/attune.js` injects Pi's selected docs.

**Codex facts (verified against codex-cli 0.144.4).** Codex has native
subagents (TOML files in `~/.codex/agents/`, GA 2026-03-16), but a plugin
cannot ship them — the plugin manifest has no `agents` key — and tool-backed
sessions cannot spawn named custom agents (openai/codex#15250); hence
router-as-skill. Hook commands run with
neither a plugin-root cwd nor any plugin-root variable — a plugin-relative
command exits 127 — so the root `hooks.json` commands are self-locating
`sh -c` globs over `${CODEX_HOME:-$HOME/.codex}/plugins/cache/*/attune/*/`.
Non-managed hooks require one-time user trust (startup dialog or `/hooks`,
`t`), stored as definition hashes under `[hooks.state]` in
`~/.codex/config.toml` — any change to a hook definition re-triggers review.
SessionStart hooks fire on the first turn of a session, in `codex exec` too.
Skills are namespaced `attune:*`. Codex also installs Claude-format plugins
(falls back to `.claude-plugin/plugin.json`), which is why the native
manifest must stay present and correct.

**Pi facts (verified against pi 0.80.10).** Extensions are TS/JS
default-export factories loaded by jiti; `before_agent_start` returns a
chained `systemPrompt` (the injection path — no documented cap; re-verify
after sizeable growth) and `session_start` is where the extension reads
`references/` and runs the availability probe, fail-open. `pi install`
accepts a GitHub URL (full git clone into `~/.pi/agent/git/<host>/<path>`,
`npm install` run when package.json exists) or a local path (referenced in
place, stored relative to the settings file). Skills follow the same Agent
Skills standard as Claude Code (SKILL.md frontmatter), mirrored per the
port matrix. RPC mode (`pi --mode rpc`) is the headless path that actually
loads package extensions and reports load errors at startup
(`pi --list-models` does not) — the gate's load check relies on that.

**Kimi Code (dropped in 0.5.0).** kimi-code (verified 0.26.0)
offers no plugin- or user-defined subagents and no context-injecting
session-start hook (`sessionStart.skill` injects skill text only; its lone
injecting hook, `UserPromptSubmit`, fires per prompt), and installs GitHub
plugins from zipballs. Kimi models stay reachable through Pi's `kimi-coding`
provider. `kimi/`, `kimi.plugin.json`, and the guidelines-concatenation
generator path were removed with the 0.5.0 bump.

**Distribution.** `wezzard/skills` is the unique marketplace
for every coding agent: the Claude catalog lives there today and the Codex
catalog (`.agents/plugins/marketplace.json`) is filed as a handoff in that
repo — attune itself carries no marketplace catalog. Pi installs straight
from the GitHub URL (`pi install https://github.com/WeZZard/attune`).

## Commit gates

`.githooks/pre-commit` (enable per clone with `git config core.hooksPath
.githooks`) runs, besides syntax and unit tests:

- `utils/generate-platform-assets.sh --check` — staleness of the generated
  trees and the generated root `hooks.json`, all projected from
  `porting.json`.
- `utils/check-hook-budget.sh` — per-hook injection budget, for
  `--platform claude` and `codex` both (see "Injection budget").
- `utils/check-plugins.sh` — the three-packaging gate: structural checks
  (manifest schemas, version equality, referenced paths, SKILL.md
  frontmatter, hook-command targets), then official validators when the CLI
  is on PATH: `claude plugin validate` (not `--strict`: the maintainer
  CLAUDE.md draws an inherent warning), a hermetic Codex install
  round-trip of the STAGED tree (checkout-index → temp git repo → `file://`
  catalog → throwaway `CODEX_HOME`), and a hermetic Pi round-trip (throwaway
  `PI_CODING_AGENT_DIR`: local-path install of the staged tree, then an
  RPC-startup extension load check). A missing CLI prints SKIPPED, never a
  silent pass.

## Injection budget

Hook output is capped at 10,000 characters per command
(code.claude.com/docs/en/hooks). Injection is split into one hook per
guidelines document (`hooks/session-start-*.mjs`) so each document has its
own cap. All truncate past 9,500 characters (`CONTEXT_LIMIT` in
`hooks/_lib.mjs`, the single source of truth) with a visible warning. The pre-commit gate
(`utils/check-hook-budget.sh`, wired through `.githooks/pre-commit`;
enable per clone with `git config core.hooksPath .githooks`) fails any commit
that would truncate: it runs each real hook and requires 300 characters of
headroom for machine-dependent variation. Two documents inject today
(communication, writing style); a new reference document means a new
hook, not a bigger one.

## The dispatch plugin

External-agent delegation left attune in 0.9.0 for the sibling
WeZZard/dispatch plugin (Claude Code only): the external-agent router, the
agent registry and probe scripts, and the use-external-agents, audit, and
image-generation skills. Attune references dispatch only
presence-conditionally — experiment widens its producers and judges
through dispatch's skills when they are installed, and verification
routes independent re-checks through dispatch's `audit` skill when
present; both degrade to self-run variants otherwise. Attune never
assumes dispatch exists, and dispatch works without attune.

## Command naming convention

Every public command is a shell script; when the implementation is
JavaScript, the wrapper just `exec`s node on it. JavaScript not exposed as a
command carries an underscore prefix (`_*.mjs`) — wrappers are the stable
surface, underscored internals may be reshaped freely. Hook entry points
(`hooks/session-start-*.mjs`) are wired in `hooks.json`, not typed by users,
and keep plain names; their shared internals are underscored
(`hooks/_lib.mjs`). Placement: `utils/` holds development tooling (the
commit gate); attune ships no runtime commands — they moved to dispatch.

## Open items

- If the verification skill does not move the model's behavior, escalate
  to a Stop hook that checks for unverified claims before the turn ends.
  The skill is named `verification` (the standard) deliberately: Claude
  Code's built-in `verify` skill (the procedure) stays unshadowed — never
  ship a competing duplicate.
- Amplify injects the same communication guidelines at SessionStart; once
  attune is installed alongside it, that injection is redundant and should be
  retired from amplify.
