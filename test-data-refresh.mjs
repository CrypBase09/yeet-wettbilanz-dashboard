import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

function factory() {
  const scope = { AbortSignal };
  vm.runInNewContext(fs.readFileSync(new URL("./data-refresh.js", import.meta.url), "utf8"), scope);
  return scope.createYeetDataRefresher;
}
const snapshot = (day) => ({ meta: { generatedAt: `2026-10-${day}T02:03:00Z` }, dimensions: {}, cells: [], summary: { bets: 1845 } });

test("requests fresh data and coalesces overlapping refreshes", async () => {
  let release;
  const calls = [];
  const data = [];
  const refresh = factory()({ fetcher: (url, options) => {
    calls.push({ url, options });
    return new Promise((resolve) => { release = () => resolve({ ok: true, json: async () => snapshot(19) }); });
  }, onData: (value) => data.push(value) });
  const a = refresh();
  const b = refresh();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.cache, "no-store");
  assert.match(calls[0].url, /summary\.json\?refresh=\d+/);
  release();
  await Promise.all([a, b]);
  assert.equal(data.length, 1);
});

test("does not replace current data with an older publication", async () => {
  const versions = [snapshot(19), snapshot(17), snapshot(19), snapshot(20)];
  const updates = [];
  const errors = [];
  const refresh = factory()({ fetcher: async () => ({ ok: true, json: async () => versions.shift() }),
    onData: (data) => updates.push(data.meta.generatedAt), onError: (error) => errors.push(error) });
  await refresh(); await refresh(); await refresh(); await refresh();
  assert.equal(updates.length, 2);
  assert.equal(errors.length, 1);
});

test("reports failed or invalid responses and allows the next refresh", async () => {
  const responses = [{ ok: false, status: 503 }, { ok: true, json: async () => ({}) }, { ok: true, json: async () => snapshot(19) }];
  const errors = [];
  const updates = [];
  const refresh = factory()({ fetcher: async () => responses.shift(), onData: (data) => updates.push(data), onError: (error) => errors.push(error) });
  await refresh(); await refresh(); await refresh();
  assert.equal(errors.length, 2);
  assert.equal(updates.length, 1);
});
