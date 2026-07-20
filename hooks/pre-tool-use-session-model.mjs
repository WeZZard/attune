#!/usr/bin/env node
// PreToolUse hook (Codex) — persist this session's model to the
// session-model store at the moment the ask-wezzard skill is triggered,
// and only then. The stdin payload carries the exact model, session id,
// and cwd on every event (verified against codex-rs/hooks/src/schema.rs,
// commit 56395bdd); PreToolUse cannot inject context, but writing a file
// needs no injection.
//
// The write fires when the tool call concerns ask-wezzard — the skill
// invocation itself, or the skill's store-fetch command — never per
// prompt, never at session start. Prints nothing; never fails the tool
// call: on any error it exits 0 silently.

import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(raw);
    if (!payload.model || !payload.session_id) return;
    const call = JSON.stringify({
      tool: payload.tool_name ?? '',
      input: payload.tool_input ?? '',
    });
    if (!call.includes('ask-wezzard') && !call.includes('attune-session-model')) return;
    const dir = join(tmpdir(), 'attune-session-model');
    mkdirSync(dir, { recursive: true });
    const name = String(payload.session_id).replace(/[^\w.-]/g, '_');
    writeFileSync(
      join(dir, `codex-${name}.json`),
      JSON.stringify({
        model: payload.model,
        cwd: payload.cwd ?? '',
        session_id: payload.session_id,
        at: new Date().toISOString(),
      }) + '\n',
    );
  } catch {
    // fail-open — a malformed payload must not break the tool call
  }
});
