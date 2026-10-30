import { describe, expect, it } from "vitest";
import { freeShippingProgress } from "./shipping";

describe("freeShippingProgress", () => {
  it("shows nothing when no threshold is set", () => {
    expect(freeShippingProgress(500, null)).toBeNull();
  });

  it("reports the remaining amount and the percentage reached", () => {
    expect(freeShippingProgress(500, 2000)).toEqual({ remaining: 1500, percent: 25 });
  });

  it("caps the bar once the threshold is passed", () => {
    expect(freeShippingProgress(3000, 2000)).toEqual({ remaining: 0, percent: 100 });
  });
});
