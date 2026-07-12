#!/usr/bin/env node
// check-hook-budget.mjs — commit gate: prove the SessionStart hook's
// injected context fits the platform's hook output cap on any machine.
//
// The availability report varies by machine (installed agents, path
// lengths), so the check runs the real hook against a fixture PATH where
// every agent is installed — the longest report shape — and additionally
// requires RESERVE chars of headroom to absorb longer real paths.

import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const hookPath = join(repoRoot, 'hooks', 'session-start.mjs');
const RESERVE = 300;

// Single source of truth for the limit is the hook itself.
const limitMatch = readFileSync(hookPath, 'utf8').match(/CONTEXT_LIMIT = (\d+)/);
if (!limitMatch) {
  console.error(
    'check-hook-budget: CONTEXT_LIMIT not found in hooks/session-start.mjs',
  );
  process.exit(1);
}
const limit = Number(limitMatch[1]);

const bin = mkdtempSync(join(tmpdir(), 'attune-gate-bin-'));
try {
  for (const agent of ['codex', 'kimi', 'agy', 'cursor-agent', 'grok']) {
    const fake = join(bin, agent);
    writeFileSync(fake, '#!/bin/sh\nexit 0\n');
    chmodSync(fake, 0o755);
  }

  const out = execFileSync(process.execPath, [hookPath], {
    encoding: 'utf8',
    env: { ...process.env, PATH: bin },
  });
  if (!out) {
    console.error(
      'check-hook-budget: FAIL — hook produced no output (it swallowed an error; run it by hand to see which)',
    );
    process.exit(1);
  }

  const context = JSON.parse(out).hookSpecificOutput.additionalContext;
  const headroom = limit - context.length;
  if (context.includes('truncated at the hook output limit')) {
    console.error(
      `check-hook-budget: FAIL — guidelines exceed the ${limit}-char context limit; tighten references/*.md`,
    );
    process.exit(1);
  }
  if (headroom < RESERVE) {
    console.error(
      `check-hook-budget: FAIL — only ${headroom} chars of headroom (< ${RESERVE} reserved for machine-dependent paths); tighten references/*.md`,
    );
    process.exit(1);
  }
  console.log(
    `check-hook-budget: OK — ${context.length}/${limit} chars, ${headroom} headroom`,
  );
} finally {
  rmSync(bin, { recursive: true, force: true });
}
