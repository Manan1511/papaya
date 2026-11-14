import { describe, expect, it } from "vitest";
import { fromPaise, toPaise } from "./money";

describe("toPaise", () => {
  it("reads rupee strings without floating point drift", () => {
    expect(toPaise("1299.99")).toBe(129999);
    expect(toPaise("1099.99")).toBe(109999);
    expect(toPaise("0.07")).toBe(7);
  });

  it("handles whole rupees and one decimal place", () => {
    expect(toPaise("100")).toBe(10000);
    expect(toPaise("0.5")).toBe(50);
    expect(toPaise("1299.0")).toBe(129900);
  });

  it("allows trailing zeros past the second decimal", () => {
    expect(toPaise("1299.500")).toBe(129950);
  });

  it("refuses an amount that would need rounding", () => {
    expect(() => toPaise("1299.995")).toThrow();
  });

  it("refuses anything that is not a plain amount", () => {
    expect(() => toPaise("")).toThrow();
    expect(() => toPaise("abc")).toThrow();
    expect(() => toPaise("-5.00")).toThrow();
    expect(() => toPaise("1,299.00")).toThrow();
  });
});

describe("fromPaise", () => {
  it("writes paise as a two-decimal rupee string", () => {
    expect(fromPaise(129999)).toBe("1299.99");
    expect(fromPaise(10000)).toBe("100.00");
    expect(fromPaise(5)).toBe("0.05");
    expect(fromPaise(0)).toBe("0.00");
  });

  it("refuses values that are not whole non-negative paise", () => {
    expect(() => fromPaise(1.5)).toThrow();
    expect(() => fromPaise(-1)).toThrow();
  });

  it("round-trips with toPaise", () => {
    for (const paise of [1, 99, 100, 109999, 129999, 99999999]) expect(toPaise(fromPaise(paise))).toBe(paise);
  });
});
