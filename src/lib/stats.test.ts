import { describe, expect, it } from "vitest";
import { computeTierFromWpm, formatDuration, calculateAdjustedWpm } from "./stats";

describe("calculateAdjustedWpm", () => {
  it("multiplies WPM by accuracy percentage", () => {
    expect(calculateAdjustedWpm(100, 100)).toBe(100);
    expect(calculateAdjustedWpm(100, 50)).toBe(50);
    expect(calculateAdjustedWpm(100, 75)).toBe(75);
    expect(calculateAdjustedWpm(120, 90)).toBe(108);
  });

  it("handles edge cases", () => {
    expect(calculateAdjustedWpm(100, 0)).toBe(0);
    expect(calculateAdjustedWpm(100, 150)).toBe(100); // Clamped to 100%
    expect(calculateAdjustedWpm(100, -10)).toBe(0); // Clamped to 0%
  });
});

describe("computeTierFromWpm", () => {
  it("returns S+ for elite speeds", () => {
    expect(computeTierFromWpm(160)).toBe("S+");
    expect(computeTierFromWpm(150, 100)).toBe("S+");
  });

  it("downgrades tiers according to thresholds", () => {
    expect(computeTierFromWpm(130)).toBe("S");
    expect(computeTierFromWpm(118)).toBe("A+");
    expect(computeTierFromWpm(108)).toBe("A");
    expect(computeTierFromWpm(97)).toBe("B");
    expect(computeTierFromWpm(88)).toBe("C");
  });

  it("adjusts tier based on accuracy", () => {
    // 150 WPM with 80% accuracy = 120 adjusted WPM = A+ tier
    expect(computeTierFromWpm(150, 80)).toBe("A+");
    // 150 WPM with 50% accuracy = 75 adjusted WPM = C tier
    expect(computeTierFromWpm(150, 50)).toBe("C");
    // 100 WPM with 100% accuracy = 100 WPM = A tier
    expect(computeTierFromWpm(100, 100)).toBe("A");
  });

  it("defaults to D for low or missing values", () => {
    expect(computeTierFromWpm(0)).toBe("D");
    expect(computeTierFromWpm(-10)).toBe("D");
    expect(computeTierFromWpm(50, 50)).toBe("D");
  });
});

describe("formatDuration", () => {
  it("handles zero or undefined values", () => {
    expect(formatDuration(0)).toBe("0 min");
    expect(formatDuration(undefined)).toBe("0 min");
    expect(formatDuration(null)).toBe("0 min");
  });

  it("returns minutes for short durations", () => {
    expect(formatDuration(300)).toBe("5m");
  });

  it("returns hours and minutes for long durations", () => {
    expect(formatDuration(3660)).toBe("1h 1m");
    expect(formatDuration(7200)).toBe("2h");
  });
});

