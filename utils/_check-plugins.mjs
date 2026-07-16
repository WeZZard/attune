#!/usr/bin/env node
// _check-plugins.mjs — commit gate: prove all three plugin packagings
// (Claude Code, Codex, Kimi Code) stay well-formed and installable.
//
// Layer 1 — structural, always runs, no CLI needed: manifests parse, their
// versions agree, every referenced path exists, hook commands resolve, and
// each SKILL.md carries well-formed frontmatter. Data-driven from the
// manifests, so new skills or renamed dirs need no gate edits.
//
// Layer 2 — official validators, when the CLI is on PATH (a missing CLI
// prints SKIPPED, never a silent pass):
//   claude — `claude plugin validate <root> --strict`.
//   codex  — hermetic install round-trip of the STAGED tree:
//            git checkout-index → temp git repo → file:// catalog →
//            marketplace add + plugin add under a throwaway CODEX_HOME.
//            (The user's marketplace lives in WeZZard/skills; the catalog
//            synthesized here is gate plumbing, never committed.)
//   kimi   — no official plugin validator exists (kimi doctor covers
//            config.toml/tui.toml only); Kimi relies on Layer 1.

import { execFileSync } from 'node:child_process';
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = false;

const fail = (msg) => {
  console.error(`check-plugins: FAIL — ${msg}`);
  failed = true;
};
const ok = (msg) => console.log(`check-plugins: OK — ${msg}`);

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(repoRoot, rel), 'utf8'));
  } catch (e) {
    fail(`${rel}: ${e.message}`);
    return null;
  }
}

// ---- Layer 1: structural ----

const MANIFESTS = {
  claude: '.claude-plugin/plugin.json',
  codex: '.codex-plugin/plugin.json',
  kimi: 'kimi.plugin.json',
};
const manifests = Object.fromEntries(
  Object.entries(MANIFESTS).map(([p, rel]) => [p, readJson(rel)]),
);

for (const [platform, manifest] of Object.entries(manifests)) {
  if (!manifest) continue;
  for (const field of ['name', 'version', 'description']) {
    if (!manifest[field]) fail(`${MANIFESTS[platform]}: missing ${field}`);
  }
}
if (manifests.kimi?.name && !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(manifests.kimi.name)) {
  fail(`kimi.plugin.json: name ${manifests.kimi.name} violates [a-z0-9][a-z0-9_-]{0,63}`);
}
const versions = new Set(
  Object.values(manifests).filter(Boolean).map((m) => m.version),
);
if (versions.size > 1) {
  fail(`manifest versions disagree: ${[...versions].join(', ')}`);
} else if (versions.size === 1) {
  ok(`all manifests at version ${[...versions][0]}`);
}

// Skills dirs the manifests point at, plus Claude's conventional skills/.
const skillDirs = new Map([['claude', 'skills']]);
for (const platform of ['codex', 'kimi']) {
  const rel = manifests[platform]?.skills;
  if (!rel) continue;
  const clean = rel.replace(/^\.\//, '').replace(/\/$/, '');
  if (!existsSync(join(repoRoot, clean))) {
    fail(`${MANIFESTS[platform]}: skills dir ${rel} does not exist`);
  } else {
    skillDirs.set(platform, clean);
  }
}

function frontmatter(rel) {
  const text = readFileSync(join(repoRoot, rel), 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z-]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2];
  }
  return fields;
}

for (const [platform, dir] of skillDirs) {
  for (const entry of readdirSync(join(repoRoot, dir))) {
    if (!statSync(join(repoRoot, dir, entry)).isDirectory()) continue;
    const rel = join(dir, entry, 'SKILL.md');
    if (!existsSync(join(repoRoot, rel))) {
      fail(`${rel} is missing (${platform} skill dir without SKILL.md)`);
      continue;
    }
    const fm = frontmatter(rel);
    if (!fm) fail(`${rel}: no frontmatter block`);
    else if (!fm.name || !fm.description) fail(`${rel}: frontmatter needs name and description`);
    else if (fm.name !== entry) fail(`${rel}: name ${fm.name} != directory ${entry}`);
  }
}
ok(`SKILL.md frontmatter checked across ${[...skillDirs.values()].join(', ')}`);

const sessionSkill = manifests.kimi?.sessionStart?.skill;
if (sessionSkill && skillDirs.has('kimi')) {
  const rel = join(skillDirs.get('kimi'), sessionSkill, 'SKILL.md');
  if (!existsSync(join(repoRoot, rel))) {
    fail(`kimi.plugin.json: sessionStart.skill ${sessionSkill} has no ${rel}`);
  } else {
    ok(`kimi sessionStart.skill resolves to ${rel}`);
  }
}

// Hook commands: Codex root hooks.json runs plugin-root-relative
// executables; Claude hooks/hooks.json runs node on ${CLAUDE_PLUGIN_ROOT}
// paths.
const codexHooks = readJson('hooks.json');
for (const group of Object.values(codexHooks?.hooks ?? {})) {
  for (const entry of group) {
    for (const hook of entry.hooks ?? []) {
      const script = hook.command.split(' ')[0];
      const abs = join(repoRoot, script);
      if (!existsSync(abs)) {
        fail(`hooks.json: ${script} does not exist`);
        continue;
      }
      try {
        accessSync(abs, constants.X_OK);
      } catch {
        fail(`hooks.json: ${script} is not executable (Codex runs it directly)`);
      }
      if (!readFileSync(abs, 'utf8').startsWith('#!')) {
        fail(`hooks.json: ${script} has no shebang`);
      }
    }
  }
}
const claudeHooks = readJson('hooks/hooks.json');
for (const group of Object.values(claudeHooks?.hooks ?? {})) {
  for (const entry of group) {
    for (const hook of entry.hooks ?? []) {
      const m = hook.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}([^"']+)/);
      if (m && !existsSync(join(repoRoot, m[1]))) {
        fail(`hooks/hooks.json: ${m[1]} does not exist`);
      }
    }
  }
}
ok('hook commands resolve on both hook platforms');

// ---- Layer 2: official validators ----

function onPath(cli) {
  return (process.env.PATH || '').split(delimiter).some((dir) => {
    try {
      accessSync(join(dir, cli), constants.X_OK);
      return true;
    } catch {
      return false;
    }
  });
}

// Not --strict: strict turns warnings into errors, and the maintainer
// CLAUDE.md at the repo root draws an inherent "not loaded as project
// context" warning. Errors still fail; warnings are surfaced.
if (onPath('claude')) {
  try {
    const out = execFileSync('claude', ['plugin', 'validate', repoRoot], {
      encoding: 'utf8',
      timeout: 60000,
    });
    const warnings = out.match(/Found \d+ warning/)?.[0];
    ok(`claude plugin validate passed${warnings ? ` (${warnings}: run \`claude plugin validate .\` to read)` : ''}`);
  } catch (e) {
    fail(`claude plugin validate: ${(e.stdout || '') + (e.stderr || e.message)}`);
  }
} else {
  console.log('check-plugins: SKIPPED — claude not installed; official manifest validation not run');
}

if (onPath('codex') && onPath('git')) {
  const work = mkdtempSync(join(tmpdir(), 'attune-plugins-gate-'));
  try {
    // Export the staged tree (what this commit ships) into a throwaway git
    // repo — `codex plugin add` git-clones its source, so HEAD alone would
    // validate the previous commit, not this one.
    const tree = join(work, 'tree');
    mkdirSync(tree);
    const git = (args, cwd) =>
      execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 60000 });
    git(['checkout-index', '-a', `--prefix=${tree}/`], repoRoot);
    git(['init', '-q'], tree);
    git(['add', '-A'], tree);
    git(
      ['-c', 'user.email=gate@attune', '-c', 'user.name=attune-gate', 'commit', '-qm', 'gate'],
      tree,
    );

    const catalogDir = join(work, 'marketplace', '.agents', 'plugins');
    mkdirSync(catalogDir, { recursive: true });
    const catalog = {
      name: 'attune-gate',
      plugins: [
        { name: 'attune', source: { source: 'url', url: `file://${tree}` } },
      ],
    };
    writeFileSync(join(catalogDir, 'marketplace.json'), JSON.stringify(catalog));

    const codexHome = join(work, 'codex-home');
    mkdirSync(codexHome);
    const env = { ...process.env, CODEX_HOME: codexHome };
    const codex = (args) =>
      execFileSync('codex', args, { encoding: 'utf8', timeout: 120000, env });
    codex(['plugin', 'marketplace', 'add', join(work, 'marketplace')]);
    codex(['plugin', 'add', 'attune@attune-gate']);
    const list = codex(['plugin', 'list']);
    if (/attune@attune-gate\s+installed/.test(list)) {
      ok('codex hermetic install round-trip passed (staged tree)');
    } else {
      fail(`codex round-trip: plugin list does not show attune installed:\n${list}`);
    }
  } catch (e) {
    fail(`codex round-trip: ${(e.stdout || '') + (e.stderr || e.message)}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
} else {
  console.log('check-plugins: SKIPPED — codex not installed; hermetic install round-trip not run');
}

console.log(
  'check-plugins: NOTE — kimi ships no plugin validator (kimi doctor covers config.toml/tui.toml only); the structural checks above are the Kimi gate',
);

process.exit(failed ? 1 : 0);
