// tests/score.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { streakMultiplier, computeDelta, tierFor, blankPerTopic, recordTopic, badgeFor } from '../score.js';

test('streakMultiplier caps at 1.5', () => {
  assert.equal(streakMultiplier(0), 1);
  assert.equal(streakMultiplier(3), 1.3);
  assert.equal(streakMultiplier(10), 1.5);
});

test('computeDelta: wrong answer scores 0', () => {
  assert.equal(computeDelta({correct:false, streak:2}), 0);
});

test('computeDelta: penalty is -50 regardless', () => {
  assert.equal(computeDelta({correct:false, penalty:true, streak:0}), -50);
});

test('computeDelta: correct base 100 * streak mult, plus speed bonus', () => {
  // streak 0 -> mult 1; timeFrac 0 -> no bonus
  assert.equal(computeDelta({correct:true, streak:0, timeFrac:0}), 100);
  // streak 2 -> mult 1.2; timeFrac 1 -> +50 -> (100+50)*1.2 = 180
  assert.equal(computeDelta({correct:true, streak:2, timeFrac:1}), 180);
});

test('tierFor thresholds', () => {
  assert.equal(tierFor(90).name, 'Gold');
  assert.equal(tierFor(70).name, 'Silver');
  assert.equal(tierFor(50).name, 'Bronze');
  assert.equal(tierFor(10).name, 'Keep training');
});

test('perTopic record + badge picks best-accuracy topic', () => {
  let pt = blankPerTopic(['feature','missing']);
  recordTopic(pt, 'feature', true);
  recordTopic(pt, 'feature', true);
  recordTopic(pt, 'missing', false);
  assert.deepEqual(pt.feature, {correct:2, seen:2});
  assert.equal(badgeFor(pt), 'Feature Hunter');
});
