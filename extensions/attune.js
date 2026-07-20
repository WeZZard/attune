// attune.js — Pi extension entry point: inject the guideline documents the
// port matrix (porting.json) selects for Pi, and maintain the
// session-model store the ask-wezzard skill fetches. Mirrors the
// SessionStart hooks on Claude Code and Codex; Pi documents no injection
// cap, so nothing truncates here (re-verify after sizeable growth of
// references/).
//
// Guideline content loads once per session_start (fail-open: on any error
// nothing is injected and the session starts clean); before_agent_start
// appends the block to the chained system prompt, the injection path Pi's
// own claude-rules example uses. The model is read from ctx.model at the
// moment ask-wezzard triggers — never from configuration — because Pi
// selects models per session and can switch mid-session; it goes to the
// store on disk, deliberately not into context.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTUNE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

function porting() {
  return JSON.parse(
    readFileSync(join(ATTUNE_ROOT, 'porting.json'), 'utf8'),
  ).pi;
}

// The authoritative session model, as provider/id (empirically verified
// shape: ctx.model = { id, name, provider, … }). Fail-open to null.
function sessionModel(ctx) {
  const m = ctx?.model;
  if (!m) return null;
  return m.id ? (m.provider ? `${m.provider}/${m.id}` : m.id) : (m.name ?? null);
}

// One store entry per pi process; a session owns its process.
function writeSessionModel(ctx) {
  const model = sessionModel(ctx);
  if (!model) return;
  const dir = join(tmpdir(), 'attune-session-model');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `pi-${process.pid}.json`),
    JSON.stringify({
      model,
      cwd: ctx?.cwd ?? '',
      at: new Date().toISOString(),
    }) + '\n',
  );
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

  // Write the store only when ask-wezzard is triggered: the read that
  // loads its SKILL.md, or the bash fetch that reads the store — the
  // tool_call event fires before execution, so the fetch finds a fresh
  // entry. Never per turn, never at session start.
  pi.on('tool_call', async (event, ctx) => {
    try {
      const call = JSON.stringify({
        tool: event?.toolName ?? '',
        input: event?.input ?? '',
      });
      if (!call.includes('ask-wezzard') && !call.includes('attune-session-model')) return;
      writeSessionModel(ctx);
    } catch {
      // fail-open — the store must never block a tool call
    }
  });
}
