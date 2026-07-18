// attune.js — Pi extension entry point: inject the guideline documents the
// port matrix (porting.json) selects for Pi. Mirrors the SessionStart hooks
// on Claude Code and Codex; Pi documents no injection cap, so nothing
// truncates here (re-verify after sizeable growth of references/).
//
// Content loads once per session_start (fail-open: on any error nothing is
// injected and the session starts clean); before_agent_start appends the
// block to the chained system prompt, the injection path Pi's own
// claude-rules example uses.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTUNE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

function porting() {
  return JSON.parse(
    readFileSync(join(ATTUNE_ROOT, 'porting.json'), 'utf8'),
  ).pi;
}

export default function attune(pi) {
  let block = '';

  pi.on('session_start', async () => {
    try {
      const spec = porting();
      block = (spec.guidelines ?? [])
        .map((doc) =>
          readFileSync(join(ATTUNE_ROOT, 'references', doc), 'utf8').trim(),
        )
        .join('\n\n');
    } catch {
      block = '';
    }
  });

  pi.on('before_agent_start', async (event) => {
    if (!block) return;
    return { systemPrompt: `${event.systemPrompt}\n\n${block}` };
  });
}
