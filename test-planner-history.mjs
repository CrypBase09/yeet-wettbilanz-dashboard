import assert from "node:assert/strict";
import { test } from "node:test";
import history from "./planner-history.js";

const row = (i, extra = {}) => ({ date: "2026-10-23", game: `Game ${i}`, league: "England - Premier League", conviction: "Low", fineSegment: "Total Goals - Over 2.5", quoteBand: "1.50-1.79", strategyType: "Main", stakeMode: "Normal", status: "Won", odds: 1.7, stake: 1, net: .7, ...extra });
const source = i => ({ betId: `PRIVATE_${i}`, created: `2026-10-23, ${String(i).padStart(2, "0")}:00` });
const log = { id: "log-one", league: "England - Premier League", game: "Counter", triggerConviction: "Low", triggerSegment: "Total Goals - Over 2.5", triggerQuoteBand: "1.50-1.79", targetSegment: "Total Goals - Under 2.5", targetOdds: 2.7, stakeCode: .59 };
const build = (rows, sources, logs = [], snapshots = {}) => history.build(rows, sources, logs, "2026-10-23T12:00:00Z", snapshots);

test("every original band has placement-sorted history, not settlement order", () => {
  const rows = Array.from({ length: 12 }, (_, i) => row(i));
  const sources = rows.map((_, i) => source(i));
  rows.reverse(); sources.reverse();
  const d = build(rows, sources);
  const key = history.key(row(0));
  const form = history.formFor(d, key, {}, false);
  assert.equal(form.length, 10); assert.equal(form[0].game, "Game 2"); assert.equal(form.at(-1).game, "Game 11");
  assert.equal(history.formFor(d, key, {}, true).length, 0);
});
test("pending, cashout and void remain in last ten; filters do not borrow neighbor outcomes", () => {
  const rows = [row(0, { status: "Upcoming", stakeMode: "Research 50% V2" }), row(1, { status: "Voided" }), row(2, { status: "Cashed Out", net: -.2 })];
  const d = build(rows, rows.map((_, i) => source(i)));
  const key = history.key(rows[0]);
  assert.deepEqual(history.formFor(d, key, {}).map(r => r.status), ["Upcoming", "Voided", "Cashed Out"]);
  assert.equal(history.formFor(d, key, { status: "Upcoming" }).length, 1);
  assert.equal(history.formFor(d, key, { stakeMode: "Research 50% V2" }).length, 1);
  assert.equal(history.formFor(d, key, { date: "2026-10-22" }).length, 0);
  assert.equal(history.formFor(d, "missing", {}).length, 0);
});
test("counter target odds do not overwrite trigger band, unknown origins remain unassigned", () => {
  const original = row(0, { status: "Lost", net: -1 });
  const contra = row(1, { game: "Counter", strategyType: "Contra", fineSegment: "Total Goals - Under 2.5", quoteBand: "2.20-2.99", odds: 2.7, stake: .59, net: 1.00, contraLogId: "log-one" });
  const unknown = row(2, { strategyType: "Contra", odds: 2, stake: .59, net: -.59, status: "Lost" });
  const d = build([original, contra, unknown], [source(0), source(1), source(2)], [log]);
  const pair = history.comparisonFor(d, history.key(original), {});
  assert.equal(pair.original.net, -1); assert.equal(pair.contra.net, 1);
  assert.equal(pair.contra.bets, 1); assert.equal(pair.contraRecords[0].odds, 2.7);
  assert.equal(history.comparisonFor(d, history.key({ ...original, quoteBand: "2.20-2.99" }), {}).contra.net, null);
  assert.equal(d.unlinked.length, 1);
  assert.equal(pair.snapshots.length, 0);
  assert.ok(Math.abs(d.totals.net - .41) < 1e-9);
});
test("empty or open-only counter stats have no invented ROI, cashouts excluded from hit rate", () => {
  assert.equal(history.stats([]).net, null);
  assert.equal(history.stats([row(0, { status: "Upcoming" })]).roi, null);
  const s = history.stats([row(0), row(1, { status: "Lost", net: -1 }), row(2, { status: "Cashed Out", net: -.5 })]);
  assert.equal(s.hitRate, .5); assert.equal(s.closed, 3);
});
test("public output excludes identities and exact placement times", () => {
  const d = build([row(0)], [source(0)]);
  const text = JSON.stringify(d);
  assert.ok(!text.includes("PRIVATE_") && !text.includes("created") && !text.includes(source(0).created));
  assert.ok(!text.includes("sourceId") && !text.includes("betId"));
});
test("only explicitly referenced signal snapshots are presented as documented trigger state", () => {
  const snap = { ref: "signal-known", key: history.key(row(0)), asOf: "2026-10-20T02:00:00Z", closed: 8, net: -3, roi: -.2 };
  const contra = row(0, { game: "Counter", strategyType: "Contra", contraLogId: log.id });
  const d = build([contra], [source(0)], [{ ...log, triggerSnapshotRef: snap.ref }], { [snap.ref]: snap });
  const c = history.comparisonFor(d, history.key(row(0)), {});
  assert.equal(c.snapshots[0].net, -3);
  assert.equal(c.snapshots[0].asOf, snap.asOf);
});
test("private snapshot extras never enter public data and malformed derived references are ignored", () => {
  const snap = { ref: "signal-known", key: history.key(row(0)), asOf: "2026-10-20T02:00:00Z", closed: 8, net: -3, roi: -.2, betId: "PRIVATE_ID", sourceCreated: "2026-10-20, 12:00" };
  const contra = row(0, { game: "Counter", strategyType: "Contra", contraLogId: log.id });
  const d = build([contra], [source(0)], [{ ...log, triggerSnapshotRef: snap.ref }], { [snap.ref]: snap });
  assert.ok(!JSON.stringify(d).includes("PRIVATE_ID"));
  assert.ok(!JSON.stringify(d).includes("sourceCreated"));
  const bad = build([contra], [source(0)], [{ ...log, triggerSource: "derived-neighbor", triggerSnapshotRef: "bad" }], { bad: { ref: "bad" } });
  assert.equal(history.comparisonFor(bad, history.key(row(0)), {}).snapshots.length, 0);
});
test("filtered undocumented counter positions cannot inherit another position's snapshot", () => {
  const snap = { ref: "signal-known", key: history.key(row(0)), asOf: "2026-10-20T02:00:00Z", closed: 8, net: -3, roi: -.2 };
  const documented = row(0, { date: "2026-10-21", strategyType: "Contra", contraLogId: "documented" });
  const unknown = row(1, { date: "2026-10-22", strategyType: "Contra", contraLogId: "unknown" });
  const logs = [{ ...log, id: "documented", triggerSnapshotRef: snap.ref }, { ...log, id: "unknown" }];
  const d = build([documented, unknown], [source(0), source(1)], logs, { [snap.ref]: snap });
  assert.equal(history.comparisonFor(d, history.key(row(0)), {}).snapshots.length, 1);
  assert.equal(history.comparisonFor(d, history.key(row(0)), { date: "2026-10-22" }).snapshots.length, 0);
  assert.equal(history.comparisonFor(d, history.key(row(0)), { date: "2026-10-25" }).snapshots.length, 0);
});
test("copied references are suppressed for unmatched date/status/stake-mode contexts", () => {
  const r = row(0);
  const d = build([r], [source(0)]);
  assert.equal(history.referencesFor(d, r, {}).length, 1);
  assert.equal(history.referencesFor(d, r, { league: r.league, conviction: "Low", quote: r.quoteBand }).length, 1);
  for (const filters of [{ date: "2026-10-23" }, { status: "Won" }, { stakeMode: "Normal" }]) assert.equal(history.referencesFor(d, r, filters).length, 0);
});
