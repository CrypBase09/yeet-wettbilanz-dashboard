function normalizeMarketLine(value) {
  return String(value ?? "").replace(/\b(\d+)\.50\b/g, "$1.5");
}

function splitGame(game) {
  const parts = String(game ?? "").split(/\s+vs\.\s+/i);
  return { team1: parts[0] ?? "", team2: parts.slice(1).join(" vs. ") };
}

export function normalizeBetRecord(bet) {
  const normalized = { ...bet, market: normalizeMarketLine(bet.market) };
  const shiftedOdds = Number(bet.market);
  const shifted = Number(bet.odds) === 0
    && Number.isFinite(shiftedOdds)
    && /\s+vs\.\s+/i.test(String(bet.eventInfo ?? ""))
    && /^(?:Total|Both Teams|1X2|Double Chance|Asian Handicap)/i.test(String(bet.game ?? ""));
  if (!shifted) return normalized;

  const game = String(bet.eventInfo).trim();
  const teams = splitGame(game);
  return {
    ...normalized,
    ...teams,
    game,
    market: normalizeMarketLine(bet.game),
    eventInfo: "",
    odds: shiftedOdds,
  };
}
