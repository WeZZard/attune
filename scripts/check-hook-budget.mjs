#!/usr/bin/env node
// check-hook-budget.mjs — commit gate: prove each SessionStart hook's
// injected context fits the platform's hook output cap on any machine.
//
// The availability report varies by machine (installed agents, path
// lengths), so the check runs the real hooks against a fixture PATH where
// every agent is installed — the longest report shape — and additionally
// requires RESERVE chars of headroom to absorb longer real paths.

import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTEXT_LIMIT } from '../hooks/lib.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOOKS = [
  'session-start-communication.mjs',
  'session-start-external-agents.mjs',
];
const RESERVE = 300;

const bin = mkdtempSync(join(tmpdir(), 'attune-gate-bin-'));
let failed = false;
try {
  for (const agent of ['codex', 'kimi', 'agy', 'cursor-agent', 'grok']) {
    const fake = join(bin, agent);
    writeFileSync(fake, '#!/bin/sh\nexit 0\n');
    chmodSync(fake, 0o755);
  }

  for (const hook of HOOKS) {
    const out = execFileSync(
      process.execPath,
      [join(repoRoot, 'hooks', hook)],
      { encoding: 'utf8', env: { ...process.env, PATH: bin } },
    );
    if (!out) {
      console.error(
        `check-hook-budget: FAIL — ${hook} produced no output (it swallowed an error; run it by hand to see which)`,
      );
      failed = true;
      continue;
    }
    const context = JSON.parse(out).hookSpecificOutput.additionalContext;
    const headroom = CONTEXT_LIMIT - context.length;
    if (context.includes('truncated at the hook output limit')) {
      console.error(
        `check-hook-budget: FAIL — ${hook} exceeds the ${CONTEXT_LIMIT}-char context limit; tighten its reference doc`,
      );
      failed = true;
    } else if (headroom < RESERVE) {
      console.error(
        `check-hook-budget: FAIL — ${hook} has only ${headroom} chars of headroom (< ${RESERVE} reserved for machine-dependent paths); tighten its reference doc`,
      );
      failed = true;
    } else {
      console.log(
        `check-hook-budget: OK — ${hook}: ${context.length}/${CONTEXT_LIMIT} chars, ${headroom} headroom`,
      );
    }
  }
} finally {
  rmSync(bin, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
