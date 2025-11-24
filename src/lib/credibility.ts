/**
 * Credibility rating system based on test count
 * More tests = higher credibility = better ranking boost
 */

export type CredibilityTier = "low" | "bronze" | "silver" | "gold" | "platinum";

/**
 * Get credibility tier based on test count
 * @param testCount Number of tests submitted
 * @returns Credibility tier string
 */
export const getCredibilityTier = (testCount: number): CredibilityTier => {
  if (testCount < 3) return "low";
  if (testCount <= 5) return "bronze";
  if (testCount <= 20) return "silver";
  if (testCount <= 50) return "gold";
  return "platinum";
};

/**
 * Get credibility boost percentage based on test count
 * @param testCount Number of tests submitted
 * @returns Percentage boost (0-15)
 */
export const getCredibilityBoost = (testCount: number): number => {
  const tier = getCredibilityTier(testCount);
  switch (tier) {
    case "low":
      return 0; // No boost for low credibility
    case "bronze":
      return 2; // +2% boost
    case "silver":
      return 5; // +5% boost
    case "gold":
      return 10; // +10% boost
    case "platinum":
      return 15; // +15% boost
  }
};

/**
 * Calculate credibility-adjusted score by applying boost to base WPM
 * @param baseWpm Base WPM score (already adjusted for accuracy)
 * @param testCount Number of tests submitted
 * @returns Boosted WPM score
 */
export const calculateCredibilityScore = (baseWpm: number, testCount: number): number => {
  const boost = getCredibilityBoost(testCount);
  return Math.round(baseWpm * (1 + boost / 100));
};

/**
 * Get display name for credibility tier
 * @param tier Credibility tier
 * @returns Human-readable tier name
 */
export const getCredibilityTierName = (tier: CredibilityTier): string => {
  switch (tier) {
    case "low":
      return "Low Credibility";
    case "bronze":
      return "Bronze";
    case "silver":
      return "Silver";
    case "gold":
      return "Gold";
    case "platinum":
      return "Platinum";
  }
};

