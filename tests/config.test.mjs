import test from 'node:test';
import assert from 'node:assert/strict';
import { displayName } from '../scripts/display-name.mjs';

test('missing or blank public name has a readable fallback', () => {
  for (const value of [undefined, '', '   ']) assert.equal(displayName(value), 'YOUR NAME');
});
test('names preserve case, accents and punctuation and normalize Unicode', () => {
  assert.equal(displayName('  Jose\u0301 O’Neill  '), 'José O’Neill');
});
test('rejects excessive length and invisible controls without leaking the input', () => {
  for (const value of ['A'.repeat(121), 'Jane\nDoe', 'Jane\u202eDoe']) {
    assert.throws(() => displayName(value), /PUBLIC_DISPLAY_NAME must contain/);
  }
});
test('quotes and markup remain text when serialized into generated TypeScript', () => {
  const value = '<img src=x onerror="alert(1)">';
  assert.equal(JSON.parse(JSON.stringify(displayName(value))), value);
});
