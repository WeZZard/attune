#!/usr/bin/env node
// generate-sheet.mjs — distill the attune ruling store into the session
// preference sheet. Pure functions plus a small CLI; the SessionStart hook
// imports the functions.
//
// Store semantics (also documented in schemas/ruling.schema.json):
// the store is append-only JSONL. A later row with the same `id` replaces
// the earlier row; a row whose `supersedes` names an id retires that id.

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, basename } from 'node:path';

// Hook output is hard-capped at 10,000 chars (code.claude.com/docs/en/hooks);
// past the cap Claude receives a file preview instead of the sheet.
export const SHEET_BUDGET = 8000;

export function parseStore(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
}

export function selectActive(rulings) {
  const superseded = new Set(
    rulings.flatMap((r) => (r.supersedes ? [r.supersedes] : [])),
  );
  const byId = new Map();
  for (const r of rulings) byId.set(r.id, r);
  return [...byId.values()].filter(
    (r) => r.status === 'active' && !superseded.has(r.id),
  );
}

export function selectForProject(rulings, projectSlug) {
  return rulings.filter((r) =>
    (r.scope ?? ['global']).some(
      (s) =>
        s === 'global' ||
        s.startsWith('medium:') ||
        s === `project:${projectSlug}`,
    ),
  );
}

export function renderSheet(rulings, budget = SHEET_BUDGET) {
  const head = [
    '# Attune Preference Sheet',
    '',
    'Human-ruled preferences and output-style rulings. Each ruling applies',
    'within its scope; `medium:<m>` applies only when producing that medium.',
    '',
  ].join('\n');
  const warn =
    '\n\nWARNING: sheet truncated at budget — run the attune:consolidate skill.';
  let sheet = head;
  let included = 0;
  for (const r of rulings) {
    const scope = (r.scope ?? ['global']).join(', ');
    const oracle = (r.oracle ?? []).join('; ');
    const block = `\n## ${r.id} (${scope})\n${r.ruling}\n— ${oracle}, ${r.date}\n`;
    if (sheet.length + block.length + warn.length > budget) {
      return { sheet: sheet + warn, truncated: true, included };
    }
    sheet += block;
    included += 1;
  }
  return { sheet, truncated: false, included };
}

export function attuneHome() {
  return process.env.ATTUNE_HOME ?? join(homedir(), '.claude', 'attune');
}

export function userStorePath() {
  return join(attuneHome(), 'store', 'rulings.jsonl');
}

// User store first, project store second: on an id collision the project
// row is later, so it wins.
export function loadAllRulings(projectDir) {
  const paths = [userStorePath()];
  if (projectDir) {
    paths.push(join(projectDir, '.claude', 'attune', 'rulings.jsonl'));
  }
  return paths.flatMap((p) =>
    existsSync(p) ? parseStore(readFileSync(p, 'utf8')) : [],
  );
}

export function generate(projectDir) {
  const slug = projectDir ? basename(projectDir) : '';
  const rulings = selectForProject(selectActive(loadAllRulings(projectDir)), slug);
  return renderSheet(rulings);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const projectDir = process.argv[2] ?? process.cwd();
  const { sheet, truncated, included } = generate(projectDir);
  process.stdout.write(sheet + '\n');
  process.stderr.write(
    `${included} rulings, ${sheet.length} chars${truncated ? ' (TRUNCATED)' : ''}\n`,
  );
}
