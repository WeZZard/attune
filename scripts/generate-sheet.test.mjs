import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadAllRulings,
  parseStore,
  renderSheet,
  selectActive,
  selectForProject,
} from './generate-sheet.mjs';
import { validate } from './record-ruling.mjs';

const row = (over = {}) => ({
  id: 'r-one',
  date: '2026-07-12',
  ruling: 'Prefer X.',
  oracle: ['human ruled'],
  scope: ['global'],
  status: 'active',
  ...over,
});

test('parseStore skips blank and malformed lines', () => {
  const rows = parseStore('\n{"id":"a"}\nnot json\n{"id":"b"}\n');
  assert.deepEqual(rows.map((r) => r.id), ['a', 'b']);
});

test('selectActive: later row with the same id wins', () => {
  const active = selectActive([row({ ruling: 'old' }), row({ ruling: 'new' })]);
  assert.equal(active.length, 1);
  assert.equal(active[0].ruling, 'new');
});

test('selectActive: supersedes retires the referenced id', () => {
  const rows = [row(), row({ id: 'r-two', supersedes: 'r-one' })];
  assert.deepEqual(selectActive(rows).map((r) => r.id), ['r-two']);
});

test('selectActive: non-active status drops the ruling', () => {
  assert.deepEqual(selectActive([row({ status: 'retired' })]), []);
});

test('selectForProject keeps global, medium, and matching project scopes', () => {
  const rows = [
    row({ id: 'g', scope: ['global'] }),
    row({ id: 'm', scope: ['medium:blog'] }),
    row({ id: 'p-yes', scope: ['project:attune'] }),
    row({ id: 'p-no', scope: ['project:other'] }),
  ];
  assert.deepEqual(
    selectForProject(rows, 'attune').map((r) => r.id),
    ['g', 'm', 'p-yes'],
  );
});

test('renderSheet truncates at budget, stays under it, and flags it', () => {
  const rows = Array.from({ length: 50 }, (_, i) =>
    row({ id: `r-${i}`, ruling: 'x'.repeat(200) }),
  );
  const { sheet, truncated } = renderSheet(rows, 2000);
  assert.equal(truncated, true);
  assert.ok(sheet.length <= 2000);
  assert.match(sheet, /truncated at budget/);
});

test('renderSheet fits small stores untruncated', () => {
  const { truncated, included } = renderSheet([row()], 8000);
  assert.equal(truncated, false);
  assert.equal(included, 1);
});

// Production keeps the user store under the attune home and the project
// store under the project directory — two owners, two places. The fixture
// preserves that boundary.
test('loadAllRulings reads user and project stores; project rows come later', () => {
  const home = mkdtempSync(join(tmpdir(), 'attune-home-'));
  const project = mkdtempSync(join(tmpdir(), 'attune-project-'));
  mkdirSync(join(home, 'store'), { recursive: true });
  mkdirSync(join(project, '.claude', 'attune'), { recursive: true });
  writeFileSync(
    join(home, 'store', 'rulings.jsonl'),
    JSON.stringify(row({ id: 'user-row' })) + '\n',
  );
  writeFileSync(
    join(project, '.claude', 'attune', 'rulings.jsonl'),
    JSON.stringify(row({ id: 'project-row' })) + '\n',
  );
  process.env.ATTUNE_HOME = home;
  try {
    assert.deepEqual(
      loadAllRulings(project).map((r) => r.id),
      ['user-row', 'project-row'],
    );
  } finally {
    delete process.env.ATTUNE_HOME;
  }
});

test('validate flags missing fields, bad status, and bad ids', () => {
  assert.equal(validate(row()).length, 0);
  assert.ok(validate({}).length >= 6);
  assert.ok(validate(row({ status: 'maybe' })).some((e) => e.includes('status')));
  assert.ok(validate(row({ id: 'Bad_Id' })).some((e) => e.includes('kebab')));
});
