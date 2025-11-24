import { describe, expect, it } from "vitest";
import {
  getCredibilityTier,
  getCredibilityBoost,
  calculateCredibilityScore,
  getCredibilityTierName,
} from "./credibility";

describe("getCredibilityTier", () => {
  it("returns low for less than 3 tests", () => {
    expect(getCredibilityTier(0)).toBe("low");
    expect(getCredibilityTier(1)).toBe("low");
    expect(getCredibilityTier(2)).toBe("low");
  });

  it("returns bronze for 3-5 tests", () => {
    expect(getCredibilityTier(3)).toBe("bronze");
    expect(getCredibilityTier(4)).toBe("bronze");
    expect(getCredibilityTier(5)).toBe("bronze");
  });

  it("returns silver for 6-20 tests", () => {
    expect(getCredibilityTier(6)).toBe("silver");
    expect(getCredibilityTier(10)).toBe("silver");
    expect(getCredibilityTier(20)).toBe("silver");
  });

  it("returns gold for 21-50 tests", () => {
    expect(getCredibilityTier(21)).toBe("gold");
    expect(getCredibilityTier(35)).toBe("gold");
    expect(getCredibilityTier(50)).toBe("gold");
  });

  it("returns platinum for 51+ tests", () => {
    expect(getCredibilityTier(51)).toBe("platinum");
    expect(getCredibilityTier(100)).toBe("platinum");
    expect(getCredibilityTier(1000)).toBe("platinum");
  });
});

describe("getCredibilityBoost", () => {
  it("returns 0% for low credibility", () => {
    expect(getCredibilityBoost(0)).toBe(0);
    expect(getCredibilityBoost(1)).toBe(0);
    expect(getCredibilityBoost(2)).toBe(0);
  });

  it("returns 2% for bronze", () => {
    expect(getCredibilityBoost(3)).toBe(2);
    expect(getCredibilityBoost(5)).toBe(2);
  });

  it("returns 5% for silver", () => {
    expect(getCredibilityBoost(6)).toBe(5);
    expect(getCredibilityBoost(20)).toBe(5);
  });

  it("returns 10% for gold", () => {
    expect(getCredibilityBoost(21)).toBe(10);
    expect(getCredibilityBoost(50)).toBe(10);
  });

  it("returns 15% for platinum", () => {
    expect(getCredibilityBoost(51)).toBe(15);
    expect(getCredibilityBoost(100)).toBe(15);
  });
});

describe("calculateCredibilityScore", () => {
  it("applies no boost for low credibility", () => {
    expect(calculateCredibilityScore(100, 0)).toBe(100);
    expect(calculateCredibilityScore(100, 2)).toBe(100);
  });

  it("applies 2% boost for bronze", () => {
    expect(calculateCredibilityScore(100, 3)).toBe(102);
    expect(calculateCredibilityScore(100, 5)).toBe(102);
  });

  it("applies 5% boost for silver", () => {
    expect(calculateCredibilityScore(100, 6)).toBe(105);
    expect(calculateCredibilityScore(100, 20)).toBe(105);
  });

  it("applies 10% boost for gold", () => {
    expect(calculateCredibilityScore(100, 21)).toBe(110);
    expect(calculateCredibilityScore(100, 50)).toBe(110);
  });

  it("applies 15% boost for platinum", () => {
    expect(calculateCredibilityScore(100, 51)).toBe(115);
    expect(calculateCredibilityScore(100, 100)).toBe(115);
  });

  it("rounds to nearest integer", () => {
    expect(calculateCredibilityScore(100, 6)).toBe(105); // 100 * 1.05 = 105
    expect(calculateCredibilityScore(97, 6)).toBe(102); // 97 * 1.05 = 101.85 ≈ 102
  });
});

describe("getCredibilityTierName", () => {
  it("returns correct display names", () => {
    expect(getCredibilityTierName("low")).toBe("Low Credibility");
    expect(getCredibilityTierName("bronze")).toBe("Bronze");
    expect(getCredibilityTierName("silver")).toBe("Silver");
    expect(getCredibilityTierName("gold")).toBe("Gold");
    expect(getCredibilityTierName("platinum")).toBe("Platinum");
  });
});

