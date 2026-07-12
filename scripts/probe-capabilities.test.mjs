import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  'probe-capabilities.mjs',
);

// Production reality: the script runs the real capabilities.json against
// whatever CLIs the PATH holds. The fixture is a controlled PATH with fake
// CLIs whose replies exercise the reduction rules.
function fixture(fakes) {
  const bin = mkdtempSync(join(tmpdir(), 'attune-cap-bin-'));
  for (const [name, body] of Object.entries(fakes)) {
    const p = join(bin, name);
    writeFileSync(p, `#!/bin/sh\n${body}\n`);
    chmodSync(p, 0o755);
  }
  return bin;
}

function run(bin, extra = []) {
  const marker = join(mkdtempSync(join(tmpdir(), 'attune-cap-out-')), 'marker.json');
  execFileSync(process.execPath, [SCRIPT, marker, ...extra], {
    encoding: 'utf8',
    env: { ...process.env, PATH: bin },
  });
  return JSON.parse(readFileSync(marker, 'utf8')).flags;
}

test('expect marker present reduces to true; wrong marker reduces to false', () => {
  const bin = fixture({
    kimi: 'echo "PLAYWRIGHT_OK about:blank"',
    codex: 'cat >/dev/null; echo "CUA_OK 1440x900"',
  });
  const flags = run(bin);
  assert.equal(flags.kimi.playwright.ok, true);
  // Same fake reply lacks DEVTOOLS_OK, so the sibling capability fails closed.
  assert.equal(flags.kimi.chrome_devtools.ok, false);
  assert.equal(flags.codex.computer_use.ok, true);
  // Codex is probed for the browser capabilities too; this reply proves neither.
  assert.equal(flags.codex.playwright.ok, false);
  assert.equal(flags.codex.chrome_devtools.ok, false);
});

test('CAPABILITY_MISSING and nonzero exits reduce to false', () => {
  const bin = fixture({
    kimi: 'echo "CAPABILITY_MISSING"',
    codex: 'cat >/dev/null; echo "CUA_OK 1x1"; exit 1',
  });
  const flags = run(bin);
  assert.equal(flags.kimi.playwright.ok, false);
  assert.equal(flags.codex.computer_use.ok, false);
});

test('a missing binary reduces to false with the spawn detail', () => {
  const bin = fixture({ kimi: 'echo "PLAYWRIGHT_OK x"' }); // no codex on PATH
  const flags = run(bin);
  assert.equal(flags.codex.computer_use.ok, false);
  assert.match(flags.codex.computer_use.detail, /codex/);
});

test('--only probes exactly the named flags', () => {
  const bin = fixture({ kimi: 'echo "PLAYWRIGHT_OK x"' });
  const flags = run(bin, ['--only', 'kimi.playwright']);
  assert.deepEqual(Object.keys(flags), ['kimi']);
  assert.deepEqual(Object.keys(flags.kimi), ['playwright']);
});
