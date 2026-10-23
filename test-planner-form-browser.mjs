import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const output = path.resolve(root, "../work/verification/planner-form");
await fs.mkdir(output, { recursive: true });
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const file = path.resolve(root, `.${url.pathname === "/" ? "/index.html" : url.pathname}`);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".json") ? "application/json" : "text/html");
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(process.env.YEET_FORM_TEST_URL || `http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => state.data?.plannerHistory && document.querySelectorAll(".form-mark").length > 0);
  const colorMismatches = await page.locator("#recommendationRows > tr").evaluateAll(rows => rows.filter(row => getComputedStyle(row.querySelector("td:nth-child(5) .signal")).color !== getComputedStyle(row.querySelector("td:nth-child(6) strong")).color).length);
  assert.equal(colorMismatches, 0, "every stake must use exactly the same color as its action");
  if (process.env.YEET_RECOMMENDATION_BASELINE) {
    const baseline = JSON.parse(await fs.readFile(process.env.YEET_RECOMMENDATION_BASELINE, "utf8"));
    const current = await page.evaluate(() => plannerMatrixRows(filteredRows()).map(row => ({ key: YeetPlannerHistory.key(row), action: row.action, stake: stakeForAction(row.conviction, row.action, row.counterStakeMode || "50"), derived: !!row.derivedSuggestion })));
    assert.deepEqual(current, baseline.rows, "display changes must preserve all recommendations and stake amounts");
    console.log(`PASS: ${current.length} recommendations unchanged from pre-change backup.`);
  }
  assert.match(await page.locator("#contraOverview").textContent(), /35 Wetten/);
  assert.match(await page.locator("#contraOverview").textContent(), /12 ohne Ausloeser/);
  const coverage = await page.evaluate(() => {
    const rows = plannerVisibleRows(plannerMatrixRows(filteredRows()));
    const elements = [...document.querySelectorAll("#recommendationRows > tr")];
    return rows.map((row, i) => ({ derived: !!row.derivedSuggestion, bets: state.data.plannerHistory.groups[YeetPlannerHistory.key(row)]?.original.length || 0, dots: elements[i].querySelectorAll("td:nth-child(3) .form-mark").length, counterDots: elements[i].querySelectorAll(".counter-comparison .form-mark").length }));
  });
  assert.ok(coverage.filter(r => r.derived).every(r => r.dots === 0 && r.counterDots === 0));
  assert.ok(coverage.filter(r => !r.derived && r.bets > 0).every(r => r.dots === Math.min(10, r.bets)));
  for (const width of [1920, 1280, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    const overflow = await page.locator("#recommendationRows").evaluate(root => [...root.querySelectorAll("strong,small,b,.form-mark,.signal")].filter(node => {
      const cell = node.closest("td").getBoundingClientRect();
      const bounds = node.getBoundingClientRect();
      return bounds.left < cell.left - 1 || bounds.right > cell.right + 1;
    }).slice(0, 5).map(node => node.textContent));
    assert.deepEqual(overflow, [], `planner contents fit their cells at ${width}px`);
  }
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.selectOption("#leagueFilter", "England - Championship");
  await page.selectOption("#convictionFilter", "Low");
  await page.selectOption("#quoteFilter", "1.00-1.49");
  const row = page.locator("#recommendationRows > tr").filter({ hasText: "Total Corners - Under 11.5" }).first();
  await row.scrollIntoViewIfNeeded();
  assert.match(await row.textContent(), /Original aktuell/);
  assert.match(await row.textContent(), /Kontra gespielt/);
  assert.match(await row.textContent(), /\$1\.61/);
  assert.match(await row.locator("td:nth-child(3) .band-form small").first().textContent(), /Original - letzte 10/);
  assert.match(await row.locator(".counter-comparison .band-form small").first().textContent(), /Kontra - letzte 10/);
  assert.ok(await row.locator(".planner-result-basis").count() > 0, "ROI displays its actual stake and payout basis");
  assert.ok(await row.locator(".counter-comparison .form-mark").count() > 0);
  await page.screenshot({ path: path.join(output, "desktop.png") });
  const mark = row.locator("td:nth-child(3) .form-mark").first();
  const title = await mark.getAttribute("title");
  assert.match(title, /\d{4}-\d{2}-\d{2}/);
  await mark.click();
  assert.equal(await page.locator("#formDetail").evaluate(node => node.matches(":popover-open")), true);
  assert.match(await page.locator("#formDetail").textContent(), /Netto/);
  await page.keyboard.press("Escape");
  await page.locator('[data-lang="en"]').click();
  assert.match(await row.textContent(), /Original current/);
  assert.match(await row.textContent(), /Counter bets played/);
  await page.setViewportSize({ width: 390, height: 844 });
  await row.locator(".form-mark").first().click();
  assert.equal(await page.locator("#formDetail").isVisible(), true);
  await page.screenshot({ path: path.join(output, "mobile-detail.png") });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.keyboard.press("Escape");
  await page.screenshot({ path: path.join(output, "mobile.png") });
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.locator('[data-lang="de"]').click();
  await page.selectOption("#leagueFilter", "Argentina - Liga Profesional");
  await page.selectOption("#convictionFilter", "High");
  await page.selectOption("#quoteFilter", "2.20-2.99");
  const btts = page.locator("#recommendationRows > tr").filter({ hasText: "BTTS" }).first();
  assert.match(await btts.locator(".planner-result-basis").textContent(), /Einsatz \$2\.50.*Auszahlung \$5\.50/);
  assert.match(await btts.locator(".planner-result-values").textContent(), /120\.0%/);
  await page.selectOption("#quoteFilter", "1.00-1.49");
  const emptyCounter = page.locator("#recommendationRows > tr").filter({ hasText: "Total Goals - Under 2.5" }).first();
  assert.match(await emptyCounter.textContent(), /Kontra - letzte 10.*0\/10/);
  assert.match(await emptyCounter.textContent(), /Keine zugeordneten Kontrawetten/);
  assert.equal(await emptyCounter.locator(".counter-comparison .form-mark").count(), 0);
  await page.selectOption("#leagueFilter", "England - Championship");
  await page.selectOption("#convictionFilter", "Low");
  await page.evaluate(() => {
    for (const group of Object.values(state.data.plannerHistory.groups)) for (const bet of group.contra) bet.status = "Upcoming";
    renderPlanner(filteredRows());
  });
  assert.ok(await row.locator(".counter-comparison .form-mark").count() > 0, "pending counter bets retain inspectable form details");
  assert.equal(await row.locator(".counter-comparison .planner-result-values").count(), 0, "pending counters must not display settled performance");
  assert.deepEqual(errors, []);
  console.log(`PASS: ${coverage.length} rows checked; original/contra form, no derived form, scoped comparison, hover/tap details, DE/EN and mobile.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
