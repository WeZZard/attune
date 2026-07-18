import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import attune from './attune.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const porting = JSON.parse(
  readFileSync(join(repoRoot, 'porting.json'), 'utf8'),
).pi;

function load() {
  const handlers = {};
  attune({ on: (name, fn) => (handlers[name] = fn) });
  return handlers;
}

test('registers the two lifecycle handlers', () => {
  const handlers = load();
  assert.deepEqual(Object.keys(handlers).sort(), [
    'before_agent_start',
    'session_start',
  ]);
});

test('injects nothing before session_start has loaded the block', async () => {
  const handlers = load();
  assert.equal(
    await handlers.before_agent_start({ systemPrompt: 'BASE' }, {}),
    undefined,
  );
});

test('appends exactly the matrix-selected docs with tokens resolved', async () => {
  const handlers = load();
  await handlers.session_start({}, {});
  const out = await handlers.before_agent_start({ systemPrompt: 'BASE' }, {});
  assert.ok(out.systemPrompt.startsWith('BASE\n\n'));
  for (const doc of porting.guidelines) {
    const heading = readFileSync(
      join(repoRoot, 'references', doc),
      'utf8',
    ).split('\n')[0];
    assert.ok(
      out.systemPrompt.includes(heading),
      `missing heading of ${doc}: ${heading}`,
    );
  }
  assert.doesNotMatch(out.systemPrompt, /\{\{ATTUNE_ROOT\}\}|\{\{ROUTER\}\}/);
});

test('injects nothing beyond the matrix-selected documents', async () => {
  const handlers = load();
  await handlers.session_start({}, {});
  const out = await handlers.before_agent_start({ systemPrompt: 'BASE' }, {});
  assert.doesNotMatch(out.systemPrompt, /Task Dispatch/);
  assert.doesNotMatch(out.systemPrompt, /External Agent Availability/);
});
