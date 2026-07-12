#!/usr/bin/env node
// _detect-external-agents.mjs — internal implementation of
// `external-agents.sh installed`: free PATH detection of the agents named in
// capabilities.json (the agent registry). No probes, no cost, no side
// effects — safe to run at every session start.

import { accessSync, constants, readFileSync, statSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { agents } = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'capabilities.json'),
    'utf8',
  ),
);

function find(name) {
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    if (!dir) continue;
    const p = join(dir, name);
    try {
      accessSync(p, constants.X_OK);
      if (statSync(p).isFile()) return p;
    } catch {
      // not here — keep walking PATH
    }
  }
  return null;
}

const names = Object.keys(agents);
if (process.argv[2] === '--lines') {
  for (const name of names) {
    const p = find(name);
    console.log(p ? `- ${name}: installed (${p})` : `- ${name}: missing`);
  }
} else {
  const report = {};
  for (const name of names) {
    const p = find(name);
    report[name] = p ? { installed: true, path: p } : { installed: false };
  }
  console.log(JSON.stringify(report));
}
