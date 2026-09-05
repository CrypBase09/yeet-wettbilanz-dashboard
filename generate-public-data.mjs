import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve("..");
const inputPath = path.join(root, "work", "yeet-mybets", "parsed_bets.json");
const outputPath = path.join(process.cwd(), "data", "summary.json");
const startDate = "2026-08-22";
const STAKE_TOLERANCE = 0.03;
const QUOTE_BANDS = ["1.00-1.49", "1.50-1.79", "1.80-2.19", "2.20-2.99", "3.00-3.99", "4.00+"];

const leagueAliases = new Map([
  ["2. Bundesliga", { country: "Germany", normalizedLeague: "2. Bundesliga" }],
  ["Bundesliga", { country: "Germany", normalizedLeague: "Bundesliga" }],
  ["Championship", { country: "England", normalizedLeague: "Championship" }],
  ["Premier League", { country: "England", normalizedLeague: "Premier League", ambiguous: true }],
  ["Eredivisie", { country: "Netherlands", normalizedLeague: "Eredivisie" }],
  ["LaLiga", { country: "Spain", normalizedLeague: "LaLiga" }],
  ["LaLiga 2", { country: "Spain", normalizedLeague: "LaLiga 2" }],
  ["Liga 1", { country: "Peru", normalizedLeague: "Liga 1" }],
  ["Liga Portugal", { country: "Portugal", normalizedLeague: "Liga Portugal" }],
  ["Ligue 1", { country: "France", normalizedLeague: "Ligue 1" }],
  ["Ligue 2", { country: "France", normalizedLeague: "Ligue 2" }],
  ["MLS", { country: "United States", normalizedLeague: "MLS" }],
  ["Primera LPF", { country: "Argentina", normalizedLeague: "Liga Profesional" }],
  ["Liga Profesional", { country: "Argentina", normalizedLeague: "Liga Profesional" }],
  ["AR Liga Profesional", { country: "Argentina", normalizedLeague: "Liga Profesional" }],
  ["Pro League", { country: "Belgium", normalizedLeague: "Pro League" }],
  ["Saudi Pro League", { country: "Saudi Arabia", normalizedLeague: "Saudi Pro League" }],
  ["Serie A", { country: "Italy", normalizedLeague: "Serie A" }],
  ["Serie B", { country: "Italy", normalizedLeague: "Serie B" }],
  ["Super Lig", { country: "Turkey", normalizedLeague: "Super Lig" }],
  ["Russian Premier", { country: "Russia", normalizedLeague: "Premier Liga" }],
  ["Russian Premier League", { country: "Russia", normalizedLeague: "Premier Liga" }],
  ["Chinese Super League", { country: "China", normalizedLeague: "Chinese Super League" }],
  ["CN Super League", { country: "China", normalizedLeague: "Chinese Super League" }],
  ["KR K League 1", { country: "South Korea", normalizedLeague: "K League 1" }],
  ["K League 1", { country: "South Korea", normalizedLeague: "K League 1" }],
  ["Allsvenskan", { country: "Sweden", normalizedLeague: "Allsvenskan" }],
  ["SE Allsvenskan", { country: "Sweden", normalizedLeague: "Allsvenskan", ambiguous: true }],
  ["UEFA Champions League", { country: "International", normalizedLeague: "UEFA Champions League" }],
  ["UEFA Conference League", { country: "International", normalizedLeague: "UEFA Conference League" }],
  ["UEFA Europa League", { country: "International", normalizedLeague: "UEFA Europa League" }],
]);

const teamOverrides = [
  {
    country: "Russia",
    normalizedLeague: "Premier Liga",
    teams: [
      "FK Rubin Kazan",
      "FC Dynamo-Makhachkala",
      "Dynamo Makhachkala",
      "FK Krasnodar",
      "FC Krasnodar",
      "FK Rostov",
      "FC Rostov",
      "FC Fakel Voronezh",
      "FK Zenit Saint Petersburg",
      "Zenit Saint Petersburg",
      "Rodina Moscow",
      "FC Baltika Kaliningrad",
    ],
  },
  {
    country: "England",
    normalizedLeague: "Premier League",
    teams: [
      "Arsenal FC",
      "Manchester United",
      "Liverpool FC",
      "Chelsea FC",
      "Tottenham Hotspur",
      "Manchester City",
      "Crystal Palace",
      "Everton FC",
      "Aston Villa",
      "Newcastle United",
      "West Ham United",
      "Brighton",
      "Wolverhampton",
      "Leeds United",
      "Coventry City",
    ],
  },
  {
    country: "China",
    normalizedLeague: "Chinese Super League",
    teams: [
      "Wuhan Three Towns",
      "Qingdao Youth Island",
      "Qingdao West Coast",
      "Shanghai SIPG",
      "Shanghai Port",
      "Beijing Guoan",
      "Dalian Zhixing",
      "Dalian Yingbo",
      "Qingdao Jonoon",
      "Qingdao Hainiu",
      "Shandong Luneng",
      "Shandong Taishan",
      "Sichuan Jiuniu",
      "Shenzhen Peng City",
      "Chongqing Tonglianglong",
      "Shanghai Shenhua",
      "Henan Jianye",
      "Henan FC",
      "Chengdu Better City",
      "Chengdu Rongcheng",
      "Yunnan Yukun",
      "Shenyang Urban",
      "Liaoning Tieren",
      "Tianjin Teda",
      "Tianjin Jinmen Tiger",
      "Hangzhou Greentown",
      "Zhejiang",
    ],
  },
  {
    country: "South Korea",
    normalizedLeague: "K League 1",
    teams: [
      "Bucheon FC 1995",
      "Daejeon Citizen",
      "Daejeon Hana Citizen",
      "Jeju United FC",
      "Ulsan Hyundai FC",
      "Ulsan HD",
      "Jeonbuk Motors",
      "Jeonbuk Hyundai Motors",
      "Pohang Steelers",
      "FC Seoul",
      "Incheon United",
      "FC Anyang",
      "Gangwon FC",
      "Gimcheon Sangmu",
      "Gwangju FC",
    ],
  },
  {
    country: "Argentina",
    normalizedLeague: "Liga Profesional",
    teams: [
      "Aldosivi",
      "Banfield",
      "Gimnasia L.P.",
      "Gimnasia M.",
      "Tigre",
      "Boca Juniors",
      "San Lorenzo",
      "Talleres Cordoba",
      "Velez Sarsfield",
      "Estudiantes L.P.",
      "Rosario Central",
      "Newells Old Boys",
      "Lanus",
      "Defensa Y Justicia",
      "Central Cordoba",
      "Independiente",
    ],
  },
];

function marketInfo(market) {
  const text = String(market ?? "");
  let group = "Other";
  if (/Total Goals/i.test(text)) group = "Total Goals";
  else if (/Total Corners/i.test(text)) group = "Total Corners";
  else if (/Total Bookings/i.test(text)) group = "Bookings";
  else if (/Both Teams/i.test(text)) group = "BTTS";
  else if (/1x2/i.test(text)) group = "1X2";
  else if (/Combo Bet/i.test(text)) group = "Combo Bet";
  const direction = /Under/i.test(text) ? "Under" : /Over/i.test(text) ? "Over" : "";
  const line = text.match(/(?:Under|Over)\s+([0-9]+(?:\.[0-9]+)?)/i)?.[1] ?? "";
  return {
    group,
    direction,
    line,
    fineSegment: direction && line ? `${group} - ${direction} ${line}` : group,
  };
}

function cleanText(value) {
  return String(value ?? "").trim() || "Unknown";
}

function compact(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findTeamOverride(game) {
  const gameKey = compact(game);
  return teamOverrides.find((entry) => entry.teams.some((team) => gameKey.includes(compact(team))));
}

function leagueDisplay(country, normalizedLeague) {
  return `${country} - ${normalizedLeague}`;
}

function normalizeLeague(rawLeague, game) {
  const raw = cleanText(rawLeague);
  const teamMatch = findTeamOverride(game);
  const alias = leagueAliases.get(raw);
  if (teamMatch && (!alias || alias.ambiguous || alias.country !== teamMatch.country)) {
    return {
      rawLeague: raw,
      country: teamMatch.country,
      normalizedLeague: teamMatch.normalizedLeague,
      leagueDisplay: leagueDisplay(teamMatch.country, teamMatch.normalizedLeague),
      mappingStatus: "Team override",
    };
  }
  if (alias) {
    return {
      rawLeague: raw,
      country: alias.country,
      normalizedLeague: alias.normalizedLeague,
      leagueDisplay: leagueDisplay(alias.country, alias.normalizedLeague),
      mappingStatus: alias.ambiguous ? "Alias needs team check" : "Mapped",
    };
  }
  return {
    rawLeague: raw,
    country: "Unknown",
    normalizedLeague: raw,
    leagueDisplay: `Unknown - ${raw}`,
    mappingStatus: "Unmapped",
  };
}

function configuredLeagueMappings() {
  const rows = [];
  for (const [rawLeague, alias] of leagueAliases) {
    rows.push({
      rawLeague,
      country: alias.country,
      normalizedLeague: alias.normalizedLeague,
      leagueDisplay: leagueDisplay(alias.country, alias.normalizedLeague),
      mappingStatus: alias.ambiguous ? "Alias needs team check" : "Mapped",
    });
  }
  return rows;
}

function competitionType(league) {
  const text = cleanText(league);
  if (/combo/i.test(text)) return "other";
  if (/uefa|conference|europa|champions league|cup|pokal|copa|trophy/i.test(text)) return "cups";
  return "leagues";
}

function leagueRank(league) {
  const preferred = [
    "Germany - Bundesliga",
    "Germany - 2. Bundesliga",
    "England - Premier League",
    "England - Championship",
    "Spain - LaLiga",
    "Spain - LaLiga 2",
    "Italy - Serie A",
    "Italy - Serie B",
    "France - Ligue 1",
    "France - Ligue 2",
    "Netherlands - Eredivisie",
    "Portugal - Liga Portugal",
    "United States - MLS",
    "Turkey - Super Lig",
    "Belgium - Pro League",
    "Russia - Premier Liga",
    "Argentina - Liga Profesional",
    "Brazil - Brasileiro",
    "China - Chinese Super League",
    "South Korea - K League 1",
    "Sweden - Allsvenskan",
    "Saudi Arabia - Saudi Pro League",
    "Peru - Liga 1",
  ];
  const index = preferred.indexOf(league);
  return index === -1 ? preferred.length : index;
}

function sortLeagues(values) {
  return [...values].sort((a, b) => leagueRank(a) - leagueRank(b) || a.localeCompare(b));
}

function leagueGroups(values) {
  return {
    leagues: sortLeagues(values.filter((league) => competitionType(league) === "leagues")),
    cups: sortLeagues(values.filter((league) => competitionType(league) === "cups")),
    other: sortLeagues(values.filter((league) => competitionType(league) === "other")),
  };
}

function stakeProfile(stake) {
  const s = Number(stake);
  if (Math.abs(s - 0.50) <= STAKE_TOLERANCE) return { conviction: "Low", stakeMode: "Reduced", normalStake: 1.00, stakeFactor: 0.5, reductionReason: "Warning signal" };
  if (Math.abs(s - 0.75) <= STAKE_TOLERANCE) return { conviction: "Medium", stakeMode: "Reduced", normalStake: 1.50, stakeFactor: 0.5, reductionReason: "Warning signal" };
  if (Math.abs(s - 1.25) <= STAKE_TOLERANCE) return { conviction: "High", stakeMode: "Reduced", normalStake: 2.50, stakeFactor: 0.5, reductionReason: "Warning signal" };
  if (Math.abs(s - 1.00) <= STAKE_TOLERANCE) return { conviction: "Low", stakeMode: "Normal", normalStake: 1.00, stakeFactor: 1, reductionReason: "" };
  if (Math.abs(s - 1.50) <= STAKE_TOLERANCE) return { conviction: "Medium", stakeMode: "Normal", normalStake: 1.50, stakeFactor: 1, reductionReason: "" };
  if (Math.abs(s - 2.50) <= STAKE_TOLERANCE) return { conviction: "High", stakeMode: "Normal", normalStake: 2.50, stakeFactor: 1, reductionReason: "" };
  return { conviction: "Special", stakeMode: "Special", normalStake: s, stakeFactor: null, reductionReason: "Outside stake rule" };
}

function quoteBand(odds) {
  const q = Number(odds);
  if (q < 1.5) return "1.00-1.49";
  if (q < 1.8) return "1.50-1.79";
  if (q < 2.2) return "1.80-2.19";
  if (q < 3) return "2.20-2.99";
  if (q < 4) return "3.00-3.99";
  return "4.00+";
}

function payout(bet) {
  if (bet.status === "Won" || bet.status === "Cashed Out" || bet.status === "Cashbacked") return Number(bet.cashout ?? bet.estPayout ?? 0);
  if (bet.status === "Voided") return Number(bet.stake || 0);
  return 0;
}

function net(bet) {
  const stake = Number(bet.stake || 0);
  if (bet.status === "Won" || bet.status === "Cashed Out" || bet.status === "Cashbacked") return payout(bet) - stake;
  if (bet.status === "Lost") return -stake;
  return 0;
}

function dateOf(created) {
  return String(created).slice(0, 10);
}

function closed(status) {
  return status === "Won" || status === "Lost" || status === "Cashed Out" || status === "Cashbacked";
}

function empty(label) {
  return { label, bets: 0, closed: 0, won: 0, lost: 0, stake: 0, payout: 0, net: 0, oddsSum: 0 };
}

function add(target, bet) {
  target.bets += 1;
  target.closed += closed(bet.status) ? 1 : 0;
  target.won += bet.status === "Won" ? 1 : 0;
  target.lost += bet.status === "Lost" ? 1 : 0;
  if (closed(bet.status)) {
    target.stake += bet.stake;
    target.payout += bet.payout;
    target.net += bet.net;
    target.oddsSum += bet.odds;
  }
}

function addAggregate(target, row) {
  target.bets += row.bets;
  target.closed += row.closed;
  target.won += row.won;
  target.lost += row.lost;
  target.stake += row.stake;
  target.payout += row.payout;
  target.net += row.net;
  target.oddsSum += row.oddsSum;
}

function finish(row) {
  return {
    ...row,
    roi: row.stake ? row.net / row.stake : 0,
    hitRate: row.closed ? row.won / row.closed : 0,
    avgOdds: row.closed ? row.oddsSum / row.closed : 0,
    sample: row.closed >= 100 ? "Robust" : row.closed >= 50 ? "Readable" : row.closed >= 20 ? "Trend" : "Watch",
  };
}

function aggregate(bets, keyFn) {
  const map = new Map();
  for (const bet of bets) {
    const key = keyFn(bet);
    const row = map.get(key) ?? empty(key);
    add(row, bet);
    map.set(key, row);
  }
  return [...map.values()].map(finish).sort((a, b) => b.closed - a.closed || b.net - a.net);
}

function combinationLabel(bet) {
  return [
    bet.competitionType,
    bet.league,
    bet.fineSegment,
    bet.conviction,
    bet.stakeMode,
    bet.quoteBand,
  ].join(" | ");
}

function fineSegmentQuoteBandLabel(bet) {
  return `${bet.fineSegment} | ${bet.quoteBand}`;
}

function convictionFineSegmentQuoteBandLabel(bet) {
  return `${bet.conviction} | ${bet.fineSegment} | ${bet.quoteBand}`;
}

function leagueFineSegmentQuoteBandLabel(bet) {
  return `${bet.league} | ${bet.fineSegment} | ${bet.quoteBand}`;
}

function publicCells(bets) {
  const map = new Map();
  for (const bet of bets) {
    const combination = combinationLabel(bet);
    const keyParts = [
      bet.date,
      bet.status,
      bet.rawLeague,
      bet.country,
      bet.normalizedLeague,
      bet.leagueDisplay,
      bet.mappingStatus,
      bet.league,
      bet.game,
      bet.competitionType,
      bet.marketGroup,
      bet.fineSegment,
      bet.direction,
      bet.line,
      bet.conviction,
      bet.stakeMode,
      String(bet.normalStake),
      String(bet.stakeFactor),
      bet.quoteBand,
      combination,
      String(bet.isFocus),
    ];
    const key = keyParts.join("|");
    const row = map.get(key) ?? {
      date: bet.date,
      status: bet.status,
      rawLeague: bet.rawLeague,
      country: bet.country,
      normalizedLeague: bet.normalizedLeague,
      leagueDisplay: bet.leagueDisplay,
      mappingStatus: bet.mappingStatus,
      league: bet.league,
      game: bet.game,
      competitionType: bet.competitionType,
      marketGroup: bet.marketGroup,
      fineSegment: bet.fineSegment,
      direction: bet.direction,
      line: bet.line,
      conviction: bet.conviction,
      stakeMode: bet.stakeMode,
      normalStake: bet.normalStake,
      stakeFactor: bet.stakeFactor,
      reductionReason: bet.reductionReason,
      quoteBand: bet.quoteBand,
      combination,
      isFocus: bet.isFocus,
      ...empty(key),
    };
    add(row, bet);
    map.set(key, row);
  }
  return [...map.values()].map((row) => {
    const finished = finish(row);
    delete finished.label;
    return finished;
  });
}

const raw = JSON.parse(await fs.readFile(inputPath, "utf8"));
const bets = raw.filter((bet) => dateOf(bet.created) >= startDate).map((bet) => {
  const market = marketInfo(bet.market);
  const stake = Number(bet.stake || 0);
  const profile = stakeProfile(stake);
  const mappedLeague = normalizeLeague(bet.league, bet.game);
  const out = payout(bet);
  return {
    date: dateOf(bet.created),
    status: bet.status,
    rawLeague: mappedLeague.rawLeague,
    country: mappedLeague.country,
    normalizedLeague: mappedLeague.normalizedLeague,
    leagueDisplay: mappedLeague.leagueDisplay,
    mappingStatus: mappedLeague.mappingStatus,
    league: mappedLeague.leagueDisplay,
    game: cleanText(bet.game),
    competitionType: competitionType(mappedLeague.leagueDisplay),
    marketGroup: market.group,
    fineSegment: market.fineSegment,
    direction: market.direction || "None",
    line: market.line || "None",
    conviction: profile.conviction,
    stakeMode: profile.stakeMode,
    normalStake: profile.normalStake,
    stakeFactor: profile.stakeFactor,
    reductionReason: profile.reductionReason,
    quoteBand: quoteBand(bet.odds),
    odds: Number(bet.odds || 0),
    stake,
    payout: out,
    net: net(bet),
    isFocus: profile.conviction !== "Special",
  };
});

const summary = finish(bets.reduce((acc, bet) => {
  add(acc, bet);
  return acc;
}, empty("All")));

const byDate = aggregate(bets, (bet) => bet.date).sort((a, b) => a.label.localeCompare(b.label));
let runningNet = 0;
const netCurve = byDate.map((row) => {
  runningNet += row.net;
  return { date: row.label, net: row.net, cumulativeNet: runningNet, closed: row.closed };
});

const cells = publicCells(bets);
const leagues = [...new Set(bets.map((bet) => bet.league))];
const observedLeagueMappings = new Map();
for (const bet of bets) {
  observedLeagueMappings.set(`${bet.rawLeague}|${bet.leagueDisplay}`, {
    rawLeague: bet.rawLeague,
    country: bet.country,
    normalizedLeague: bet.normalizedLeague,
    leagueDisplay: bet.leagueDisplay,
    mappingStatus: bet.mappingStatus,
  });
}
const leagueMappings = [...configuredLeagueMappings(), ...observedLeagueMappings.values()]
  .filter((row, index, rows) => rows.findIndex((other) => other.rawLeague === row.rawLeague && other.leagueDisplay === row.leagueDisplay) === index)
  .sort((a, b) => a.country.localeCompare(b.country) || a.normalizedLeague.localeCompare(b.normalizedLeague) || a.rawLeague.localeCompare(b.rawLeague));

const payload = {
  meta: {
    title: "YEET Wettbilanz Public Dashboard",
    startDate,
    generatedAt: new Date().toISOString(),
    currency: "USD",
    privacy: "Public-safe aggregate data. No bet IDs, exact bet timestamps, or YEET identifiers included. Games and leagues are visible by design.",
  },
  summary,
  dimensions: {
    dates: [...new Set(bets.map((bet) => bet.date))].sort((a, b) => b.localeCompare(a)),
    marketGroups: [...new Set(bets.map((bet) => bet.marketGroup))].sort(),
    directions: [...new Set(bets.map((bet) => bet.direction))].sort(),
    lines: [...new Set(bets.map((bet) => bet.line))].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b)),
    competitionTypes: [...new Set(bets.map((bet) => bet.competitionType))].sort(),
    leagues: sortLeagues(leagues),
    leagueGroups: leagueGroups(leagues),
    leagueMappings,
    convictions: [...new Set(bets.map((bet) => bet.conviction))].sort(),
    stakeModes: [...new Set(bets.map((bet) => bet.stakeMode))].sort(),
    quoteBands: QUOTE_BANDS,
    statuses: [...new Set(bets.map((bet) => bet.status))].sort(),
  },
  aggregates: {
    netCurve,
    byMarketGroup: aggregate(bets, (bet) => bet.marketGroup),
    byLeague: aggregate(bets, (bet) => bet.league),
    byMatch: aggregate(bets, (bet) => bet.game),
    byFineSegment: aggregate(bets, (bet) => bet.fineSegment),
    byFineSegmentQuoteBand: aggregate(bets, fineSegmentQuoteBandLabel),
    byConvictionFineSegmentQuoteBand: aggregate(bets, convictionFineSegmentQuoteBandLabel),
    byLeagueFineSegmentQuoteBand: aggregate(bets, leagueFineSegmentQuoteBandLabel),
    byCombination: aggregate(bets, combinationLabel),
    byConviction: aggregate(bets, (bet) => bet.conviction),
    byStakeMode: aggregate(bets, (bet) => bet.stakeMode),
    byQuoteBand: aggregate(bets, (bet) => bet.quoteBand),
    byStatus: aggregate(bets, (bet) => bet.status),
  },
  cells,
};

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  outputPath,
  sourceRows: raw.length,
  sourceRowsSinceStart: bets.length,
  publicAggregateCells: cells.length,
  fieldsInPublicCells: Object.keys(cells[0] ?? {}),
  summary: {
    closed: summary.closed,
    net: summary.net,
    roi: summary.roi,
  },
}, null, 2));
