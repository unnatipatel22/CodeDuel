import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTopic } from '../src/utils/topic.utils.js';

test('normalizes UI topic labels to supported backend values', () => {
  assert.equal(normalizeTopic('Strings'), 'strings');
  assert.equal(normalizeTopic('DP'), 'dynamic programming');
  assert.equal(normalizeTopic('Arrays'), 'arrays');
  assert.equal(normalizeTopic('all'), 'all');
  assert.equal(normalizeTopic('Random'), 'all');
});
