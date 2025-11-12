import { describe, expect, it } from "vitest";
import { computeTierFromWpm, formatDuration } from "./stats";

describe("computeTierFromWpm", () => {
  it("returns S+ for elite speeds", () => {
    expect(computeTierFromWpm(160)).toBe("S+");
  });

  it("downgrades tiers according to thresholds", () => {
    expect(computeTierFromWpm(130)).toBe("S");
    expect(computeTierFromWpm(118)).toBe("A+");
    expect(computeTierFromWpm(108)).toBe("A");
    expect(computeTierFromWpm(97)).toBe("B");
    expect(computeTierFromWpm(88)).toBe("C");
  });

  it("defaults to D for low or missing values", () => {
    expect(computeTierFromWpm(0)).toBe("D");
    expect(computeTierFromWpm(-10)).toBe("D");
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

