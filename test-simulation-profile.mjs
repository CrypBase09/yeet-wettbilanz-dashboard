import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { simulationProfile } from './simulation-profile.mjs';

test('explicit SRL league or team markers override real team-name matches', () => {
  for (const [league, game] of [
    ['K-LEAGUE 1 SRL', 'FC Seoul SRL vs. Incheon United FC SRL'],
    ['K League 1', 'FC Anyang Srl vs. Bucheon FC Srl'],
  ]) {
    const p = simulationProfile(league, game);
    assert.equal(p.strategyType, 'Special');
    assert.equal(p.leagueDisplay, 'Special - K League 1 SRL');
    assert.equal(p.isSimulation, true);
    assert.equal(p.rawLeague, league);
  }
});
test('real K League stays untouched; simulation detection never depends on outcomes', () => {
  assert.equal(simulationProfile('K-LEAGUE 1', 'FC Seoul vs. Incheon United FC'), null);
  assert.equal(simulationProfile('Serie A', 'AS Roma vs. Real Madrid'), null);
  assert.equal(simulationProfile('Premier League SRL', 'Chelsea SRL vs. Arsenal SRL').leagueDisplay, 'Special - Premier League SRL');
  assert.equal(simulationProfile('Simulated Reality', 'Example A vs. Example B').strategyType, 'Special');
});
test('published simulation cells cannot enter Main or real-league research', () => {
  const data = JSON.parse(fs.readFileSync(new URL('./data/summary.json', import.meta.url), 'utf8'));
  for (const row of data.cells.filter(r => simulationProfile(r.rawLeague, r.game))) {
    assert.equal(row.strategyType, 'Special', row.game);
    assert.equal(row.isFocus, false, row.game);
    assert.equal(row.competitionType, 'other', row.game);
    assert.ok(row.league.startsWith('Special - '), row.game);
  }
});
