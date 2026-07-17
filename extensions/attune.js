// attune.js — Pi extension entry point: inject the guideline documents the
// port matrix (porting.json) selects for Pi, plus the external-agent
// availability report when the external-agents doc is among them. Mirrors
// the SessionStart hooks on Claude Code and Codex; Pi documents no
// injection cap, so nothing truncates here (re-verify after sizeable
// growth of references/).
//
// Content loads once per session_start (fail-open: on any error nothing is
// injected and the session starts clean); before_agent_start appends the
// block to the chained system prompt, the injection path Pi's own
// claude-rules example uses.

import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ATTUNE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const AVAILABILITY_DOC = 'external-agents-guidelines.md';

function porting() {
  return JSON.parse(
    readFileSync(join(ATTUNE_ROOT, 'porting.json'), 'utf8'),
  ).pi;
}

// Resolve the delivery-time tokens the reference docs carry:
// {{ATTUNE_ROOT}} — the absolute package root; {{ROUTER}} — this
// platform's handle for the external-agent router (honestly Claude-only
// when the port matrix does not ship the router skill here).
const resolveTokens = (text, spec) =>
  text
    .replaceAll('{{ATTUNE_ROOT}}', ATTUNE_ROOT)
    .replaceAll(
      '{{ROUTER}}',
      spec.router
        ? 'the `external-agent` skill'
        : 'the `attune:external-agent` router (Claude Code only)',
    );

const availabilityReport = () =>
  new Promise((resolve) => {
    execFile(
      '/bin/bash',
      [
        join(ATTUNE_ROOT, 'scripts', 'external-agents.sh'),
        'installed',
        '--lines',
      ],
      { encoding: 'utf8', timeout: 5000 },
      (error, stdout) => resolve(error ? '' : stdout.trim()),
    );
  });

export default function attune(pi) {
  let block = '';

  pi.on('session_start', async () => {
    try {
      const spec = porting();
      const sections = (spec.guidelines ?? []).map((doc) =>
        resolveTokens(
          readFileSync(join(ATTUNE_ROOT, 'references', doc), 'utf8').trim(),
          spec,
        ),
      );
      if ((spec.guidelines ?? []).includes(AVAILABILITY_DOC)) {
        const availability = await availabilityReport();
        if (availability) {
          sections.push(
            [
              '## External Agent Availability (detected at session start)',
              '',
              'Installed means the binary is on PATH — not that login, network, and',
              'model work. Usability is probed behaviorally on demand (see the',
              'external agents guidelines above).',
              '',
              availability,
            ].join('\n'),
          );
        }
      }
      block = sections.join('\n\n');
    } catch {
      block = '';
    }
  });

  pi.on('before_agent_start', async (event) => {
    if (!block) return;
    return { systemPrompt: `${event.systemPrompt}\n\n${block}` };
  });
}
