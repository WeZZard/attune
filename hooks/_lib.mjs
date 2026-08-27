// _lib.mjs — shared context-injection mechanics for the hooks. Serves two
// hook platforms: Claude Code (hooks/hooks.json) and Codex (the generated
// root hooks.json), and two events: SessionStart, which injects the
// standing guidelines once, and UserPromptSubmit, which repeats the
// plain-language reminder on every turn. The emitted hookEventName MUST
// name the event that fired, or the runtime discards the context. Each
// hook's output is capped at 10,000 chars on Claude Code
// (code.claude.com/docs/en/hooks); each injects within CONTEXT_LIMIT to
// leave margin for the JSON envelope, and Codex inherits the same budget.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CONTEXT_LIMIT = 9500;

// Inject one reference document. Never fails the session: on any error it
// prints nothing and exits 0, so a broken document cannot break startup.
export function emitDoc(hookUrl, doc, event = 'SessionStart') {
  try {
    const pluginRoot = join(dirname(fileURLToPath(hookUrl)), '..');
    emitContext(
      readFileSync(join(pluginRoot, 'references', doc), 'utf8').trim(),
      event,
    );
  } catch {
    // stay silent — broken guidelines must not break session start
  }
}

export function emitContext(context, event = 'SessionStart') {
  const warn =
    '\n\n[attune] WARNING: guidelines truncated at the hook output limit — tighten the reference docs.';
  if (context.length > CONTEXT_LIMIT) {
    context = context.slice(0, CONTEXT_LIMIT - warn.length) + warn;
  }
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: event,
        additionalContext: context,
      },
    }),
  );
}
