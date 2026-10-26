import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHints, parseHint } from '../src/content.ts';

const example =
  '---\ntitle: A reminder\ntopics: [Setup, Play, Setup]\n---\nSome **text**.';
test('reads metadata, preserves Markdown, and deduplicates topics', () => {
  assert.deepEqual(parseHint('example.md', example), {
    id: 'example',
    title: 'A reminder',
    topics: ['Setup', 'Play'],
    body: 'Some **text**.',
    order: 100,
  });
});
test('rejects invalid content with an actionable filename', () => {
  for (const source of [
    'text',
    example.replace('A reminder', '""'),
    example.replace('[Setup, Play, Setup]', '[]'),
    example.replace('Some **text**.', ''),
    example.replace('title:', 'order: nope\ntitle:'),
  ]) {
    assert.throws(() => parseHint('example.md', source), /example.md/);
  }
});
test('sorts by optional order and rejects duplicate identifiers', () => {
  const early = example.replace('title:', 'order: 1\ntitle:');
  assert.equal(
    loadHints({ 'later.md': example, 'early.md': early })[0].id,
    'early',
  );
  assert.throws(
    () => loadHints({ 'a/example.md': example, 'b/example.md': example }),
    /unique/,
  );
});
