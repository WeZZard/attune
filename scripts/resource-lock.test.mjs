import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'resource-lock.sh');

// Production reality: locks live under the user's TMPDIR, shared by every
// session of that user. The fixture gives each test its own TMPDIR so tests
// neither see each other's locks nor a real session's.
function run(tmp, args, expectFail = false) {
  try {
    return {
      out: execFileSync('/bin/bash', [SCRIPT, ...args], {
        encoding: 'utf8',
        env: { ...process.env, TMPDIR: tmp },
      }).trim(),
      code: 0,
    };
  } catch (err) {
    if (!expectFail) throw err;
    return { out: (err.stdout ?? '').trim(), code: err.status };
  }
}

test('acquire yields a token; a second acquire is busy (75)', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'attune-lock-'));
  const { out: token } = run(tmp, ['acquire', 'desktop']);
  assert.ok(token.length > 0);
  const busy = run(tmp, ['acquire', 'desktop'], true);
  assert.equal(busy.code, 75);
});

test('release requires the matching token (73 on mismatch)', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'attune-lock-'));
  const { out: token } = run(tmp, ['acquire', 'desktop']);
  const wrong = run(tmp, ['release', 'desktop', 'not-the-token'], true);
  assert.equal(wrong.code, 73);
  run(tmp, ['release', 'desktop', token]);
  const again = run(tmp, ['acquire', 'desktop']);
  assert.ok(again.out.length > 0);
});

test('an expired lease is reclaimed by the next acquirer', async () => {
  const tmp = mkdtempSync(join(tmpdir(), 'attune-lock-'));
  run(tmp, ['acquire', 'desktop', '--ttl', '1']);
  await new Promise((r) => setTimeout(r, 2100));
  const reclaimed = run(tmp, ['acquire', 'desktop']);
  assert.ok(reclaimed.out.length > 0);
});

test('releasing an unheld lock is a no-op; status reports holdings', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'attune-lock-'));
  run(tmp, ['release', 'desktop', 'whatever']);
  assert.equal(run(tmp, ['status']).out, '(no locks held)');
  run(tmp, ['acquire', 'browser-profile']);
  assert.match(run(tmp, ['status']).out, /browser-profile: held/);
});
