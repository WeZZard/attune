import test from 'node:test';
import assert from 'node:assert/strict';
import { HOOK_BY_DOC, loadPorting, projectSkill } from './_porting.mjs';

const SOURCE = [
  'shared head',
  '<!-- @port claude -->',
  'claude text',
  '<!-- @end -->',
  '<!-- @port codex pi',
  'variant text',
  '-->',
  'shared tail',
].join('\n');

test('visible block ships to claude, hidden block does not', () => {
  const out = projectSkill(SOURCE, 'claude');
  assert.match(out, /claude text/);
  assert.doesNotMatch(out, /variant text/);
  assert.doesNotMatch(out, /@port|@end|-->/);
});

test('hidden block ships to its platforms, visible block does not', () => {
  for (const platform of ['codex', 'pi']) {
    const out = projectSkill(SOURCE, platform);
    assert.doesNotMatch(out, /claude text/);
    assert.match(out, /variant text/);
    assert.doesNotMatch(out, /@port|@end|-->/);
  }
  assert.equal(
    projectSkill(SOURCE, 'codex'),
    ['shared head', 'variant text', 'shared tail'].join('\n'),
  );
});

test('visible block may list extra platforms alongside claude', () => {
  const source = ['<!-- @port claude codex -->', 'both', '<!-- @end -->'].join(
    '\n',
  );
  assert.match(projectSkill(source, 'codex'), /both/);
  assert.doesNotMatch(projectSkill(source, 'pi'), /both/);
});

test('a visible block without claude is rejected', () => {
  const source = ['<!-- @port codex -->', 'x', '<!-- @end -->'].join('\n');
  assert.throws(() => projectSkill(source, 'codex'), /must list claude/);
});

test('a hidden block listing claude is rejected', () => {
  const source = ['<!-- @port claude pi', 'x', '-->'].join('\n');
  assert.throws(() => projectSkill(source, 'pi'), /must not list claude/);
});

test('unterminated blocks are rejected', () => {
  assert.throws(
    () => projectSkill('<!-- @port claude -->\nx', 'claude'),
    /unterminated/,
  );
  assert.throws(
    () => projectSkill('<!-- @port pi\nx', 'pi'),
    /unterminated/,
  );
});

test('port matrix parses and only lists known docs', () => {
  const porting = loadPorting();
  for (const [platform, spec] of Object.entries(porting)) {
    if (platform === 'comment') continue;
    for (const doc of spec.guidelines ?? []) {
      assert.ok(HOOK_BY_DOC[doc], `${platform}: unknown doc ${doc}`);
    }
  }
});
