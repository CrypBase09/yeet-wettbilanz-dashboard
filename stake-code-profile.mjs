export const STAKE_TOLERANCE = 0.03;

export const stakeProfiles = [
  { amount: 0.24, version: "V2", conviction: "Low", stakeMode: "Research 25% V2", normalStake: 1.00, stakeFactor: 0.25, reductionReason: "Warning signal" },
  { amount: 0.25, version: "Legacy", conviction: "Low", stakeMode: "Research 25%", normalStake: 1.00, stakeFactor: 0.25, reductionReason: "Warning signal" },
  { amount: 0.27, version: "Legacy", conviction: "Low", stakeMode: "Contra 25%", strategyType: "Contra", normalStake: 1.00, stakeFactor: 0.25, reductionReason: "Contra signal" },
  { amount: 0.37, version: "V2", conviction: "Medium", stakeMode: "Research 25% V2", normalStake: 1.50, stakeFactor: 0.25, reductionReason: "Warning signal" },
  { amount: 0.38, version: "Legacy", conviction: "Medium", stakeMode: "Research 25%", normalStake: 1.50, stakeFactor: 0.25, reductionReason: "Warning signal" },
  { amount: 0.42, version: "Legacy", conviction: "Medium", stakeMode: "Contra 25%", strategyType: "Contra", normalStake: 1.50, stakeFactor: 0.25, reductionReason: "Contra signal" },
  { amount: 0.50, version: "Legacy", conviction: "Low", stakeMode: "Research 50%", normalStake: 1.00, stakeFactor: 0.5, reductionReason: "Warning signal" },
  { amount: 0.52, version: "V2", conviction: "Low", stakeMode: "Research 50% V2", normalStake: 1.00, stakeFactor: 0.5, reductionReason: "Warning signal" },
  { amount: 0.53, version: "Legacy", conviction: "Low", stakeMode: "Contra 50%", strategyType: "Contra", normalStake: 1.00, stakeFactor: 0.5, reductionReason: "Contra signal" },
  { amount: 0.59, version: "V2", conviction: "Low", stakeMode: "Contra 50% V2", strategyType: "Contra", normalStake: 1.00, stakeFactor: 0.5, reductionReason: "Contra signal" },
  { amount: 0.63, version: "Legacy", conviction: "High", stakeMode: "Research 25%", normalStake: 2.50, stakeFactor: 0.25, reductionReason: "Warning signal" },
  { amount: 0.67, version: "Legacy", conviction: "High", stakeMode: "Contra 25%", strategyType: "Contra", normalStake: 2.50, stakeFactor: 0.25, reductionReason: "Contra signal" },
  { amount: 0.69, version: "V2", conviction: "High", stakeMode: "Research 25% V2", normalStake: 2.50, stakeFactor: 0.25, reductionReason: "Warning signal" },
  { amount: 0.75, version: "Legacy", conviction: "Medium", stakeMode: "Research 50%", normalStake: 1.50, stakeFactor: 0.5, reductionReason: "Warning signal" },
  { amount: 0.78, version: "V2", conviction: "Medium", stakeMode: "Research 50% V2", normalStake: 1.50, stakeFactor: 0.5, reductionReason: "Warning signal" },
  { amount: 0.82, version: "Legacy", conviction: "Medium", stakeMode: "Contra 50%", strategyType: "Contra", normalStake: 1.50, stakeFactor: 0.5, reductionReason: "Contra signal" },
  { amount: 0.86, version: "V2", conviction: "Medium", stakeMode: "Contra 50% V2", strategyType: "Contra", normalStake: 1.50, stakeFactor: 0.5, reductionReason: "Contra signal" },
  { amount: 1.00, version: "Base", conviction: "Low", stakeMode: "Normal", normalStake: 1.00, stakeFactor: 1, reductionReason: "" },
  { amount: 1.07, version: "Legacy", conviction: "Low", stakeMode: "Contra Normal", strategyType: "Contra", normalStake: 1.00, stakeFactor: 1, reductionReason: "Contra signal" },
  { amount: 1.11, version: "V2", conviction: "Low", stakeMode: "Contra Normal V2", strategyType: "Contra", normalStake: 1.00, stakeFactor: 1, reductionReason: "Contra signal" },
  { amount: 1.24, version: "V2", conviction: "High", stakeMode: "Research 50% V2", normalStake: 2.50, stakeFactor: 0.5, reductionReason: "Warning signal" },
  { amount: 1.25, version: "Legacy", conviction: "High", stakeMode: "Research 50%", normalStake: 2.50, stakeFactor: 0.5, reductionReason: "Warning signal" },
  { amount: 1.32, version: "Legacy", conviction: "High", stakeMode: "Contra 50%", strategyType: "Contra", normalStake: 2.50, stakeFactor: 0.5, reductionReason: "Contra signal" },
  { amount: 1.36, version: "V2", conviction: "High", stakeMode: "Contra 50% V2", strategyType: "Contra", normalStake: 2.50, stakeFactor: 0.5, reductionReason: "Contra signal" },
  { amount: 1.50, version: "Base", conviction: "Medium", stakeMode: "Normal", normalStake: 1.50, stakeFactor: 1, reductionReason: "" },
  { amount: 1.62, version: "Legacy", conviction: "Medium", stakeMode: "Contra Normal", strategyType: "Contra", normalStake: 1.50, stakeFactor: 1, reductionReason: "Contra signal" },
  { amount: 1.64, version: "V2", conviction: "Medium", stakeMode: "Contra Normal V2", strategyType: "Contra", normalStake: 1.50, stakeFactor: 1, reductionReason: "Contra signal" },
  { amount: 1.88, version: "Legacy", conviction: "Medium", stakeMode: "Increased 25%", normalStake: 1.50, stakeFactor: 1.25, reductionReason: "" },
  { amount: 1.91, version: "V2", conviction: "Medium", stakeMode: "Increased 25% V2", normalStake: 1.50, stakeFactor: 1.25, reductionReason: "" },
  { amount: 2.25, version: "Legacy", conviction: "Medium", stakeMode: "Increased 50%", normalStake: 1.50, stakeFactor: 1.5, reductionReason: "" },
  { amount: 2.27, version: "V2", conviction: "Medium", stakeMode: "Increased 50% V2", normalStake: 1.50, stakeFactor: 1.5, reductionReason: "" },
  { amount: 2.50, version: "Base", conviction: "High", stakeMode: "Normal", normalStake: 2.50, stakeFactor: 1, reductionReason: "" },
  { amount: 2.67, version: "Legacy", conviction: "High", stakeMode: "Contra Normal", strategyType: "Contra", normalStake: 2.50, stakeFactor: 1, reductionReason: "Contra signal" },
  { amount: 2.68, version: "V2", conviction: "High", stakeMode: "Contra Normal V2", strategyType: "Contra", normalStake: 2.50, stakeFactor: 1, reductionReason: "Contra signal" },
  { amount: 3.13, version: "Legacy", conviction: "High", stakeMode: "Increased 25%", normalStake: 2.50, stakeFactor: 1.25, reductionReason: "" },
  { amount: 3.16, version: "V2", conviction: "High", stakeMode: "Increased 25% V2", normalStake: 2.50, stakeFactor: 1.25, reductionReason: "" },
  { amount: 3.75, version: "Legacy", conviction: "High", stakeMode: "Increased 50%", normalStake: 2.50, stakeFactor: 1.5, reductionReason: "" },
  { amount: 3.77, version: "V2", conviction: "High", stakeMode: "Increased 50% V2", normalStake: 2.50, stakeFactor: 1.5, reductionReason: "" },
  { amount: 5.00, version: "Special", conviction: "Special", stakeMode: "Special", strategyType: "Special", normalStake: 5.00, stakeFactor: null, reductionReason: "Outside focus strategy" },
];

const germanReason = {
  "Warning signal": "Warnsignal",
  "Contra signal": "Kontra-Signal",
  "Outside focus strategy": "Ausserhalb Fokusstrategie",
};

const germanMode = {
  "Increased 25%": "Erhoeht 25%",
  "Increased 50%": "Erhoeht 50%",
  "Increased 25% V2": "Erhoeht 25% V2",
  "Increased 50% V2": "Erhoeht 50% V2",
  "Special": "Sonderfall",
};

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function publicProfile(profile, locale) {
  const normalized = {
    conviction: profile.conviction === "Special" && locale === "de" ? "Sonderfall" : profile.conviction,
    stakeMode: locale === "de" ? germanMode[profile.stakeMode] ?? profile.stakeMode : profile.stakeMode,
    strategyType: profile.strategyType === "Special" && locale === "de" ? "Sonderfall" : profile.strategyType ?? "Main",
    normalStake: profile.normalStake,
    stakeFactor: profile.stakeFactor,
    reductionReason: locale === "de" ? germanReason[profile.reductionReason] ?? profile.reductionReason : profile.reductionReason,
  };
  return normalized;
}

export function validateStakeProfiles(profiles = stakeProfiles.filter((profile) => profile.version === "V2")) {
  const sorted = [...profiles].sort((a, b) => a.amount - b.amount);
  const gaps = sorted.slice(1).map((profile, index) => ({
    a: sorted[index].amount,
    b: profile.amount,
    gap: round2(profile.amount - sorted[index].amount),
  }));
  const minGap = gaps.length ? Math.min(...gaps.map((gap) => gap.gap)) : Infinity;
  return { minGap, clear: minGap > STAKE_TOLERANCE * 2, gaps: gaps.filter((gap) => gap.gap <= STAKE_TOLERANCE * 2) };
}

export function classifyStake(stake, options = {}) {
  const s = round2(stake);
  if (!Number.isFinite(s)) throw new Error(`Invalid stake amount: ${stake}`);
  const matches = stakeProfiles
    .map((profile) => ({ profile, distance: Math.abs(s - profile.amount) }))
    .filter((item) => item.distance <= STAKE_TOLERANCE + 1e-9)
    .sort((a, b) => a.distance - b.distance);
  if (!matches.length) throw new Error(`Unrecognized stake code: ${s.toFixed(2)}`);
  if (matches[1] && Math.abs(matches[0].distance - matches[1].distance) < 1e-9) {
    throw new Error(`Ambiguous stake code: ${s.toFixed(2)}`);
  }
  return publicProfile(matches[0].profile, options.locale);
}

export function assertKnownStakeCodes(bets, options = {}) {
  const issues = [];
  for (const bet of bets) {
    try {
      classifyStake(bet.stake, options);
    } catch (error) {
      issues.push({
        stake: Number(bet.stake).toFixed(2),
        betId: bet.betId ?? "",
        created: bet.created ?? "",
        game: bet.game ?? "",
        message: error.message,
      });
    }
  }
  if (issues.length) {
    const preview = issues.slice(0, 10).map((issue) => `${issue.message} | ${issue.created} | ${issue.game} | ${issue.betId}`).join("\n");
    throw new Error(`Stake classification guard failed for ${issues.length} bet(s).\n${preview}`);
  }
}
