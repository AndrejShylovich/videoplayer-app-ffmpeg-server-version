import { describe, it, expect } from "vitest";
import { clamp } from "../../app/utils/clamp";

describe("clamp", () => {
  it("limits a value within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min if value is below the range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max if value is above the range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("works when min === max", () => {
    expect(clamp(5, 3, 3)).toBe(3);
    expect(clamp(3, 3, 3)).toBe(3);
  });

  it("handles swapped min and max correctly", () => {
    expect(clamp(5, 10, 0)).toBe(5);
    expect(clamp(-5, 10, 0)).toBe(0);
    expect(clamp(15, 10, 0)).toBe(10);
  });

  it("works with negative ranges", () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });

  it("works with floating point numbers", () => {
    expect(clamp(1.5, 1, 2)).toBe(1.5);
    expect(clamp(0.5, 1, 2)).toBe(1);
    expect(clamp(2.5, 1, 2)).toBe(2);
  });

  it("handles Infinity correctly", () => {
    expect(clamp(Infinity, 0, 10)).toBe(10);
    expect(clamp(-Infinity, 0, 10)).toBe(0);
  });

  it("returns NaN if the value is NaN", () => {
    expect(clamp(NaN, 0, 10)).toBeNaN();
  });
});
