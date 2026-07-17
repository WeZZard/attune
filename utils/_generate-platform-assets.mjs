#!/usr/bin/env node
// _generate-platform-assets.mjs — project the port matrix (porting.json)
// into the platform trees. Claude Code ships the full feature set from the
// hand-authored sources (skills/, agents/, hooks/hooks.json) and is the
// source of truth; for each other platform the matrix selects which skills
// mirror, whether the router ports, and (for Codex) which guideline hooks
// wire into the generated root hooks.json.
//
// Generated build products — never hand-edit: codex/, pi/, hooks.json.
// Edit the sources (skills/, agents/external-agent.md, porting.json) and
// regenerate.
//
// --check: regenerate in memory and fail listing any committed file that
// differs, is missing, or should no longer exist.

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOOK_BY_DOC, loadPorting, projectSkill } from './_porting.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(repoRoot, ...p), 'utf8');

const PLATFORMS = ['codex', 'pi'];
const ROUTER_HANDLE = 'the `external-agent` skill';

const marker = (source) =>
  `<!-- GENERATED from ${source} by utils/generate-platform-assets.sh — edit the source, then regenerate. -->`;

// Resolve the delivery-time tokens the reference docs carry, for platforms
// where the router is a skill and the plugin root is named by the prologue.
const resolveTokens = (text) =>
  text
    .replaceAll('{{ATTUNE_ROOT}}', '$ATTUNE_ROOT')
    .replaceAll('{{ROUTER}}', ROUTER_HANDLE);

const ROOT_PROLOGUE = {
  codex:
    'Resolve `ATTUNE_ROOT` to the absolute path three directories above this\n' +
    'SKILL.md file (the installed plugin root) before running any command\n' +
    'quoted below.',
  pi:
    'Resolve `ATTUNE_ROOT` to the absolute path three directories above this\n' +
    'SKILL.md file (the installed package root) before running any command\n' +
    'quoted below.',
};

function splitFrontmatter(text, source) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${source}: no frontmatter block`);
  return { frontmatter: m[1], body: text.slice(m[0].length).trim() };
}

function routerSkill(platform) {
  const source = 'agents/external-agent.md';
  const { body } = splitFrontmatter(read(source), source);
  const description =
    'Dispatch one task brief to the best-fit external agent CLIs, per the ' +
    'external agents guidelines. Input is a markdown task brief (## Metadata ' +
    'with GOAL/TAGS/AGENTS/CAPABILITIES_MARKER, the task prompt in ' +
    'EXTERNAL_AGENT_TASK_PROMPT tags, ## Response with the report shape). ' +
    'The router probes all agent facts in one matrix call, selects by task ' +
    'category, verifies CLI flags against live --help, launches headless ' +
    'runs, and reports as the brief specifies. It performs no synthesis and ' +
    'no judgment.';
  return [
    '---',
    'name: external-agent',
    `description: ${description}`,
    '---',
    '',
    marker(source),
    '',
    ROOT_PROLOGUE[platform],
    '',
    resolveTokens(body.replaceAll('${CLAUDE_PLUGIN_ROOT}', '$ATTUNE_ROOT')),
    '',
  ].join('\n');
}

// A ported skill's source lives in skills/ (Claude's literal set) or, when
// it has no Claude runtime surface, in portable-skills/ — never both.
function skillSource(name) {
  const homes = ['skills', 'portable-skills'].filter((home) =>
    existsSync(join(repoRoot, home, name, 'SKILL.md')),
  );
  if (homes.length !== 1) {
    throw new Error(
      homes.length
        ? `${name}: SKILL.md in both skills/ and portable-skills/ — a skill has exactly one source home`
        : `${name}: no SKILL.md in skills/ or portable-skills/`,
    );
  }
  return `${homes[0]}/${name}/SKILL.md`;
}

// Mirror a source skill for one platform, splicing its @port blocks —
// skills/*.md is Claude's literal version; the DSL carries the variants.
function mirroredSkill(name, platform) {
  const source = skillSource(name);
  const { frontmatter, body } = splitFrontmatter(read(source), source);
  return [
    '---',
    frontmatter,
    '---',
    '',
    marker(source),
    '',
    projectSkill(body, platform),
    '',
  ].join('\n');
}

// The Codex hook wiring: one self-locating command per ported guideline
// doc. Codex hook commands get neither a plugin-root cwd nor a plugin-root
// variable (verified against codex-cli 0.144.4), hence the glob.
function codexHooksJson(docs) {
  const command = (hook) =>
    `/bin/sh -c 'for f in "\${CODEX_HOME:-$HOME/.codex}"/plugins/cache/*/attune/*/hooks/${hook}; do p="$f"; done; exec "$p" --platform codex'`;
  const wiring = {
    hooks: {
      SessionStart: [
        {
          hooks: docs.map((doc) => ({
            type: 'command',
            command: command(HOOK_BY_DOC[doc]),
            timeout: 10,
          })),
        },
      ],
    },
  };
  return `${JSON.stringify(wiring, null, 2)}\n`;
}

function generate() {
  const porting = loadPorting();
  const files = new Map();
  for (const platform of PLATFORMS) {
    const spec = porting[platform] ?? {};
    for (const name of spec.skills ?? []) {
      files.set(
        `${platform}/skills/${name}/SKILL.md`,
        mirroredSkill(name, platform),
      );
    }
    if (spec.router) {
      files.set(
        `${platform}/skills/external-agent/SKILL.md`,
        routerSkill(platform),
      );
    }
  }
  files.set('hooks.json', codexHooksJson(porting.codex?.guidelines ?? []));
  return files;
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(join(repoRoot, dir));
  } catch {
    return out;
  }
  for (const entry of entries) {
    const rel = join(dir, entry);
    if (statSync(join(repoRoot, rel)).isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

const files = generate();
const checking = process.argv.includes('--check');
let failed = false;

if (checking) {
  // kimi/ stays in the walk so a resurrected Kimi tree fails the gate:
  // the Kimi packaging was dropped in 0.5.0 (human ruled).
  const onDisk = PLATFORMS.concat('kimi').flatMap((dir) => walk(dir));
  for (const [rel, content] of files) {
    let disk = null;
    try {
      disk = read(rel);
    } catch {}
    if (disk === null) {
      console.error(`generate-platform-assets: FAIL — ${rel} is missing`);
      failed = true;
    } else if (disk !== content) {
      console.error(`generate-platform-assets: FAIL — ${rel} is stale`);
      failed = true;
    }
  }
  for (const rel of onDisk) {
    if (!files.has(rel)) {
      console.error(
        `generate-platform-assets: FAIL — ${rel} is not a generated file; the generator owns the platform trees`,
      );
      failed = true;
    }
  }
  if (failed) {
    console.error(
      'generate-platform-assets: run `sh utils/generate-platform-assets.sh` and commit the result',
    );
  } else {
    console.log(
      `generate-platform-assets: OK — ${files.size} generated files match`,
    );
  }
} else {
  for (const dir of PLATFORMS) {
    rmSync(join(repoRoot, dir), { recursive: true, force: true });
  }
  for (const [rel, content] of files) {
    mkdirSync(dirname(join(repoRoot, rel)), { recursive: true });
    writeFileSync(join(repoRoot, rel), content);
    console.log(`generate-platform-assets: wrote ${rel} (${content.length} chars)`);
  }
}

process.exit(failed ? 1 : 0);
