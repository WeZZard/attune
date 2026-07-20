import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
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
  return { handlers };
}

test('registers the three lifecycle handlers and no tools', () => {
  const { handlers } = load();
  assert.deepEqual(Object.keys(handlers).sort(), [
    'before_agent_start',
    'session_start',
    'tool_call',
  ]);
});

test('an ask-wezzard-related tool call writes the store entry', async () => {
  const { handlers } = load();
  const file = join(tmpdir(), 'attune-session-model', `pi-${process.pid}.json`);
  const ctx = { model: { id: 'grok-4.5', provider: 'xai' }, cwd: '/fake/project' };
  for (const event of [
    { toolName: 'read', input: { path: '/x/skills/ask-wezzard/SKILL.md' } },
    { toolName: 'bash', input: { command: 'ls /tmp/attune-session-model/' } },
  ]) {
    rmSync(file, { force: true });
    await handlers.tool_call(event, ctx);
    const entry = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(entry.model, 'xai/grok-4.5');
    assert.equal(entry.cwd, '/fake/project');
  }
  rmSync(file, { force: true });
});

test('unrelated tool calls and turns write nothing', async () => {
  const { handlers } = load();
  const file = join(tmpdir(), 'attune-session-model', `pi-${process.pid}.json`);
  rmSync(file, { force: true });
  const ctx = { model: { id: 'grok-4.5', provider: 'xai' }, cwd: '/fake/project' };
  await handlers.tool_call({ toolName: 'bash', input: { command: 'ls' } }, ctx);
  await handlers.before_agent_start({ systemPrompt: 'BASE' }, ctx);
  assert.throws(() => readFileSync(file));
});

test('injects nothing before session_start, absent a model', async () => {
  const { handlers } = load();
  assert.equal(
    await handlers.before_agent_start({ systemPrompt: 'BASE' }, {}),
    undefined,
  );
});

test('appends exactly the matrix-selected docs with tokens resolved', async () => {
  const { handlers } = load();
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
  const { handlers } = load();
  await handlers.session_start({}, {});
  const out = await handlers.before_agent_start({ systemPrompt: 'BASE' }, {});
  assert.doesNotMatch(out.systemPrompt, /Task Dispatch/);
  assert.doesNotMatch(out.systemPrompt, /External Agent Availability/);
});
