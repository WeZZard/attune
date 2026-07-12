#!/usr/bin/env node
// probe-capabilities.mjs — behavioral probe of tool-dependent external agent
// capabilities (MCP-armed strengths like browser use and computer use).
// Reads capabilities.json, fans the probes out in parallel (one meaningful
// paid prompt per agent×capability), reduces the results to flags, and
// writes the marker atomically.
//
// Usage: probe-capabilities.mjs <marker-output-path> [--only agent.capability ...]
//
// Flag reduction, fail-closed: ok = CLI exit 0 AND the output contains the
// capability's `expect` marker AND does not contain CAPABILITY_MISSING.
// A missing binary, timeout, nonzero exit, or simulated reply all reduce to
// false, with the failure detail kept for the human.

import { execFile } from 'node:child_process';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROBE_TIMEOUT_MS = 180000;

const args = process.argv.slice(2);
const marker = args[0];
if (!marker || marker.startsWith('--')) {
  console.error(
    'usage: probe-capabilities.mjs <marker-output-path> [--only agent.capability ...]',
  );
  process.exit(64);
}
const only = [];
for (let i = 1; i < args.length; i++) {
  if (args[i] === '--only' && args[i + 1]) only.push(args[++i]);
}

const config = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'capabilities.json'),
    'utf8',
  ),
);

function probeOne(spec, prompt) {
  const argv = spec.invocation.map((a) => (a === '{prompt}' ? prompt : a));
  return new Promise((resolve) => {
    const child = execFile(
      argv[0],
      argv.slice(1),
      { encoding: 'utf8', timeout: PROBE_TIMEOUT_MS },
      (err, stdout = '', stderr = '') => {
        resolve({ err, out: `${stdout}\n${stderr}` });
      },
    );
    child.stdin.on('error', () => {});
    if (spec.prompt_via === 'stdin') child.stdin.write(prompt);
    child.stdin.end();
  });
}

const jobs = [];
for (const [agent, spec] of Object.entries(config)) {
  for (const [capability, cap] of Object.entries(spec.capabilities)) {
    const flag = `${agent}.${capability}`;
    if (only.length > 0 && !only.includes(flag)) continue;
    jobs.push(
      probeOne(spec, cap.prompt).then(({ err, out }) => {
        const ok =
          !err && out.includes(cap.expect) && !out.includes('CAPABILITY_MISSING');
        const lastLine = out.trim().split('\n').filter(Boolean).at(-1) ?? '';
        const detail = (err ? err.message.split('\n')[0] : lastLine).slice(0, 200);
        return { agent, capability, ok, detail };
      }),
    );
  }
}

const results = await Promise.all(jobs);
const flags = {};
for (const r of results) {
  (flags[r.agent] ??= {})[r.capability] = { ok: r.ok, detail: r.detail };
  console.log(`${r.agent}.${r.capability}: ${r.ok}${r.ok ? '' : ` (${r.detail})`}`);
}

const tmp = `${marker}.tmp-${process.pid}`;
writeFileSync(
  tmp,
  JSON.stringify({ probed_at: new Date().toISOString(), flags }, null, 2) + '\n',
);
renameSync(tmp, marker);
