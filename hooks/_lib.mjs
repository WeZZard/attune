// _lib.mjs — shared context-injection mechanics for the SessionStart hooks.
// Serves two hook platforms: Claude Code (hooks/hooks.json) and Codex (root
// hooks.json), selected by a --platform argv flag (default claude). Each
// hook's output is capped at 10,000 chars on Claude Code
// (code.claude.com/docs/en/hooks); each injects within CONTEXT_LIMIT to
// leave margin for the JSON envelope, and Codex inherits the same budget.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CONTEXT_LIMIT = 9500;

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const ROUTER_BY_PLATFORM = {
  claude: 'attune:external-agent',
  codex: 'the `external-agent` skill',
  kimi: 'the `external-agent` skill',
};

export function platform() {
  const i = process.argv.indexOf('--platform');
  const name = i !== -1 ? process.argv[i + 1] : 'claude';
  return ROUTER_BY_PLATFORM[name] ? name : 'claude';
}

// Resolve the delivery-time tokens the reference docs carry:
// {{ATTUNE_ROOT}} — the absolute plugin root; {{ROUTER}} — the platform's
// handle for the external-agent router.
export function resolveTokens(context) {
  return context
    .replaceAll('{{ATTUNE_ROOT}}', PLUGIN_ROOT)
    .replaceAll('{{ROUTER}}', ROUTER_BY_PLATFORM[platform()]);
}

export function emitContext(context) {
  context = resolveTokens(context);
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
