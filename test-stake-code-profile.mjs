import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyStake, assertKnownStakeCodes } from './stake-code-profile.mjs';

test('equidistant legacy/V2 codes with identical meaning resolve to V2', () => {
  const p = classifyStake(2.26);
  assert.equal(p.conviction, 'Medium');
  assert.equal(p.stakeMode, 'Increased 50% V2');
  assert.equal(p.stakeFactor, 1.5);
  assert.equal(p.normalStake, 1.5);
  assert.equal(p.strategyType, 'Main');
  assert.equal(classifyStake(2.26, { locale: 'de' }).stakeMode, 'Erhoeht 50% V2');
  assert.doesNotThrow(() => assertKnownStakeCodes([{ stake: 2.26 }]));
});
test('ties across different strategy meanings remain blocked', () => {
  assert.throws(() => classifyStake(.65), /Ambiguous/);
  assert.throws(() => classifyStake(.40), /Ambiguous/);
  assert.equal(classifyStake(2.25).stakeMode, 'Increased 50%');
  assert.equal(classifyStake(2.27).stakeMode, 'Increased 50% V2');
  assert.equal(classifyStake(.51).stakeMode, 'Research 50% V2');
});
