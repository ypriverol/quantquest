// tests/content.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPICS, trainingCards, mcqPool, validateContent } from '../content.js';

const IDS = Object.keys(TOPICS);   // derive from TOPICS so new topics can't drift out of the allow-list

test('all topics present with review text', () => {
  assert.ok(IDS.length >= 8);
  for (const id of IDS) { assert.ok(TOPICS[id], `missing ${id}`); assert.ok(TOPICS[id].review); }
});
test('>=8 training cards, valid topics', () => {
  assert.ok(trainingCards.length >= 8);
  for (const c of trainingCards) assert.ok(IDS.includes(c.topic), `bad topic ${c.topic}`);
});
test('>=18 MCQ, each internally valid', () => {
  assert.ok(mcqPool.length >= 18);
});
test('validateContent returns no errors', () => {
  assert.deepEqual(validateContent(), []);
});
