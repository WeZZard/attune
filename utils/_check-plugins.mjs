#!/usr/bin/env node
// _check-plugins.mjs — commit gate: prove all three plugin packagings
// (Claude Code, Codex, Pi) stay well-formed and installable.
//
// Layer 1 — structural, always runs, no CLI needed: manifests parse, their
// versions agree, every referenced path exists, hook commands resolve, and
// each SKILL.md carries well-formed frontmatter. Data-driven from the
// manifests, so new skills or renamed dirs need no gate edits.
//
// Layer 2 — official validators, when the CLI is on PATH (a missing CLI
// prints SKIPPED, never a silent pass):
//   claude — `claude plugin validate <root>`.
//   codex  — hermetic install round-trip of the STAGED tree:
//            git checkout-index → temp git repo → file:// catalog →
//            marketplace add + plugin add under a throwaway CODEX_HOME.
//            (The user's marketplace lives in WeZZard/skills; the catalog
//            synthesized here is gate plumbing, never committed.)
//   pi     — hermetic install round-trip of the STAGED tree under a
//            throwaway PI_CODING_AGENT_DIR (local-path install; pi ships
//            no standalone manifest validator), then an RPC-startup load
//            check, which is what actually exercises the extension.

import { execFileSync } from 'node:child_process';
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
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
  pi: 'package.json',
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
const versions = new Set(
  Object.values(manifests).filter(Boolean).map((m) => m.version),
);
if (versions.size > 1) {
  fail(`manifest versions disagree: ${[...versions].join(', ')}`);
} else if (versions.size === 1) {
  ok(`all manifests at version ${[...versions][0]}`);
}

// The pi manifest key: extensions and skills paths must exist, and the
// pi-package keyword keeps the package discoverable on pi.dev/packages.
const piManifest = manifests.pi?.pi;
if (!piManifest) {
  fail('package.json: missing "pi" manifest key');
} else {
  for (const rel of piManifest.extensions ?? []) {
    const clean = rel.replace(/^\.\//, '');
    if (!existsSync(join(repoRoot, clean))) {
      fail(`package.json: pi.extensions entry ${rel} does not exist`);
    }
  }
  if (!(piManifest.extensions ?? []).length) {
    fail('package.json: pi.extensions is empty');
  }
}
if (!(manifests.pi?.keywords ?? []).includes('pi-package')) {
  fail('package.json: keywords must include pi-package');
}

// Skills dirs the manifests point at, plus Claude's conventional skills/.
// Pi's manifest lists an array of dirs; the others a single dir.
const skillDirs = new Map([['claude', ['skills']]]);
{
  const rel = manifests.codex?.skills;
  if (rel) {
    const clean = rel.replace(/^\.\//, '').replace(/\/$/, '');
    if (!existsSync(join(repoRoot, clean))) {
      fail(`${MANIFESTS.codex}: skills dir ${rel} does not exist`);
    } else {
      skillDirs.set('codex', [clean]);
    }
  }
}
{
  const dirs = [];
  for (const rel of piManifest?.skills ?? []) {
    const clean = rel.replace(/^\.\//, '').replace(/\/$/, '');
    if (!existsSync(join(repoRoot, clean))) {
      fail(`package.json: pi.skills dir ${rel} does not exist`);
    } else {
      dirs.push(clean);
    }
  }
  if (dirs.length) skillDirs.set('pi', dirs);
}
// Projection-only skill sources (no Claude runtime surface) live in
// portable-skills/ and get the same frontmatter checks.
if (existsSync(join(repoRoot, 'portable-skills'))) {
  skillDirs.set('portable', ['portable-skills']);
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

const checkedDirs = new Set();
for (const [platform, dirs] of skillDirs) {
  for (const dir of dirs) {
    if (checkedDirs.has(dir)) continue;
    checkedDirs.add(dir);
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
}
ok(`SKILL.md frontmatter checked across ${[...checkedDirs].join(', ')}`);

// Hook commands: Codex root hooks.json runs plugin-root-relative
// executables; Claude hooks/hooks.json runs node on ${CLAUDE_PLUGIN_ROOT}
// paths.
// Codex hook commands are self-locating `sh -c` globs over the installed
// plugin cache — codex 0.144.4 gives a hook command neither a plugin-root
// cwd nor a plugin-root variable (verified empirically; relative commands
// exit 127). The gate checks the hook script each command references.
const codexHooks = readJson('hooks.json');
for (const group of Object.values(codexHooks?.hooks ?? {})) {
  for (const entry of group) {
    for (const hook of entry.hooks ?? []) {
      const m = hook.command.match(/hooks\/([a-z][a-z-]*\.mjs)/);
      if (!m) {
        fail(`hooks.json: no hooks/*.mjs reference in: ${hook.command}`);
        continue;
      }
      const rel = join('hooks', m[1]);
      const abs = join(repoRoot, rel);
      if (!existsSync(abs)) {
        fail(`hooks.json: ${rel} does not exist`);
        continue;
      }
      try {
        accessSync(abs, constants.X_OK);
      } catch {
        fail(`hooks.json: ${rel} is not executable (Codex hook commands exec it directly)`);
      }
      if (!readFileSync(abs, 'utf8').startsWith('#!')) {
        fail(`hooks.json: ${rel} has no shebang`);
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

// Export the staged tree (what this commit ships) into a scratch dir —
// install round-trips against the working tree or HEAD would validate the
// wrong content. Shared by the codex and pi round-trips.
function exportStagedTree(work) {
  const tree = join(work, 'tree');
  mkdirSync(tree);
  execFileSync('git', ['checkout-index', '-a', `--prefix=${tree}/`], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 60000,
  });
  return tree;
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
    // `codex plugin add` git-clones its source, so the staged tree needs
    // to become a throwaway git repo first.
    const tree = exportStagedTree(work);
    const git = (args, cwd) =>
      execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 60000 });
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

if (onPath('pi') && onPath('git')) {
  const work = mkdtempSync(join(tmpdir(), 'attune-pi-gate-'));
  try {
    // Local-path installs are referenced in place, so the exported staged
    // tree is installable directly — no git repo needed.
    const tree = exportStagedTree(work);
    const agentDir = join(work, 'pi-agent-dir');
    mkdirSync(agentDir);
    const env = {
      ...process.env,
      PI_CODING_AGENT_DIR: agentDir,
      PI_OFFLINE: '1',
      PI_SKIP_VERSION_CHECK: '1',
    };
    execFileSync('pi', ['install', tree], {
      encoding: 'utf8',
      timeout: 120000,
      env,
    });
    const settings = JSON.parse(
      readFileSync(join(agentDir, 'settings.json'), 'utf8'),
    );
    // pi stores local-path sources relative to the settings file.
    const sources = (settings.packages ?? [])
      .map((p) => (typeof p === 'string' ? p : p.source))
      .map((p) => {
        try {
          return realpathSync(resolve(agentDir, p));
        } catch {
          return p;
        }
      });
    if (sources.includes(realpathSync(tree))) {
      ok('pi hermetic install round-trip passed (staged tree)');
    } else {
      fail(`pi round-trip: settings.json does not list ${tree}: ${JSON.stringify(sources)}`);
    }

    // Load check: RPC mode is the headless path that actually loads
    // package extensions and prints "Failed to load extension" on error
    // (`pi --list-models` does not load them — verified). RPC mode does
    // not exit on stdin EOF, so the timeout kill is the expected exit.
    let loadOut = '';
    try {
      loadOut = execFileSync('pi', ['--mode', 'rpc', '--no-session'], {
        encoding: 'utf8',
        timeout: 15000,
        env,
        input: '',
      });
    } catch (e) {
      loadOut = `${e.stdout || ''}${e.stderr || ''}`;
    }
    if (/Failed to load extension/i.test(loadOut)) {
      fail(`pi round-trip: extension failed to load:\n${loadOut.slice(0, 500)}`);
    } else {
      ok('pi extension load check passed (rpc startup)');
    }
  } catch (e) {
    fail(`pi round-trip: ${(e.stdout || '') + (e.stderr || e.message)}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
} else {
  console.log('check-plugins: SKIPPED — pi not installed; hermetic install round-trip not run');
}

process.exit(failed ? 1 : 0);
