import assert from "node:assert/strict";
import { test } from "node:test";
import { createProtocol, buildResearch, cupIdentity, definitions, researchInput, researchCompetitionType, checkpointSnapshots } from "./research-monitor.mjs";

const row = (id, patch = {}) => ({ sourceId: id, sourceCreated: "2026-10-21, 12:00", date: "2026-10-21", status: "Won", strategyType: "Main", conviction: "Medium", fineSegment: "BTTS - Yes", odds: 1.6, stake: 1.5, net: 0.9, normalStake: 1.5, game: id, league: "Germany - Bundesliga", rawLeague: "Bundesliga", competitionType: "leagues", mappingStatus: "Mapped", ...patch });
const make = (baseline = []) => createProtocol(baseline, "2026-10-20T10:00:00Z", "2026-10-20, 12:00");
const group = (r, id = "btts-medium", scope = "leagues") => r.groups.find(g => g.id === id && g.scope === scope);

test("baseline open settlements and late old imports never become new confirmation", () => {
  const p = make([row("old", { status: "Upcoming" })]);
  const r = buildResearch([row("old"), row("late", { sourceCreated: "2026-10-19, 12:00", date: "2026-10-19" }), row("new")], p);
  assert.equal(group(r).history.decisions, 2);
  assert.equal(group(r).fresh.decisions, 1);
});
test("source history cannot disappear, identities must be unique and protocol cannot drift", () => {
  assert.throws(() => buildResearch([], make([row("gone")])), /baseline/i);
  assert.throws(() => buildResearch([row("a"), row("a")], make()), /duplicate/i);
  const p = make(); p.definitions[0].id = "changed";
  assert.throws(() => buildResearch([], p), /protocol/i);
});
test("national and international cups never mix with leagues; unknown cup is flagged", () => {
  const r = buildResearch([row("a"), row("b", { rawLeague: "DFB Pokal", league: "Germany - DFB Pokal", competitionType: "cups" }), row("c", { rawLeague: "UEFA Champions League", league: "International - UEFA Champions League", competitionType: "cups" }), row("d", { rawLeague: "Mystery Cup", mappingStatus: "Unmapped" })], make());
  for (const scope of ["leagues", "nationalCups", "international"]) assert.equal(group(r, "btts-medium", scope).fresh.decisions, 1);
  assert.equal(r.quality.blocked, 1);
  assert.equal(cupIdentity("COPPA ITALIA").country, "Italy");
  assert.equal(cupIdentity("Mystery Cup").known, false);
  assert.equal(cupIdentity("Premier League"), null);
});
test("empty groups have no profit; boundaries are exact, controls disjoint", () => {
  const r = buildResearch([row("a", { odds: 1.5 }), row("b", { odds: 1.8 })], make());
  assert.equal(group(r).fresh.decisions, 1);
  assert.equal(group(r).control.fresh.decisions, 1);
  assert.equal(group(r, "btts-medium", "nationalCups").fresh.net, null);
  assert.equal(group(r, "btts-medium", "nationalCups").fresh.roi, null);
});
test("actual cashout, flat decisions, normal stakes and quarter simulation stay separate", () => {
  const patch = { conviction: "High", fineSegment: "Total Goals - Under 2.5", normalStake: 2.5 };
  const r = buildResearch([row("a", { ...patch, stake: 1.25, net: 1.25 }), row("b", { ...patch, stake: 2.5, net: -2.5, status: "Lost" }), row("c", { ...patch, stake: 1, net: -0.2, status: "Cashed Out" }), row("d", { ...patch, status: "Voided", net: 0 })], make());
  const g = group(r, "high-under25").fresh;
  assert.equal(g.decisions, 2); assert.equal(g.closed, 3); assert.equal(g.voided, 1);
  assert.ok(Math.abs(g.net + 1.45) < 1e-9);
  assert.equal(g.flatRoi, 0);
  assert.ok(Math.abs(g.quarterNet + .3625) < 1e-9);
});
test("checkpoints are reviews, dependent positions do not become independent games", () => {
  const rows = Array.from({ length: 50 }, (_, i) => row(String(i), { game: "same game" }));
  const g = group(buildResearch(rows, make()));
  assert.equal(g.checkpoint, 50);
  assert.equal(g.nextCheckpoint, null);
  assert.equal(g.fresh.games, 1);
  assert.equal(g.evidence, "reviewDue");
  assert.equal(g.fresh.unitCi, null);
  assert.equal(g.assessment, "insufficientSpread");
});
test("reviews describe positive or negative data without confirming a winning strategy", () => {
  const rows = Array.from({ length: 30 }, (_, i) => row(String(i), { date: `2026-10-${21 + i % 4}` }));
  const g = group(buildResearch(rows, make()));
  assert.equal(g.checkpoint, 30);
  assert.equal(g.assessment, "positiveUnconfirmed");
  const negative = group(buildResearch(rows.map(r => ({ ...r, status: "Lost", net: -r.stake })), make()));
  assert.equal(negative.assessment, "negativeUnconfirmed");
});
test("public aggregates contain no source identities, hashes or raw fixture names", () => {
  const text = JSON.stringify(buildResearch([row("PRIVATE_ID", { game: "PRIVATE_GAME" })], make()));
  assert.ok(!text.includes("PRIVATE_ID") && !text.includes("PRIVATE_GAME"));
  assert.ok(!text.includes("baselineHashes"));
  assert.equal(definitions.length, 5);
});
test("contra, special, missing money and ambiguous mapping cannot enter Main tests", () => {
  const r = buildResearch([row("contra", { strategyType: "Contra" }), row("special", { strategyType: "Special" }), row("money", { net: null }), row("mapping", { mappingStatus: "Ungeklaert" })], make());
  assert.equal(group(r).fresh.decisions, 0);
  assert.equal(r.quality.blocked, 2);
  assert.equal(r.separateStrategies.Contra.decisions, 1);
});
test("source BTTS selection is preserved although existing dashboard aggregates call both sides BTTS", () => {
  const yes = researchInput(row("unused", { fineSegment: "BTTS" }), { betId: "yes", created: "2026-10-21, 12:00", market: "Both teams to score - Yes" });
  const no = researchInput(row("unused", { fineSegment: "BTTS" }), { betId: "no", created: "2026-10-21, 12:00", market: "Both teams to score - No" });
  assert.equal(yes.fineSegment, "BTTS - Yes");
  assert.equal(no.fineSegment, "BTTS - No");
  assert.equal(group(buildResearch([yes, no], make())).fresh.decisions, 1);
});
test("all recognized domestic cup names remain cups after country-prefix normalization", () => {
  for (const league of ["Italy - Coppa Italia", "France - Coupe de France", "Portugal - Taca de Portugal", "Netherlands - KNVB Beker"]) assert.equal(researchCompetitionType(league), "cups");
  assert.equal(researchCompetitionType("Germany - Bundesliga"), "leagues");
});
test("batch jumps archive all reached review points without inventing exact-threshold evidence", () => {
  const rows = Array.from({ length: 32 }, (_, i) => row(String(i), { date: `2026-10-${21 + i % 4}` }));
  const reviews = checkpointSnapshots(buildResearch(rows, make()), "2026-10-25T12:00:00Z").filter(r => r.review.id === "btts-medium" && r.review.scope === "leagues");
  assert.deepEqual(reviews.map(r => r.review.reviewThreshold), [15, 30]);
  assert.deepEqual(reviews.map(r => r.review.batchOvershoot), [17, 2]);
  assert.ok(reviews.every(r => r.review.fresh.decisions === 32 && r.review.provisional));
});
