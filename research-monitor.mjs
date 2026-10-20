import { createHash } from "node:crypto";

export const definitions = [
  { id: "high-under25", family: "loss", segment: "Total Goals - Under 2.5", conviction: "High" },
  { id: "high-corners105", family: "loss", segment: "Total Corners - Over 10.5", conviction: "High" },
  { id: "corners-weight", family: "weight", segment: "Total Corners - Over 10.5", conviction: null },
  { id: "btts-medium", family: "odds", segment: "BTTS - Yes", conviction: "Medium", lo: 1.5, hi: 1.8 },
  { id: "btts-low", family: "odds", segment: "BTTS - Yes", conviction: "Low", lo: 1.7, hi: 2.1 },
];
const scopes = ["leagues", "nationalCups", "international"];
const decisions = new Set(["Won", "Lost"]);
const closed = new Set([...decisions, "Cashed Out", "Cashbacked"]);
const digest = value => createHash("sha256").update(value).digest("hex");
const fingerprint = () => digest(JSON.stringify(definitions));
const finite = value => typeof value === "number" && Number.isFinite(value);

export function researchInput(row, source) {
  const btts = String(source.market || "").match(/^Both\s+teams.*-\s*(Yes|No)\s*$/i);
  return { ...row, fineSegment: btts ? `BTTS - ${btts[1].toLowerCase() === "yes" ? "Yes" : "No"}` : row.fineSegment,
    sourceId: source.betId, sourceCreated: source.created,
    round: source.round || null, settlementBasis: source.settlementBasis || null, teamTierGap: source.teamTierGap ?? null };
}

export function cupIdentity(value) {
  const raw = String(value || "").trim();
  const catalog = [
    [/^(?:DFB[ -]?(?:Pokal|Cup))$/i, "Germany", "DFB Pokal"],
    [/^(?:English )?FA Cup$/i, "England", "FA Cup"],
    [/^(?:EFL|Carabao|English League) Cup$/i, "England", "EFL Cup"],
    [/^Coppa Italia$/i, "Italy", "Coppa Italia"],
    [/^Copa del Rey$/i, "Spain", "Copa del Rey"],
    [/^Coupe de France$/i, "France", "Coupe de France"],
    [/^Ta[cç]a (?:de )?Portugal$/i, "Portugal", "Taca de Portugal"],
    [/^(?:KNVB Beker|KNVB Cup)$/i, "Netherlands", "KNVB Beker"],
    [/^UEFA Champions League$/i, "International", "UEFA Champions League"],
    [/^UEFA Europa League$/i, "International", "UEFA Europa League"],
    [/^UEFA (?:Europa )?Conference League$/i, "International", "UEFA Conference League"],
  ];
  const match = catalog.find(([pattern]) => pattern.test(raw));
  if (match) return { known: true, country: match[1], name: match[2], scope: match[1] === "International" ? "international" : "nationalCups" };
  if (/\bcup\b|pokal|\bcopa\b|coppa|coupe|ta[cç]a|beker|trophy|uefa|champions league|conference league|europa league/i.test(raw)) return { known: false, name: raw, scope: null };
  return null;
}

export function researchCompetitionType(value) {
  if (/combo/i.test(String(value))) return "other";
  return cupIdentity(value) ? "cups" : "leagues";
}

export function checkpointSnapshots(report, generatedAt) {
  return report.groups.flatMap(group => report.checkpoints.filter(point => point <= group.fresh.decisions).map(point => ({
    filename: `${group.scope}-${group.id}-${point}.json`,
    review: { ...group, generatedAt, testStartedAt: report.startedAt, provisional: true, reviewThreshold: point, observedDecisions: group.fresh.decisions, batchOvershoot: group.fresh.decisions - point },
  })));
}

export function createProtocol(rows, startedAt, placementCutoff) {
  const ids = rows.map(row => row.sourceId);
  if (ids.some(id => !id) || new Set(ids).size !== ids.length) throw new Error("Missing or duplicate baseline identity");
  if (!/^\d{4}-\d{2}-\d{2}, \d{2}:\d{2}$/.test(placementCutoff)) throw new Error("Invalid placement cutoff");
  return { version: 1, startedAt, placementCutoff, modelEpoch: "2026-09-16", definitions: structuredClone(definitions), definitionsHash: fingerprint(), baselineHashes: ids.map(digest).sort(), checkpoints: [15, 30, 50], automaticStakeChanges: false };
}

function stats(rows) {
  const settled = rows.filter(row => closed.has(row.status));
  const dec = rows.filter(row => decisions.has(row.status));
  const sum = (items, get) => items.reduce((total, row) => total + get(row), 0);
  const net = settled.length ? sum(settled, row => row.net) : null;
  const stake = sum(settled, row => row.stake);
  const normalStake = sum(settled, row => row.normalStake);
  const normalNet = settled.length ? sum(settled, row => row.net / row.stake * row.normalStake) : null;
  const games = new Map();
  for (const row of dec) {
    const key = `${row.league}|${row.game}`;
    const old = games.get(key) || { sum: 0, n: 0 };
    old.sum += row.net / row.stake; old.n++;
    games.set(key, old);
  }
  const flatRoi = dec.length ? sum(dec, row => row.net / row.stake) / dec.length : null;
  const days = new Set(dec.map(row => row.date)).size;
  let unitCi = null;
  // Cluster uncertainty is descriptive only; repeated looks and selected hypotheses are not a confirmation test.
  if (games.size >= 10 && days >= 2) {
    const g = games.size;
    const se = Math.sqrt(g / (g - 1) * sum([...games.values()], row => (row.sum - flatRoi * row.n) ** 2)) / dec.length;
    unitCi = [flatRoi - 1.96 * se, flatRoi + 1.96 * se];
  }
  return { placed: rows.length, closed: settled.length, decisions: dec.length, games: games.size, days,
    won: dec.filter(row => row.status === "Won").length,
    pending: rows.filter(row => !closed.has(row.status) && row.status !== "Voided").length,
    voided: rows.filter(row => row.status === "Voided").length, cashouts: settled.length - dec.length,
    net, stake: settled.length ? stake : null, roi: stake ? net / stake : null, flatRoi, unitCi,
    normalNet, normalRoi: normalStake ? normalNet / normalStake : null,
    quarterNet: net === null ? null : net * .25,
  };
}

export function buildResearch(rows, protocol) {
  if (protocol.version !== 1 || protocol.definitionsHash !== fingerprint() || digest(JSON.stringify(protocol.definitions)) !== fingerprint() || protocol.automaticStakeChanges !== false || JSON.stringify(protocol.checkpoints) !== "[15,30,50]" || protocol.modelEpoch !== "2026-09-16") throw new Error("Research protocol changed; explicit new version required");
  const ids = rows.map(row => row.sourceId);
  if (ids.some(id => !id) || new Set(ids).size !== ids.length) throw new Error("Missing or duplicate research identity");
  const hashes = new Set(ids.map(digest));
  if (protocol.baselineHashes.some(hash => !hashes.has(hash))) throw new Error("Research baseline records disappeared");
  const baseline = new Set(protocol.baselineHashes);
  const eligible = [];
  const quality = { blocked: 0, reasons: {}, missingCupContext: 0 };
  const reject = reason => { quality.blocked++; quality.reasons[reason] = (quality.reasons[reason] || 0) + 1; };
  const separateStrategies = {};
  for (const type of ["Contra", "Special"]) separateStrategies[type] = stats(rows.filter(row => row.strategyType === type && finite(row.net) && row.stake > 0));
  for (const row of rows) {
    if (row.strategyType !== "Main") continue;
    if (!finite(row.stake) || row.stake <= 0 || !finite(row.normalStake) || row.normalStake <= 0 || !finite(row.odds) || row.odds < 1 || (closed.has(row.status) && !finite(row.net))) { reject("invalidMoney"); continue; }
    if (!row.game || !row.league || !["High", "Medium", "Low"].includes(row.conviction) || !row.fineSegment || /^(?:Other|Sonstige)$/i.test(row.fineSegment)) { reject("unclearAssignment"); continue; }
    if (!/^\d{4}-\d{2}-\d{2}, \d{2}:\d{2}$/.test(row.sourceCreated || "")) { reject("invalidPlacement"); continue; }
    const cup = cupIdentity(row.rawLeague);
    if (cup && (!cup.known || row.competitionType !== "cups")) { reject("unclearCup"); continue; }
    if (!["Mapped", "Team override"].includes(row.mappingStatus)) { reject("unclearCompetition"); continue; }
    if (/women|frauen|\bu\d{2}\b|\bufc\b|combo/i.test(`${row.rawLeague} ${row.league}`)) { reject("outsideStudy"); continue; }
    const scope = cup?.scope || (row.competitionType === "leagues" ? "leagues" : null);
    if (!scope) { reject("unclearCompetition"); continue; }
    if (scope !== "leagues" && (!row.round || !row.settlementBasis || row.teamTierGap == null)) quality.missingCupContext++;
    eligible.push({ ...row, scope, fresh: !baseline.has(digest(row.sourceId)) && row.sourceCreated >= protocol.placementCutoff });
  }
  const groups = [];
  for (const scope of scopes) for (const def of definitions) {
    const universe = eligible.filter(row => row.scope === scope && row.fineSegment === def.segment && (!def.conviction || row.conviction === def.conviction));
    const target = row => def.family !== "odds" || row.odds >= def.lo && row.odds < def.hi;
    const selected = universe.filter(target);
    const freshRows = selected.filter(row => row.fresh);
    const fresh = stats(freshRows);
    const checkpoint = [...protocol.checkpoints].reverse().find(value => fresh.decisions >= value) || 0;
    const assessment = !checkpoint ? "collecting" : fresh.games < 10 || fresh.days < 4 ? "insufficientSpread" : fresh.flatRoi > 0 && fresh.roi > 0 ? "positiveUnconfirmed" : fresh.flatRoi < 0 && fresh.roi < 0 ? "negativeUnconfirmed" : "mixedUnconfirmed";
    const byCompetition = [...new Set(selected.map(row => row.league))].sort().map(league => ({ league, history: stats(selected.filter(row => row.league === league && !row.fresh && row.date >= protocol.modelEpoch)), fresh: stats(freshRows.filter(row => row.league === league)) }));
    groups.push({ ...def, scope, history: stats(selected.filter(row => !row.fresh && row.date >= protocol.modelEpoch)), legacy: stats(selected.filter(row => !row.fresh && row.date < protocol.modelEpoch)), fresh,
      control: def.family === "odds" ? { history: stats(universe.filter(row => !row.fresh && row.date >= protocol.modelEpoch && !target(row))), fresh: stats(universe.filter(row => row.fresh && !target(row))) } : null,
      byCompetition, checkpoint, nextCheckpoint: protocol.checkpoints.find(value => value > fresh.decisions) || null,
      evidence: checkpoint ? "reviewDue" : "collecting", assessment, independentDaysReady: fresh.days >= 4, byConviction: def.family === "weight" ? ["High", "Medium", "Low"].map(conviction => ({ conviction, history: stats(selected.filter(row => !row.fresh && row.date >= protocol.modelEpoch && row.conviction === conviction)), fresh: stats(freshRows.filter(row => row.conviction === conviction)) })) : [],
    });
  }
  return { version: 1, startedAt: protocol.startedAt, placementCutoff: protocol.placementCutoff, baselineCount: baseline.size, checkpoints: protocol.checkpoints, automaticStakeChanges: false, modelEpoch: protocol.modelEpoch, quality, separateStrategies, groups };
}
