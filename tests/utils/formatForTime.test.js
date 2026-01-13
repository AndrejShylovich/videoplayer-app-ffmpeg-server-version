import { formatForTime } from "../../app/utils/formatForTime";
import { describe, it, expect } from "vitest";

describe("formatForTime", () => {
  it("returns 0:00.000 by default", () => {
    expect(formatForTime()).toBe("0:00.000");
  });

  it("handles NaN", () => {
    expect(formatForTime(NaN)).toBe("0:00.000");
  });

  it("formats seconds only", () => {
    expect(formatForTime(5)).toBe("0:05.000");
    expect(formatForTime(5.123)).toBe("0:05.123");
  });

  it("correctly formats minutes and seconds", () => {
    expect(formatForTime(65)).toBe("1:05.000");
    expect(formatForTime(125.456)).toBe("2:05.456");
  });

  it("correctly formats hours", () => {
    expect(formatForTime(3600)).toBe("1:00:00.000");
    expect(formatForTime(3661.789)).toBe("1:01:01.789");
  });

  it("rounds milliseconds down correctly", () => {
    expect(formatForTime(1.9999)).toBe("0:01.999");
  });

  it("works with zero", () => {
    expect(formatForTime(0)).toBe("0:00.000");
  });

  it("works with large values", () => {
    expect(formatForTime(7325.004)).toBe("2:02:05.004");
  });
});
