import { test } from 'node:test';
import assert from 'node:assert/strict';
import { envelopeData, checkEnvelope } from '../games/envelope.js';

test('envelope: monoisotopic is index 0 and charge from spacing', () => {
  const d = envelopeData();
  assert.equal(d.monoIndex, 0);
  assert.equal(checkEnvelope(0, d.charge, d).correct, true);
  assert.equal(checkEnvelope(1, d.charge, d).correct, false);   // wrong peak
  assert.equal(checkEnvelope(0, d.charge+1, d).correct, false); // wrong charge
});
