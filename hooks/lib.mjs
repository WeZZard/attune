// lib.mjs — shared context-injection mechanics for the SessionStart hooks.
// Each hook's output is capped at 10,000 chars by the platform
// (code.claude.com/docs/en/hooks); each injects within CONTEXT_LIMIT to
// leave margin for the JSON envelope.

export const CONTEXT_LIMIT = 9500;

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
