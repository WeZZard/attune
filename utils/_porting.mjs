// _porting.mjs — shared reader for porting.json, the port matrix. Claude
// Code never appears in it: Claude ships the full feature set and is the
// source of truth; the matrix scopes the other platforms' projections.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// Which SessionStart hook injects which reference doc. A new reference
// document means a new hook AND a new entry here.
export const HOOK_BY_DOC = {
  'communication-guidelines.md': 'session-start-communication.mjs',
  'writing-style-guidelines.md': 'session-start-writing.mjs',
};

// Platform-conditional blocks in skill sources. skills/*.md is Claude
// Code's literal, hand-authored version (source of truth), so the DSL is
// inert there: a visible block's markers are comments around plain text
// Claude reads anyway (and must therefore list claude), while another
// platform's variant hides inside a comment Claude never sees (and must
// therefore not list claude). The generator splices per target platform.
//
//   <!-- @port claude -->        visible: ships to the listed platforms
//   ...text...
//   <!-- @end -->
//   <!-- @port codex pi         hidden: ships to the listed platforms
//   ...text...
//   -->
export function projectSkill(text, platform) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const visible = lines[i].match(/^<!-- @port ([a-z ]+) -->$/);
    const hidden = lines[i].match(/^<!-- @port ([a-z ]+)$/);
    if (visible) {
      const platforms = visible[1].trim().split(/\s+/);
      if (!platforms.includes('claude')) {
        throw new Error(
          `@port: visible block "${lines[i]}" must list claude — visible text is Claude's version; hide other platforms' text inside a comment block`,
        );
      }
      const close = lines.indexOf('<!-- @end -->', i + 1);
      if (close === -1) throw new Error(`@port: unterminated visible block "${lines[i]}"`);
      if (platforms.includes(platform)) out.push(...lines.slice(i + 1, close));
      i = close + 1;
    } else if (hidden) {
      const platforms = hidden[1].trim().split(/\s+/);
      if (platforms.includes('claude')) {
        throw new Error(
          `@port: hidden block "${lines[i]}" must not list claude — Claude never sees comment-hidden text; make it a visible block`,
        );
      }
      const close = lines.indexOf('-->', i + 1);
      if (close === -1) throw new Error(`@port: unterminated hidden block "${lines[i]}"`);
      if (platforms.includes(platform)) out.push(...lines.slice(i + 1, close));
      i = close + 1;
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

export function loadPorting() {
  const porting = JSON.parse(
    readFileSync(join(repoRoot, 'porting.json'), 'utf8'),
  );
  for (const [platform, spec] of Object.entries(porting)) {
    if (platform === 'comment') continue;
    for (const doc of spec.guidelines ?? []) {
      if (!HOOK_BY_DOC[doc]) {
        throw new Error(`porting.json: ${platform} lists unknown doc ${doc}`);
      }
    }
  }
  return porting;
}
