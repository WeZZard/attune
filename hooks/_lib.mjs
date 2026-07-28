// _lib.mjs — shared context-injection mechanics for the SessionStart hooks.
// Serves two hook platforms: Claude Code (hooks/hooks.json) and Codex (the
// generated root hooks.json). Each hook's output is capped at 10,000 chars
// on Claude Code (code.claude.com/docs/en/hooks); each injects within
// CONTEXT_LIMIT to leave margin for the JSON envelope, and Codex inherits
// the same budget.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CONTEXT_LIMIT = 9500;

// Inject one reference document. Never fails the session: on any error it
// prints nothing and exits 0, so a broken document cannot break startup.
export function emitDoc(hookUrl, doc) {
  try {
    const pluginRoot = join(dirname(fileURLToPath(hookUrl)), '..');
    emitContext(readFileSync(join(pluginRoot, 'references', doc), 'utf8').trim());
  } catch {
    // stay silent — broken guidelines must not break session start
  }
}

export function emitContext(context) {
  const warn =
    '\n\n[attune] WARNING: guidelines truncated at the hook output limit — tighten the reference docs.';
  if (context.length > CONTEXT_LIMIT) {
    context = context.slice(0, CONTEXT_LIMIT - warn.length) + warn;
  }
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: context,
      },
    }),
  );
}
