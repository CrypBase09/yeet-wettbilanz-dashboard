const state = {
  lang: "de",
  view: "brief",
  segmentConviction: "High",
  data: null,
  filters: {
    date: "all",
    league: "all",
    market: "all",
    conviction: "all",
    stakeMode: "all",
    quote: "all",
    status: "all",
    focusOnly: true,
  },
};

const text = {
  de: {
    eyebrow: "Strategy Dashboard",
    title: "YEET Wettbilanz",
    subtitle: "Performance, Ligen und Spielmuster in einer kompakten Vorschau.",
    briefTab: "Kurzblick",
    segmentsTab: "Segmente",
    leaguesTab: "Ligen",
    matchesTab: "Spiele",
    oddsTab: "Quoten",
    date: "Datum",
    league: "Liga",
    market: "Markt",
    conviction: "Conviction",
    stakeMode: "Einsatzmodus",
    quoteBand: "Quotenband",
    status: "Status",
    focusOnly: "Nur Hauptstrategie",
    bets: "Wetten",
    net: "Netto",
    roi: "ROI",
    hit: "Trefferquote",
    topSignal: "Bestes Signal",
    riskSignal: "Größtes Risiko",
    sampleSignal: "Sample-Lage",
    briefView: "Kurzblick",
    briefHint: "die wichtigsten Entscheidungen ohne Datenflut",
    curve: "Netto-Verlauf",
    curveHint: "kumuliert nach Datum",
    convictionView: "Conviction",
    convictionHint: "Einsatzlogik +/- 3 Cent",
    marketView: "Marktgruppen",
    marketHint: "nach aktuellem Filter",
    matrix: "Was funktioniert, was kostet?",
    matrixHint: "nur Segmente mit mindestens 5 Wetten",
    convictionDrilldown: "Conviction-Analyse",
    convictionDrilldownHint: "erst strategische Conviction, dann Einsatzmodus, Markt/Linie und Liga",
    stakeModeView: "Normal vs. reduziert",
    stakeModeHint: "reduzierte Einsaetze bleiben ihrer urspruenglichen Conviction zugeordnet",
    marketLineView: "Markt / Richtung / Linie",
    marketLineHint: "Performance innerhalb der ausgewählten Conviction",
    leagueMarketView: "Liga x Markt / Linie",
    leagueMarketHint: "wo die gleichen Muster im Wettbewerb tragen",
    leagueMarket: "Liga / Segment",
    specialView: "Sonderfälle",
    specialHint: "andere Einsatzgrößen separat, nicht Hauptfokus",
    signal: "Signal",
    comboView: "Kombinationen",
    comboHint: "Liga, Markt, Linie, Conviction und Quote zusammen betrachtet",
    combination: "Kombination",
    best: "Stärkste Segmente",
    risk: "Schwächste Segmente",
    segment: "Segment",
    closedShort: "Abg.",
    sample: "Sample",
    leagueGroupLeagues: "Ligen",
    leagueGroupCups: "Pokal / International",
    leagueGroupOther: "Sonstige",
    quoteView: "Quotenbänder",
    quoteHint: "Performance nach Odds-Zone",
    avgOdds: "Quote",
    leagueView: "Liga-Analyse",
    leagueHint: "Wettbewerbe mit Netto, ROI und Sample-Stärke",
    matchView: "Spiel-Analyse",
    matchHint: "sichtbare Spiele, aber ohne IDs und exakte Wettzeitpunkte",
    all: "Alle",
    closed: "abgeschlossen",
    stake: "Einsatz",
    payout: "Auszahlung",
    updated: "Stand",
  },
  en: {
    eyebrow: "Strategy dashboard",
    title: "YEET Betting Ledger",
    subtitle: "Performance, leagues, and match patterns in a compact preview.",
    briefTab: "Brief",
    segmentsTab: "Segments",
    leaguesTab: "Leagues",
    matchesTab: "Matches",
    oddsTab: "Odds",
    date: "Date",
    league: "League",
    market: "Market",
    conviction: "Conviction",
    stakeMode: "Stake mode",
    quoteBand: "Odds band",
    status: "Status",
    focusOnly: "Main strategy only",
    bets: "Bets",
    net: "Net",
    roi: "ROI",
    hit: "Hit rate",
    topSignal: "Best signal",
    riskSignal: "Biggest risk",
    sampleSignal: "Sample state",
    briefView: "Brief",
    briefHint: "the essential decisions without data overload",
    curve: "Net curve",
    curveHint: "cumulative by date",
    convictionView: "Conviction",
    convictionHint: "stake logic +/- 3 cents",
    marketView: "Market groups",
    marketHint: "by active filter",
    matrix: "What works, what costs?",
    matrixHint: "segments with at least 5 bets",
    convictionDrilldown: "Conviction analysis",
    convictionDrilldownHint: "strategic conviction first, then stake mode, market/line, and league",
    stakeModeView: "Normal vs reduced",
    stakeModeHint: "reduced stakes remain assigned to their original conviction",
    marketLineView: "Market / direction / line",
    marketLineHint: "performance inside the selected conviction",
    leagueMarketView: "League x market / line",
    leagueMarketHint: "where the same patterns hold by competition",
    leagueMarket: "League / segment",
    specialView: "Special cases",
    specialHint: "other stake sizes separated from the main focus",
    signal: "Signal",
    comboView: "Combinations",
    comboHint: "league, market, line, conviction, and odds viewed together",
    combination: "Combination",
    best: "Strongest segments",
    risk: "Weakest segments",
    segment: "Segment",
    closedShort: "Closed",
    sample: "Sample",
    leagueGroupLeagues: "Leagues",
    leagueGroupCups: "Cups / international",
    leagueGroupOther: "Other",
    quoteView: "Odds bands",
    quoteHint: "Performance by odds zone",
    avgOdds: "Odds",
    leagueView: "League analysis",
    leagueHint: "Competitions with net, ROI, and sample strength",
    matchView: "Match analysis",
    matchHint: "visible matches, without IDs or exact bet timestamps",
    all: "All",
    closed: "closed",
    stake: "Stake",
    payout: "Payout",
    updated: "Updated",
  },
};

const $ = (id) => document.getElementById(id);
const tr = (key) => text[state.lang][key] || key;
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
const pct = (n) => `${((n || 0) * 100).toFixed(1)}%`;
const order = ["High", "Medium", "Low", "Special"];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

function labelText(label) {
  if (state.lang === "en") return label;
  return {
    leagues: "Liga",
    cups: "Pokal/International",
    other: "Sonstige",
    Special: "Sonderfall",
    Normal: "Normal",
    Reduced: "Reduziert",
    Interesting: "Interessant",
    Neutral: "Neutral",
    Caution: "Vorsicht",
    Readable: "Auswertbar",
    Watch: "Beobachten",
    Trend: "Trend",
    Robust: "Robust",
    Won: "Gewonnen",
    Lost: "Verloren",
    Voided: "Storniert",
    "Cashed Out": "Cashout",
  }[label] || label;
}

function formatCombination(label) {
  return String(label ?? "")
    .split(" | ")
    .map((part) => labelText(part))
    .join(" / ");
}

function leagueMarketKey(row) {
  return `${row.league || "Other"} | ${row.stakeMode || "Normal"} | ${row.fineSegment || row.marketGroup || "Other"}`;
}

function empty(label) {
  return { label, bets: 0, closed: 0, won: 0, lost: 0, stake: 0, payout: 0, net: 0, oddsSum: 0 };
}

function finish(row) {
  const avgOdds = row.closed ? row.oddsSum / row.closed : 0;
  const hitRate = row.closed ? row.won / row.closed : 0;
  const breakEven = avgOdds ? 1 / avgOdds : 0;
  return {
    ...row,
    roi: row.stake ? row.net / row.stake : 0,
    hitRate,
    avgOdds,
    breakEven,
    edgeVsBreakEven: hitRate - breakEven,
    sample: row.closed >= 100 ? "Robust" : row.closed >= 50 ? "Readable" : row.closed >= 20 ? "Trend" : "Watch",
  };
}

function merge(target, source) {
  target.bets += source.bets;
  target.closed += source.closed;
  target.won += source.won;
  target.lost += source.lost;
  target.stake += source.stake;
  target.payout += source.payout;
  target.net += source.net;
  target.oddsSum += source.oddsSum;
}

function filteredRows() {
  return filterRows();
}

function filterRows(options = {}) {
  const ignoreFocus = options.ignoreFocus || false;
  const ignoreConviction = options.ignoreConviction || false;
  const onlySpecial = options.onlySpecial || false;
  return state.data.cells.filter((row) => {
    if (state.filters.date !== "all" && row.date !== state.filters.date) return false;
    if (state.filters.league !== "all" && row.league !== state.filters.league) return false;
    if (state.filters.market !== "all" && row.marketGroup !== state.filters.market) return false;
    if (!ignoreConviction && state.filters.conviction !== "all" && row.conviction !== state.filters.conviction) return false;
    if (state.filters.stakeMode !== "all" && row.stakeMode !== state.filters.stakeMode) return false;
    if (state.filters.quote !== "all" && row.quoteBand !== state.filters.quote) return false;
    if (state.filters.status !== "all" && row.status !== state.filters.status) return false;
    if (onlySpecial && row.isFocus) return false;
    if (state.filters.focusOnly && !ignoreFocus && !row.isFocus) return false;
    return true;
  });
}

function aggregate(rows, key) {
  return aggregateBy(rows, (source) => source[key] || "Other");
}

function aggregateBy(rows, keyFn) {
  const map = new Map();
  rows.forEach((source) => {
    const label = keyFn(source) || "Other";
    const row = map.get(label) ?? empty(label);
    merge(row, source);
    map.set(label, row);
  });
  return [...map.values()].map(finish).sort((a, b) => b.closed - a.closed || b.net - a.net);
}

function summary(rows) {
  const total = empty("All");
  rows.forEach((row) => merge(total, row));
  return finish(total);
}

function optionList(id, values) {
  const select = $(id);
  const current = select.value || "all";
  select.innerHTML = `<option value="all">${tr("all")}</option>${values.map((value) => `<option value="${esc(value)}">${esc(labelText(value))}</option>`).join("")}`;
  select.value = values.includes(current) ? current : "all";
}

function groupedLeagueOptions() {
  const select = $("leagueFilter");
  const current = select.value || "all";
  const groups = state.data.dimensions.leagueGroups;
  const groupMarkup = [
    ["leagueGroupLeagues", groups.leagues],
    ["leagueGroupCups", groups.cups],
    ["leagueGroupOther", groups.other],
  ].filter(([, values]) => values.length).map(([label, values]) => {
    return `<optgroup label="${esc(tr(label))}">${values.map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("")}</optgroup>`;
  }).join("");
  select.innerHTML = `<option value="all">${tr("all")}</option>${groupMarkup}`;
  select.value = state.data.dimensions.leagues.includes(current) ? current : "all";
}

function renderKpis(row) {
  $("bets").textContent = row.bets;
  $("closed").textContent = `${row.closed} ${tr("closed")}`;
  $("net").textContent = money(row.net);
  $("net").className = row.net >= 0 ? "pos" : "neg";
  $("stake").textContent = `${money(row.stake)} ${tr("stake")}`;
  $("roi").textContent = pct(row.roi);
  $("payout").textContent = `${money(row.payout)} ${tr("payout")}`;
  $("hit").textContent = pct(row.hitRate);
  $("record").textContent = `${row.won} W / ${row.lost} L`;
}

function renderInsights(rows) {
  const segments = aggregate(rows, "fineSegment").filter((row) => row.closed >= 5);
  const best = segments.filter((row) => row.net > 0).sort((a, b) => b.net - a.net)[0];
  const risk = segments.filter((row) => row.net < 0).sort((a, b) => a.net - b.net)[0];
  const total = summary(rows);
  const sampleLabel = labelText(total.sample);
  $("topSignal").textContent = best ? labelText(best.label) : "-";
  $("topSignalMeta").textContent = best ? `${money(best.net)} · ${pct(best.roi)} · ${best.closed} ${tr("closedShort")}` : "";
  $("riskSignal").textContent = risk ? labelText(risk.label) : "-";
  $("riskSignalMeta").textContent = risk ? `${money(risk.net)} · ${pct(risk.roi)} · ${risk.closed} ${tr("closedShort")}` : "";
  $("sampleSignal").textContent = sampleLabel;
  $("sampleSignalMeta").textContent = `${total.closed} ${tr("closed")} · ${total.bets} ${tr("bets")}`;
}

function decisionCard(kind, row) {
  const cls = kind === "risk" ? "neg" : row?.net >= 0 ? "pos" : "neg";
  const label = row ? labelText(row.label) : "-";
  const meta = row ? `${money(row.net)} · ${pct(row.roi)} · ${row.closed} ${tr("closedShort")}` : "";
  return `<article class="decision-card ${kind}">
    <span>${kind === "risk" ? tr("riskSignal") : kind === "watch" ? tr("sampleSignal") : tr("topSignal")}</span>
    <strong>${esc(label)}</strong>
    <small class="${cls}">${esc(meta)}</small>
  </article>`;
}

function bars(id, rows) {
  const max = Math.max(...rows.map((row) => Math.abs(row.net)), 1);
  $(id).innerHTML = rows.map((row) => {
    const cls = row.net >= 0 ? "pos" : "neg";
    const width = Math.max(6, Math.abs(row.net) / max * 100);
    return `<div class="bar-row">
      <div class="bar-meta"><strong>${esc(labelText(row.label))}</strong><span class="${cls}">${money(row.net)} · ${pct(row.roi)}</span></div>
      <div class="track"><div class="fill ${cls}" style="width:${width}%"></div></div>
    </div>`;
  }).join("");
}

function lineChart(rows) {
  const byDate = aggregate(rows, "date").sort((a, b) => a.label.localeCompare(b.label));
  let running = 0;
  const points = byDate.map((row) => ({ label: row.label, value: running += row.net }));
  if (!points.length) {
    $("curveChart").innerHTML = "";
    return;
  }
  const width = 960;
  const height = 250;
  const pad = 28;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals, 0);
  const max = Math.max(...vals, 0);
  const x = (i) => pad + (points.length === 1 ? 0 : i * (width - pad * 2) / (points.length - 1));
  const y = (v) => height - pad - ((v - min) / Math.max(max - min, 1)) * (height - pad * 2);
  $("curveChart").innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img">
    <line x1="${pad}" y1="${y(0)}" x2="${width - pad}" y2="${y(0)}" stroke="#29384a"/>
    <polyline fill="none" stroke="#58a6ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" points="${points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ")}"/>
    ${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.value)}" r="5" fill="${p.value >= 0 ? "#2dd4a3" : "#ff647c"}"><title>${esc(p.label)}: ${money(p.value)}</title></circle>`).join("")}
  </svg>`;
}

function tableRows(id, rows) {
  $(id).innerHTML = rows.map((row) => `<tr>
    <td>${esc(labelText(row.label))}</td>
    <td>${row.closed}</td>
    <td class="${row.net >= 0 ? "pos" : "neg"}">${money(row.net)}</td>
    <td>${pct(row.roi)}</td>
    <td>${esc(labelText(row.sample))}</td>
  </tr>`).join("");
}

function quoteRows(rows) {
  $("quoteRows").innerHTML = rows.map((row) => `<tr>
    <td>${esc(row.label)}</td>
    <td>${row.closed}</td>
    <td>${pct(row.hitRate)}</td>
    <td>${row.avgOdds.toFixed(2)}</td>
    <td class="${row.net >= 0 ? "pos" : "neg"}">${money(row.net)}</td>
    <td>${pct(row.roi)}</td>
  </tr>`).join("");
}

function comboRows(rows) {
  $("comboRows").innerHTML = rows.map((row) => `<tr>
    <td>${esc(formatCombination(row.label))}</td>
    <td>${row.closed}</td>
    <td class="${row.net >= 0 ? "pos" : "neg"}">${money(row.net)}</td>
    <td>${pct(row.roi)}</td>
    <td>${pct(row.hitRate)}</td>
    <td>${esc(labelText(row.sample))}</td>
  </tr>`).join("");
}

function signalFor(row) {
  if (row.closed < 10) return "Watch";
  if (row.net > 0 && row.roi >= 0.08 && row.edgeVsBreakEven >= 0.03) return "Interesting";
  if (row.net < 0 && row.roi <= -0.08 && row.edgeVsBreakEven <= -0.03) return "Caution";
  return "Neutral";
}

function analysisRows(id, rows, options = {}) {
  const limit = options.limit || rows.length;
  $(id).innerHTML = rows.slice(0, limit).map((row) => {
    const signal = signalFor(row);
    return `<tr>
      <td>${esc(options.format ? options.format(row.label) : labelText(row.label))}</td>
      <td>${row.closed}</td>
      <td class="${row.net >= 0 ? "pos" : "neg"}">${money(row.net)}</td>
      <td>${pct(row.roi)}</td>
      <td>${pct(row.hitRate)}</td>
      <td>${row.avgOdds.toFixed(2)}</td>
      <td>${esc(labelText(row.sample))}</td>
      <td><span class="signal ${esc(signal.toLowerCase())}">${esc(labelText(signal))}</span></td>
    </tr>`;
  }).join("");
}

function statCard(row) {
  const cls = row.net >= 0 ? "pos" : "neg";
  return `<article class="mini-card">
    <div class="mini-card-head">
      <strong>${esc(labelText(row.label))}</strong>
      <span class="pill ${cls}">${money(row.net)}</span>
    </div>
    <div class="mini-stats">
      <span>${row.closed} ${tr("closedShort")}</span>
      <span>${pct(row.roi)} ROI</span>
      <span>${pct(row.hitRate)} ${tr("hit")}</span>
      <span>${row.avgOdds.toFixed(2)} ${tr("avgOdds")}</span>
    </div>
    <div class="sample">${esc(labelText(row.sample))}</div>
  </article>`;
}

function renderBrief(rows) {
  lineChart(rows);
  bars("convictionBars", aggregate(rows, "conviction").sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label)));
  bars("marketBars", aggregate(rows, "marketGroup"));
  const segments = aggregate(rows, "fineSegment").filter((row) => row.closed >= 5);
  const best = segments.filter((row) => row.net > 0).sort((a, b) => b.net - a.net)[0];
  const risk = segments.filter((row) => row.net < 0).sort((a, b) => a.net - b.net)[0];
  const sample = summary(rows);
  $("briefCards").innerHTML = [
    decisionCard("best", best),
    decisionCard("risk", risk),
    decisionCard("watch", { label: sample.sample, net: sample.net, roi: sample.roi, closed: sample.closed }),
  ].join("");
}

function renderSegments(rows) {
  renderConvictionSegments(rows);
}

function renderConvictionSegments(rows) {
  const convictionOrder = ["High", "Medium", "Low"];
  document.querySelectorAll("[data-conviction]").forEach((button) => {
    button.classList.toggle("active", button.dataset.conviction === state.segmentConviction);
  });
  const summaries = aggregate(rows.filter((row) => convictionOrder.includes(row.conviction)), "conviction");
  const byLabel = new Map(summaries.map((row) => [row.label, row]));
  $("convictionSummaryCards").innerHTML = convictionOrder.map((label) => {
    const row = byLabel.get(label) || finish(empty(label));
    const active = state.segmentConviction === label ? " active" : "";
    const signal = signalFor(row);
    return `<article class="mini-card conviction-card${active}" data-conviction="${esc(label)}">
      <div class="mini-card-head">
        <strong>${esc(labelText(label))}</strong>
        <span class="pill ${row.net >= 0 ? "pos" : "neg"}">${money(row.net)}</span>
      </div>
      <div class="mini-stats">
        <span>${row.closed} ${tr("closedShort")}</span>
        <span>${pct(row.roi)} ROI</span>
        <span>${pct(row.hitRate)} ${tr("hit")}</span>
        <span>${row.avgOdds.toFixed(2)} ${tr("avgOdds")}</span>
      </div>
      <div class="sample">${esc(labelText(row.sample))} · ${esc(labelText(signal))}</div>
    </article>`;
  }).join("");

  const selected = rows.filter((row) => row.conviction === state.segmentConviction);
  analysisRows("convictionStakeModeRows", aggregate(selected, "stakeMode"), { limit: 6 });

  const marketLines = aggregate(selected, "fineSegment")
    .filter((row) => row.closed >= 3)
    .sort((a, b) => b.closed - a.closed || Math.abs(b.net) - Math.abs(a.net));
  analysisRows("convictionMarketRows", marketLines);

  const leagueMarkets = aggregateBy(selected, leagueMarketKey)
    .filter((row) => row.closed >= 2)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net) || b.closed - a.closed);
  analysisRows("convictionLeagueRows", leagueMarkets, {
    limit: 18,
    format: (label) => label.split(" | ").map((part, index) => index === 0 ? part : labelText(part)).join(" / "),
  });

  const specials = aggregate(filterRows({ ignoreFocus: true, ignoreConviction: true, onlySpecial: true }), "fineSegment")
    .filter((row) => row.closed >= 1)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  analysisRows("specialRows", specials, { limit: 10 });
}

function renderCombinations(rows) {
  const combos = aggregate(rows, "combination").filter((row) => row.closed >= 3);
  comboRows(combos.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).slice(0, 14));
}

function renderOdds(rows) {
  quoteRows(aggregate(rows, "quoteBand").sort((a, b) => a.label.localeCompare(b.label)));
}

function renderLeagues(rows) {
  $("leagueCards").innerHTML = aggregate(rows, "league").map((row) => statCard(row)).join("");
}

function renderMatches(rows) {
  $("matchCards").innerHTML = aggregate(rows, "game").slice(0, 36).map((row) => statCard(row)).join("");
}

function render() {
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = tr(node.dataset.i18n); });
  $("stamp").textContent = `${tr("updated")}: ${state.data.meta.generatedAt.slice(0, 10)}`;
  const rows = filteredRows();
  renderKpis(summary(rows));
  renderInsights(rows);
  renderBrief(rows);
  renderSegments(rows);
  renderLeagues(rows);
  renderMatches(rows);
  renderOdds(rows);
}

function setView(view) {
  state.view = view;
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
}

function bind() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      state.lang = button.dataset.lang;
      document.documentElement.lang = state.lang;
      document.querySelectorAll("[data-lang]").forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === state.lang));
      populate();
      render();
    });
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  document.querySelectorAll("#convictionSwitch [data-conviction]").forEach((button) => {
    button.addEventListener("click", () => {
      state.segmentConviction = button.dataset.conviction;
      render();
    });
  });
  [["dateFilter", "date"], ["leagueFilter", "league"], ["marketFilter", "market"], ["convictionFilter", "conviction"], ["stakeModeFilter", "stakeMode"], ["quoteFilter", "quote"], ["statusFilter", "status"]].forEach(([id, key]) => {
    $(id).addEventListener("change", (event) => {
      state.filters[key] = event.target.value;
      render();
    });
  });
  $("focusOnly").addEventListener("change", (event) => {
    state.filters.focusOnly = event.target.checked;
    render();
  });
}

function populate() {
  optionList("dateFilter", state.data.dimensions.dates);
  groupedLeagueOptions();
  optionList("marketFilter", state.data.dimensions.marketGroups);
  optionList("convictionFilter", state.data.dimensions.convictions);
  optionList("stakeModeFilter", state.data.dimensions.stakeModes);
  optionList("quoteFilter", state.data.dimensions.quoteBands);
  optionList("statusFilter", state.data.dimensions.statuses);
}

async function init() {
  const res = await fetch("data/summary.json");
  state.data = await res.json();
  populate();
  bind();
  state.filters.focusOnly = $("focusOnly").checked;
  render();
  setView("brief");
}

init();
