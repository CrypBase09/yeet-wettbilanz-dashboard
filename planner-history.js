(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.YeetPlannerHistory = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const closed = new Set(["Won", "Lost", "Cashed Out", "Cashbacked"]);
  const key = row => `${row.league} | ${row.conviction} | ${row.fineSegment || row.segment} | ${row.quoteBand}`;
  const logKey = log => `${log.league} | ${log.triggerConviction} | ${log.triggerSegment} | ${log.triggerQuoteBand}`;
  const sum = (rows, get) => rows.reduce((n, row) => n + get(row), 0);

  function stats(records) {
    const settled = records.filter(r => closed.has(r.status));
    const won = records.filter(r => r.status === "Won").length;
    const lost = records.filter(r => r.status === "Lost").length;
    const stake = sum(settled, r => r.stake);
    const net = settled.length ? sum(settled, r => r.net) : null;
    return { bets: records.length, closed: settled.length, won, lost, cashouts: settled.length - won - lost,
      voided: records.filter(r => r.status === "Voided").length,
      pending: records.filter(r => !closed.has(r.status) && r.status !== "Voided").length,
      stake: settled.length ? stake : null, net, roi: stake ? net / stake : null,
      hitRate: won + lost ? won / (won + lost) : null };
  }

  function matches(record, filters) {
    return ["date", "stakeMode", "status"].every(k => !filters[k] || filters[k] === "all" || record[k] === filters[k]);
  }

  function formFor(data, groupKey, filters = {}, derived = false, strategy = "original") {
    if (derived) return [];
    const relevantFilters = strategy === "contra" ? { date: filters.date, status: filters.status } : filters;
    return (data?.groups?.[groupKey]?.[strategy] || []).filter(r => matches(r, relevantFilters)).slice(-10);
  }

  function comparisonFor(data, groupKey, filters = {}) {
    const group = data?.groups?.[groupKey];
    const originalRecords = (group?.original || []).filter(r => matches(r, filters));
    // A Main-only stake-mode filter must not silently hide an actually played counter position.
    const counterFilters = { date: filters.date, status: filters.status };
    const contraRecords = (group?.contra || []).filter(r => matches(r, counterFilters));
    const references = new Set(contraRecords.flatMap(r => r.signalRefs || []));
    return { original: stats(originalRecords), contra: stats(contraRecords), contraRecords,
      snapshots: (group?.snapshots || []).filter(s => references.has(s.ref)), currentSignal: group?.currentSignal || null };
  }

  function referencesFor(data, row, filters = {}) {
    if (["date", "status", "stakeMode"].some(k => filters[k] && filters[k] !== "all")) return [];
    const keys = row.derivedSuggestion ? (row.derivedFromNeighborBands || []).map(band => key({ ...row, quoteBand: band })) : [key(row)];
    return keys.map(k => data?.groups?.[k]?.currentSignal).filter(s => s?.closed);
  }

  function publicSnapshot(value) {
    if (!value || typeof value.key !== "string" || value.key.split(" | ").length !== 4 || typeof value.ref !== "string" || !/^signal-[A-Za-z0-9-]+$/.test(value.ref)
      || typeof value.asOf !== "string" || !Number.isFinite(Date.parse(value.asOf)) || !Number.isInteger(value.closed) || value.closed < 0
      || !Number.isFinite(value.net) || !Number.isFinite(value.roi)) return null;
    return { ref: value.ref, key: value.key, asOf: value.asOf, closed: value.closed, net: value.net, roi: value.roi };
  }

  function build(rows, sources, logs, asOf, archive = {}) {
    if (rows.length !== sources.length) throw new Error("History source alignment failed");
    const ids = sources.map(r => r.betId);
    if (ids.some(id => !id) || new Set(ids).size !== ids.length) throw new Error("Missing or duplicate history identity");
    const sorted = rows.map((row, i) => ({ row, source: sources[i] })).sort((a, b) => String(a.source.created).localeCompare(String(b.source.created)) || a.source.betId.localeCompare(b.source.betId));
    const groups = {};
    const counters = [];
    const unlinked = [];
    const ensure = k => groups[k] ||= { original: [], contra: [], snapshots: [] };
    for (const { row, source } of sorted) {
      if (!/^\d{4}-\d{2}-\d{2}, \d{2}:\d{2}$/.test(source.created)) throw new Error("Invalid placement timestamp in history");
      const record = { date: row.date, game: row.game, league: row.league, conviction: row.conviction,
        segment: row.fineSegment, targetBand: row.quoteBand, status: row.status, odds: row.odds,
        stake: row.stake, net: row.net, stakeMode: row.stakeMode };
      if (row.strategyType === "Main") ensure(key(row)).original.push(record);
      if (row.strategyType !== "Contra") continue;
      counters.push(record);
      const log = logs.find(l => l.id === row.contraLogId);
      if (!log) { unlinked.push(record); continue; }
      const k = logKey(log);
      const group = ensure(k);
      group.contra.push(record);
      record.signalRefs = [];
      const refs = [log.triggerSnapshotRef, ...(log.triggerSnapshotRefs || [])].filter(Boolean);
      for (const ref of refs) {
        const snapshot = publicSnapshot(archive[ref]);
        const exact = snapshot?.key === k;
        const derivedNeighbor = String(log.triggerSource).startsWith("derived") && snapshot?.key.split(" | ").slice(0, 3).join(" | ") === k.split(" | ").slice(0, 3).join(" | ");
        if (!snapshot || snapshot.ref !== ref || (!exact && !derivedNeighbor)) continue;
        record.signalRefs.push(ref);
        if (!group.snapshots.some(s => s.ref === ref)) group.snapshots.push(snapshot);
      }
    }
    for (const [i, k] of Object.keys(groups).sort().entries()) {
      const s = stats(groups[k].original);
      groups[k].currentSignal = { ref: `signal-${Date.parse(asOf)}-${i}`, key: k, asOf, closed: s.closed, net: s.net, roi: s.roi };
    }
    return { asOf, groups, counters, unlinked, totals: stats(counters), linkedCount: counters.length - unlinked.length };
  }

  return { key, logKey, stats, matches, formFor, comparisonFor, referencesFor, build };
});
