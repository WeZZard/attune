// attune.js — Pi extension entry point: inject the guideline documents the
// port matrix (porting.json) selects for Pi. Pi has no hook mechanism, so
// this is Pi's counterpart to the SessionStart hooks Claude Code and Codex
// run — same documents, same list, read from the same matrix.
//
// Content loads once per session_start (fail-open: on any error nothing is
// injected and the session starts clean); before_agent_start appends the
// block to the chained system prompt, the injection path Pi's own
// claude-rules example uses. Pi documents no injection cap, so nothing
// truncates here — re-verify after sizeable growth of references/.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTUNE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

function portedDocs() {
  return (
    JSON.parse(readFileSync(join(ATTUNE_ROOT, 'porting.json'), 'utf8')).pi
      ?.guidelines ?? []
  );
}

export default function attune(pi) {
  let block = '';

  pi.on('session_start', async () => {
    try {
      block = portedDocs()
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
