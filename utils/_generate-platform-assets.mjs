#!/usr/bin/env node
// _generate-platform-assets.mjs — project the port matrix (porting.json)
// into the platform trees. Claude Code ships the full feature set from the
// hand-authored sources (skills/, hooks/hooks.json) and is the source of
// truth; for each other platform the matrix selects which skills mirror
// and (for Codex) which guideline hooks wire into the generated root
// hooks.json.
//
// Generated build products — never hand-edit: codex/, pi/, hooks.json.
// Edit the sources (skills/, portable-skills/, porting.json) and
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
const marker = (source) =>
  `<!-- GENERATED from ${source} by utils/generate-platform-assets.sh — edit the source, then regenerate. -->`;

function splitFrontmatter(text, source) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${source}: no frontmatter block`);
  return { frontmatter: m[1], body: text.slice(m[0].length).trim() };
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
// doc, plus the session-model store writer at PreToolUse. Codex hook
// commands get neither a plugin-root cwd nor a plugin-root
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
      // The session-model store, written only when ask-wezzard triggers.
      // No matcher: the hook sees every PreToolUse and self-filters to
      // ask-wezzard-related tool calls — the skill invocation, whatever
      // Codex names its skill tool, and the skill's own store-fetch
      // command, which primes the store because PreToolUse fires before
      // the tool executes. A matcher would sever the fetch-command path.
      PreToolUse: [
        {
          hooks: [
            {
              type: 'command',
              command: command('pre-tool-use-session-model.mjs'),
              timeout: 10,
            },
          ],
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
      // Mirror the skill's sibling files (references/, etc.) verbatim, so
      // progressive-disclosure playbooks travel with the skill to every
      // platform. Only SKILL.md carries @port splicing; the rest are copies.
      const home = dirname(skillSource(name));
      for (const rel of walk(home)) {
        if (rel === join(home, 'SKILL.md')) continue;
        files.set(`${platform}/skills/${name}/${rel.slice(home.length + 1)}`, read(rel));
      }
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
  // the Kimi packaging was dropped in 0.5.0.
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
