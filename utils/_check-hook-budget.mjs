#!/usr/bin/env node
// _check-hook-budget.mjs — commit gate: prove each SessionStart hook's
// injected context fits the platform's hook output cap on any machine,
// with RESERVE chars of headroom for machine-dependent variation.

import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTEXT_LIMIT } from '../hooks/_lib.mjs';
import { HOOK_BY_DOC, loadPorting } from './_porting.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Claude Code always runs every hook (source of truth); Codex runs the
// subset the port matrix wires into the generated root hooks.json.
const HOOKS_BY_PLATFORM = {
  claude: Object.values(HOOK_BY_DOC),
  codex: (loadPorting().codex?.guidelines ?? []).map((doc) => HOOK_BY_DOC[doc]),
};
const RESERVE = 300;

let failed = false;
for (const [platform, hooks] of Object.entries(HOOKS_BY_PLATFORM)) {
  for (const hook of hooks) {
    const out = execFileSync(
      process.execPath,
      [join(repoRoot, 'hooks', hook), '--platform', platform],
      { encoding: 'utf8' },
    );
    if (!out) {
      console.error(
        `check-hook-budget: FAIL — ${hook} [${platform}] produced no output (it swallowed an error; run it by hand to see which)`,
      );
      failed = true;
      continue;
    }
    const context = JSON.parse(out).hookSpecificOutput.additionalContext;
    const headroom = CONTEXT_LIMIT - context.length;
    if (context.includes('truncated at the hook output limit')) {
      console.error(
        `check-hook-budget: FAIL — ${hook} [${platform}] exceeds the ${CONTEXT_LIMIT}-char context limit; tighten its reference doc`,
      );
      failed = true;
    } else if (headroom < RESERVE) {
      console.error(
        `check-hook-budget: FAIL — ${hook} [${platform}] has only ${headroom} chars of headroom (< ${RESERVE} reserved for machine-dependent paths); tighten its reference doc`,
      );
      failed = true;
    } else {
      console.log(
        `check-hook-budget: OK — ${hook} [${platform}]: ${context.length}/${CONTEXT_LIMIT} chars, ${headroom} headroom`,
      );
    }
  }
}
process.exit(failed ? 1 : 0);
