import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRound } from '../roundengine.js';
import { blankPerTopic } from '../score.js';

function freshState() {
  return { score: 0, streak: 0, perTopic: blankPerTopic(['feature']) };
}

test('first completion applies score/streak/per-topic', () => {
  const s = freshState();
  const round = createRound();
  const out = round.complete(s, { correct: true, topic: 'feature', explain: '' }, 0);
  assert.equal(out.applied, true);
  assert.equal(out.delta, 100);          // correct, streak 0, no speed bonus
  assert.equal(s.score, 100);
  assert.equal(s.streak, 1);
  assert.deepEqual(s.perTopic.feature, { correct: 1, seen: 1 });
});

test('second completion of the SAME round is ignored (no double-score)', () => {
  const s = freshState();
  const round = createRound();
  round.complete(s, { correct: true, topic: 'feature', explain: '' }, 0);
  const out2 = round.complete(s, { correct: true, topic: 'feature', explain: '' }, 0);
  assert.equal(out2.applied, false);
  assert.equal(out2.delta, 0);
  assert.equal(s.score, 100);            // unchanged
  assert.equal(s.streak, 1);             // unchanged
  assert.deepEqual(s.perTopic.feature, { correct: 1, seen: 1 }); // unchanged
});

test('a repeated wrong/trap re-click cannot reset streak twice or add penalties', () => {
  const s = freshState();
  s.streak = 3;
  const round = createRound();
  round.complete(s, { correct: false, penalty: true, topic: 'feature', explain: '' }, 0);
  const scoreAfterFirst = s.score;
  round.complete(s, { correct: false, penalty: true, topic: 'feature', explain: '' }, 0);
  assert.equal(s.score, scoreAfterFirst); // second penalty not applied
  assert.equal(round.isLocked(), true);
});
