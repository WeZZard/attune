#!/usr/bin/env node
// record-ruling.mjs — validate one ruling object and append it to a store.
//
// Usage: node record-ruling.mjs '<one JSON object>' [store-path]
// Default store is the user store; pass the project store path
// (<project>/.claude/attune/rulings.jsonl) for a project-scoped ruling.

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import { dirname } from 'node:path';
import { parseStore, userStorePath } from './generate-sheet.mjs';

const REQUIRED = ['id', 'date', 'ruling', 'oracle', 'scope', 'status'];
const STATUSES = ['active', 'superseded', 'retired'];

export function validate(row) {
  const errors = [];
  for (const field of REQUIRED) {
    if (!(field in row)) errors.push(`missing field: ${field}`);
  }
  if ('oracle' in row && !Array.isArray(row.oracle)) {
    errors.push('oracle must be an array of provenance marks');
  }
  if ('scope' in row && !Array.isArray(row.scope)) {
    errors.push('scope must be an array of axis values');
  }
  if ('status' in row && !STATUSES.includes(row.status)) {
    errors.push(`invalid status: ${row.status}`);
  }
  if ('id' in row && !/^[a-z0-9][a-z0-9-]*$/.test(row.id)) {
    errors.push('id must be kebab-case');
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const row = JSON.parse(process.argv[2]);
  const storePath = process.argv[3] ?? userStorePath();
  const errors = validate(row);
  if (row.supersedes && existsSync(storePath)) {
    const ids = new Set(
      parseStore(readFileSync(storePath, 'utf8')).map((r) => r.id),
    );
    if (!ids.has(row.supersedes)) {
      errors.push(`supersedes unknown id: ${row.supersedes}`);
    }
  }
  if (errors.length > 0) {
    process.stderr.write(errors.join('\n') + '\n');
    process.exit(1);
  }
  mkdirSync(dirname(storePath), { recursive: true });
  appendFileSync(storePath, JSON.stringify(row) + '\n');
  process.stdout.write(`recorded ${row.id}\n`);
}
