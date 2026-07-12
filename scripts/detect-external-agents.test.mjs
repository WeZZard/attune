import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  'detect-external-agents.sh',
);

// Production reality: the script sees whatever PATH the session has. The
// fixture is a controlled PATH, empty or holding a fake binary.
const run = (path, args = []) =>
  execFileSync('/bin/bash', [SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, PATH: path },
  });

test('reports every agent missing on an empty PATH', () => {
  const bin = mkdtempSync(join(tmpdir(), 'attune-bin-'));
  const report = JSON.parse(run(bin));
  for (const key of ['codex', 'kimi', 'agy', 'cursor_agent', 'grok']) {
    assert.equal(report[key].installed, false);
  }
});

test('reports an installed agent with its path', () => {
  const bin = mkdtempSync(join(tmpdir(), 'attune-bin-'));
  const fake = join(bin, 'codex');
  writeFileSync(fake, '#!/bin/sh\nexit 0\n');
  chmodSync(fake, 0o755);
  const report = JSON.parse(run(bin));
  assert.equal(report.codex.installed, true);
  assert.equal(report.codex.path, fake);
  assert.equal(report.grok.installed, false);
});

test('--lines emits one line per agent', () => {
  const bin = mkdtempSync(join(tmpdir(), 'attune-bin-'));
  const lines = run(bin, ['--lines']).trim().split('\n');
  assert.equal(lines.length, 5);
  assert.ok(lines.every((l) => l.endsWith(': missing')));
});
