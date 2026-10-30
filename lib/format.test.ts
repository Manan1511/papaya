import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("shows whole rupees with Indian grouping", () => {
    expect(formatPrice({ amount: "2499.0", currencyCode: "INR" })).toBe("₹2,499");
  });

  it("keeps paise when they are present", () => {
    expect(formatPrice({ amount: "1999.5", currencyCode: "INR" })).toBe("₹1,999.5");
  });
});
