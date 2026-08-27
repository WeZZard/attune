// Pi is the one platform whose injection is code rather than a hook the
// runtime wires, so it is the one that has to be exercised.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import attune from './attune.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const ported = JSON.parse(
  readFileSync(join(repoRoot, 'porting.json'), 'utf8'),
).pi.guidelines;

function load() {
  const handlers = {};
  attune({ on: (name, fn) => (handlers[name] = fn) });
  return handlers;
}

test('registers the two lifecycle handlers and nothing else', () => {
  assert.deepEqual(Object.keys(load()).sort(), [
    'before_agent_start',
    'session_start',
  ]);
});

test('injects nothing before session_start', async () => {
  const handlers = load();
  assert.equal(
    await handlers.before_agent_start({ systemPrompt: 'BASE' }),
    undefined,
  );
});

test('every ported document reaches the system prompt', async () => {
  const handlers = load();
  await handlers.session_start();
  const { systemPrompt } = await handlers.before_agent_start({
    systemPrompt: 'BASE',
  });
  assert.ok(ported.length, 'porting.json lists no pi guidelines');
  for (const doc of ported) {
    const text = readFileSync(join(repoRoot, 'references', doc), 'utf8').trim();
    assert.ok(systemPrompt.includes(text), `${doc} is not in the injected block`);
  }
});

test('the block chains onto the existing system prompt, never replaces it', async () => {
  const handlers = load();
  await handlers.session_start();
  const { systemPrompt } = await handlers.before_agent_start({
    systemPrompt: 'KEEP ME',
  });
  assert.ok(systemPrompt.startsWith('KEEP ME'));
});
