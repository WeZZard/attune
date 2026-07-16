#!/usr/bin/env node
// _generate-platform-assets.mjs — generate the Kimi Code and Codex plugin
// trees (kimi/skills/, codex/skills/) from the shared sources:
// references/*.md, skills/*/SKILL.md, and agents/external-agent.md.
// references/ stays the only hand-edited home of the guidelines; the
// generated trees are build products and are never edited directly.
//
// Kimi has no context-injecting hooks, so its guidelines land as one
// sessionStart skill whose body concatenates the injected reference docs.
// Neither platform runs Claude subagents, so the router agent becomes a
// skill on both. explore/experiment mirror the shared skills verbatim.
//
// --check: regenerate in memory and fail listing any committed file that
// differs, is missing, or should no longer exist.

import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => readFileSync(join(repoRoot, ...p), 'utf8');

// Same documents, same order, as the SessionStart hooks inject.
const INJECTED_DOCS = [
  'communication-guidelines.md',
  'external-agents-guidelines.md',
  'verification-guidelines.md',
  'writing-style-guidelines.md',
];

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
  kimi:
    'Resolve `ATTUNE_ROOT` to the absolute path of `${KIMI_SKILL_DIR}/../../..`\n' +
    '(three directories above this skill file) before running any command\n' +
    'quoted below.',
  codex:
    'Resolve `ATTUNE_ROOT` to the absolute path three directories above this\n' +
    'SKILL.md file (the installed plugin root) before running any command\n' +
    'quoted below.',
};

function splitFrontmatter(text, source) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${source}: no frontmatter block`);
  return { frontmatter: m[1], body: text.slice(m[0].length).trim() };
}

function guidelinesSkill() {
  const docs = INJECTED_DOCS.map((doc) =>
    resolveTokens(read('references', doc).trim()),
  );
  return [
    '---',
    'name: guidelines',
    'description: Attune standing guidelines — loaded automatically at session start; not for direct invocation.',
    'disableModelInvocation: true',
    '---',
    '',
    marker('references/*.md'),
    '',
    ROOT_PROLOGUE.kimi,
    '',
    docs.join('\n\n'),
    '',
  ].join('\n');
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

function mirroredSkill(name) {
  const source = `skills/${name}/SKILL.md`;
  const { frontmatter, body } = splitFrontmatter(read(source), source);
  return ['---', frontmatter, '---', '', marker(source), '', body, ''].join(
    '\n',
  );
}

function generate() {
  const files = new Map();
  files.set('kimi/skills/guidelines/SKILL.md', guidelinesSkill());
  for (const platform of ['kimi', 'codex']) {
    files.set(
      `${platform}/skills/external-agent/SKILL.md`,
      routerSkill(platform),
    );
    for (const name of ['explore', 'experiment']) {
      files.set(`${platform}/skills/${name}/SKILL.md`, mirroredSkill(name));
    }
  }
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
  const onDisk = [...walk('kimi'), ...walk('codex')];
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
        `generate-platform-assets: FAIL — ${rel} is not a generated file; the generator owns kimi/ and codex/`,
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
  for (const dir of ['kimi', 'codex']) {
    rmSync(join(repoRoot, dir), { recursive: true, force: true });
  }
  for (const [rel, content] of files) {
    mkdirSync(dirname(join(repoRoot, rel)), { recursive: true });
    writeFileSync(join(repoRoot, rel), content);
    console.log(`generate-platform-assets: wrote ${rel} (${content.length} chars)`);
  }
}

const guidelines = files.get('kimi/skills/guidelines/SKILL.md');
console.log(
  `generate-platform-assets: kimi guidelines skill body is ${guidelines.length} chars (no documented Kimi cap; verify injection end-to-end after sizeable growth)`,
);
process.exit(failed ? 1 : 0);
