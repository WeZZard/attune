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

// Both skills are user-invoked only. Claude Code and Pi read that from
// SKILL.md frontmatter — `disable-model-invocation: true`, honored by
// Claude Code and by pi 0.84.3 (dist/core/skills.js drops such a skill
// from the prompt, leaving only /skill:name). Codex has no frontmatter
// switch for it: its control is `policy.allow_implicit_invocation` in the
// skill's agents/openai.yaml — "When false, the skill is not injected into
// the model context by default, but can still be invoked explicitly via
// $skill" (codex-cli 0.149.1 bundled skill docs) — and its own skill
// validator rejects a `disable-model-invocation` that is not false. So the
// Codex projection TRANSLATES the key rather than copying it: the line
// comes out of the mirrored frontmatter, and the policy file goes in.
const MODEL_INVOCATION_OFF = /^disable-model-invocation:\s*true\s*$/m;

function userInvokedOnly(frontmatter) {
  return MODEL_INVOCATION_OFF.test(frontmatter);
}

const codexPolicy = () =>
  ['policy:', '  allow_implicit_invocation: false', ''].join('\n');

// Mirror a source skill for one platform, splicing its @port blocks —
// skills/*.md is Claude's literal version; the DSL carries the variants.
function mirroredSkill(name, platform) {
  const source = skillSource(name);
  let { frontmatter, body } = splitFrontmatter(read(source), source);
  if (platform === 'codex') {
    frontmatter = frontmatter
      .split('\n')
      .filter((line) => !/^disable-model-invocation:/.test(line))
      .join('\n');
  }
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
// doc. Codex hook commands get neither a plugin-root cwd nor a
// plugin-root variable (verified against codex-cli 0.144.4), hence the
// glob. The two communication documents port; execution-guidelines.md is
// Claude-only and does not. An empty list still generates a valid empty
// wiring, so a doc that stops porting needs only a porting.json edit.
function codexHooksJson(docs) {
  const command = (hook) =>
    `/bin/sh -c 'for f in "\${CODEX_HOME:-$HOME/.codex}"/plugins/cache/*/attune/*/hooks/${hook}; do p="$f"; done; exec "$p" --platform codex'`;
  const wiring = {
    hooks: docs.length
      ? {
          SessionStart: [
            {
              hooks: docs.map((doc) => ({
                type: 'command',
                command: command(HOOK_BY_DOC[doc]),
                timeout: 10,
              })),
            },
          ],
        }
      : {},
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
      const source = skillSource(name);
      if (
        platform === 'codex' &&
        userInvokedOnly(splitFrontmatter(read(source), source).frontmatter)
      ) {
        files.set(`${platform}/skills/${name}/agents/openai.yaml`, codexPolicy());
      }
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
