import fs from "node:fs/promises";

const QUOTE_TOLERANCE = 0.03;
const STAKE_TOLERANCE = 0.03;

function compact(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isClose(actual, expected, tolerance) {
  const a = numberOrNull(actual);
  const e = numberOrNull(expected);
  if (a === null || e === null) return false;
  return Math.abs(a - e) <= tolerance + 1e-9;
}

export async function loadContraLogs(logPath) {
  try {
    return JSON.parse(await fs.readFile(logPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

export function matchContraLog(bet, details, logs) {
  if (details.strategyType !== "Contra" && details.strategyType !== "Kontra") return null;
  const leagueKey = compact(details.league);
  const gameKey = compact(details.game);
  const segmentKey = compact(details.fineSegment);
  return logs.find((log) => {
    if (log.status === "matched") return false;
    if (compact(log.league) !== leagueKey) return false;
    if (compact(log.game) !== gameKey) return false;
    if (compact(log.targetSegment) !== segmentKey) return false;
    if (!isClose(bet.odds, log.targetOdds, QUOTE_TOLERANCE)) return false;
    if (!isClose(bet.stake, log.stakeCode, STAKE_TOLERANCE)) return false;
    return true;
  }) ?? null;
}

export function contraOriginSignal(log) {
  if (!log) return "";
  const source = log.triggerSource === "derived" ? "abgeleitet" : "real";
  return `${log.triggerConviction} | ${log.triggerSegment} | ${log.triggerQuoteBand} | ${log.triggerSample} | ${source} | ${log.id}`;
}
