export function simulationProfile(rawLeague, game) {
  const raw = String(rawLeague ?? '').trim();
  if (!/\bSRL\b|\bSimulated[\s-]+Reality\b/i.test(`${raw} ${game ?? ''}`)) return null;
  const normalizedLeague = /^K[\s-]*LEAGUE\s*1(?:\s+SRL)?$/i.test(raw)
    ? 'K League 1 SRL'
    : /\bSRL\b|\bSimulated[\s-]+Reality\b/i.test(raw) ? raw : `${raw || 'Unknown competition'} SRL`;
  return { rawLeague: raw, country: 'Special', normalizedLeague,
    leagueDisplay: `Special - ${normalizedLeague}`, mappingStatus: 'Simulation - explicit source marker',
    isSimulation: true, strategyType: 'Special' };
}
