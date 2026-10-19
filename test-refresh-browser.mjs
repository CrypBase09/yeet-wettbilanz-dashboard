import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const original = JSON.parse(await fs.readFile("data/summary.json", "utf8"));
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const file = path.resolve(root, `.${url.pathname === "/" ? "/index.html" : url.pathname}`);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const content = await fs.readFile(file);
    res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".json") ? "application/json" : "text/html");
    res.end(content);
  } catch { res.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let next = original;
  let fail = false;
  let requests = 0;
  await page.route("**/data/summary.json?refresh=*", async (route) => {
    requests++;
    await route.fulfill({ status: fail ? 503 : 200, contentType: "application/json", body: JSON.stringify(next) });
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => document.querySelector("#stamp").textContent.startsWith("Datenstand:") && !document.querySelector("#stamp").textContent.endsWith("-"));
  const verification = path.resolve(root, "../work/verification/dashboard-freshness");
  await fs.mkdir(verification, { recursive: true });
  await page.screenshot({ path: path.join(verification, "desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(verification, "mobile.png") });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.selectOption("#leagueFilter", "Germany - Bundesliga");
  await page.selectOption("#dateFilter", "2026-10-10");
  await page.locator('[data-lang="en"]').click();
  await page.locator('[data-view="segments"]').click();
  next = structuredClone(original);
  next.meta.generatedAt = new Date(Date.parse(original.meta.generatedAt) + 60000).toISOString();
  next.dimensions.dates.unshift("2026-10-18");
  const before = requests;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.waitForFunction(() => [...document.querySelector("#dateFilter").options].some((option) => option.value === "2026-10-18"));
  assert.ok(requests > before);
  assert.equal(await page.locator("#leagueFilter").inputValue(), "Germany - Bundesliga");
  assert.equal(await page.locator("#dateFilter").inputValue(), "2026-10-10");
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.match(await page.locator("#segmentsView").getAttribute("class"), /active/);
  fail = true;
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await page.waitForFunction(() => document.querySelector("#stamp").textContent.includes("Update failed"));
  fail = false;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.waitForFunction(() => !document.querySelector("#stamp").textContent.includes("Update failed"));
  assert.deepEqual(errors, []);
  console.log("PASS: fresh requests, focus refresh, filters/language/view preserved, failure recovery, desktop/mobile.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
