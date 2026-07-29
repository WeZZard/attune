# CLAUDE.md

## Domain boundary

Attune holds human-ruled subjective knowledge only: operational rulings
on how the agent executes and delegates work (subagent model selection is
the first — Claude-only, since its model names are Claude's). It is
fully disjoint from every other knowledge system (retrospect, project
docs, Claude Code auto memory) — no shared vocabulary, no cross-routing.
World facts and measured lessons are never recorded here.

The standing communication and output-style guidelines that lived here
through 0.12.0 — `references/communication-*.md`, their fourteen
SessionStart hooks, the pi extension that injected them, the `ask-wezzard`
feedback skill, and the session-model store that stamped its issues —
moved to the sibling [additive](https://github.com/WeZZard/additive)
plugin 2026-07-30, because they govern documents additive already owns
the lifecycle of. Nothing here reads additive, and nothing there reads
this.

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

`references/execution-guidelines.md` is the one document left here. It is
Claude-only (wired directly in `hooks/hooks.json`) and carries no
`porting.json` listing.

## Multi-platform packaging

One repo ships three plugins; `references/*.md` stays the single hand-edited
source. Three manifests coexist: `.claude-plugin/plugin.json` (Claude Code),
`.codex-plugin/plugin.json` (Codex — its `hooks` pointer to the root
`hooks.json` is REQUIRED: without it Codex would auto-discover
`hooks/hooks.json`, which is Claude's), and `package.json` (Pi — the `pi`
key lists `skills`; the `pi-package` keyword is Pi's gallery flag; attune
ships no pi extension). The gate enforces one version across all three;
bump them together.

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
Experiment and definition-of-done ship one text everywhere: their external
widening is conditional on the dispatch plugin's presence, which is never
true off Claude Code.

**Generated trees.** `codex/`, `pi/`, and the root `hooks.json` are build
products of `utils/generate-platform-assets.sh` — never hand-edit them; edit
the sources (`skills/`, `portable-skills/`, `porting.json`) and regenerate.
The pre-commit gate fails on stale, missing, or foreign files there (and on
any resurrected `kimi/` file). Matrix-selected skills mirror into
`<platform>/skills/`, sourced from `skills/` or `portable-skills/` (exactly
one home per skill). A skill mirrors as its whole directory: SKILL.md
carries the `@port` splice, and every sibling file (e.g.
definition-of-done's `references/use-paths/*.md` playbooks) is copied
verbatim so progressive-disclosure references travel with the skill to
every platform — verified that Codex, Pi, and Claude Code all load
skill-local `references/` files. A new reference document means a new hook
plus a `HOOK_BY_DOC` entry in `utils/_porting.mjs`, and — when the doc
ships beyond Claude Code — per-platform `porting.json` listings, never a
bigger hook. `execution-guidelines.md` takes the hook and the `HOOK_BY_DOC`
entry but no `porting.json` listing, which is why the generated root
`hooks.json` is `{"hooks":{}}` today — nothing is ported to Codex.

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
Hooks span 11 events (per codex-rs `hooks/src/schema.rs`, commit
56395bdd) including per-prompt `UserPromptSubmit`; every event's stdin
payload carries `model` (exact id), `session_id`, `transcript_path`, and
`cwd`; `additionalContext` injection works only at SessionStart,
SubagentStart, and UserPromptSubmit — PreToolUse outputs permission
decisions alone, so just-in-time injection at a tool call is impossible.
There is no model-change event. Codex plugins can also ship MCP servers
(manifest `mcpServers` → a Claude-style `.mcp.json`) — unused by attune.
Skills are namespaced `attune:*`. Codex also installs Claude-format plugins
(falls back to `.claude-plugin/plugin.json`), which is why the native
manifest must stay present and correct.

**Pi facts (verified against pi 0.80.10).** Extensions are TS/JS
default-export factories loaded by jiti; `before_agent_start` returns a
chained `systemPrompt` (the injection path — no documented cap; re-verify
after sizeable growth), which is how a Pi extension would inject context
if attune shipped one — it does not today. `pi install`
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

## The dispatch plugin

External-agent delegation left attune in 0.9.0 for the sibling
WeZZard/dispatch plugin (Claude Code only): the external-agent router, the
agent registry and probe scripts, and the use-external-agents, audit, and
image-generation skills. Attune references dispatch only
presence-conditionally — experiment widens its producers and judges
through dispatch's skills when they are installed, and definition-of-done
routes independent re-checks through dispatch's `audit` skill when
present; both degrade to self-run variants otherwise. Attune never
assumes dispatch exists, and dispatch works without attune.

## Command naming convention

Every public command is a shell script; when the implementation is
JavaScript, the wrapper just `exec`s node on it. JavaScript not exposed as a
command carries an underscore prefix (`_*.mjs`) — wrappers are the stable
surface, underscored internals may be reshaped freely. Hook entry points are wired in `hooks.json`, never typed by users, and
follow one event-prefixed convention — `hooks/<event>-<function>.mjs`,
e.g. `session-start-execution.mjs` (SessionStart) — with no shell
wrappers: their caller is generated in lockstep, so there is no typed
surface to stabilize. Shared internals are underscored (`hooks/_lib.mjs`). Placement: `utils/` holds development tooling (the
commit gate); attune ships no runtime commands — they moved to dispatch.

## Open items

- If the definition-of-done skill does not move the model's behavior,
  escalate to a Stop hook that checks for unverified claims before the turn
  ends. The skill is named `definition-of-done` (the moment, not the
  activity): it fires when the agent is about to call work done, the
  trigger point an activity-noun like `verification` matches worst; and it
  leaves Claude Code's built-in `verify` skill (the procedure) unshadowed —
  never ship a competing duplicate. It carries a growing store of
  per-domain use-path playbooks under `references/use-paths/`; a domain no
  playbook covers is driven best-effort and leaves a drafted playbook for
  the user to fold in (source growth, git-tracked — never a runtime write).
