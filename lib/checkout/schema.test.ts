import { describe, expect, it } from "vitest";
import { checkoutFormSchema, INDIAN_STATES, stateName } from "./schema";

const valid = {
  name: "Asha Rao",
  email: "Asha@Example.com",
  phone: "98765 43210",
  address1: "12 Marine Drive",
  address2: "",
  city: "Mumbai",
  state: "MH",
  pin: "400001",
};

describe("checkoutFormSchema", () => {
  it("accepts a complete address and tidies it", () => {
    const result = checkoutFormSchema.parse(valid);
    expect(result).toMatchObject({ email: "asha@example.com", phone: "9876543210", address2: "" });
  });

  it("takes phone numbers however they were typed", () => {
    for (const typed of ["+91 98765 43210", "+919876543210", "919876543210", "09876543210", "98765-43210", "(98765) 43210"]) {
      expect(checkoutFormSchema.parse({ ...valid, phone: typed }).phone).toBe("9876543210");
    }
  });

  it("refuses numbers that aren't Indian mobiles", () => {
    for (const phone of ["12345", "1234567890", "98765432101", ""]) {
      expect(checkoutFormSchema.safeParse({ ...valid, phone }).success).toBe(false);
    }
  });

  it("needs a six-digit PIN that doesn't start with zero", () => {
    expect(checkoutFormSchema.safeParse({ ...valid, pin: "040001" }).success).toBe(false);
    expect(checkoutFormSchema.safeParse({ ...valid, pin: "4000" }).success).toBe(false);
  });

  it("needs a known state", () => {
    expect(checkoutFormSchema.safeParse({ ...valid, state: "ZZ" }).success).toBe(false);
    expect(checkoutFormSchema.safeParse({ ...valid, state: "" }).success).toBe(false);
  });

  it("needs a real email, name and street", () => {
    expect(checkoutFormSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(checkoutFormSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
    expect(checkoutFormSchema.safeParse({ ...valid, address1: "  " }).success).toBe(false);
  });

  it("keeps fields short enough for the order notes", () => {
    expect(checkoutFormSchema.safeParse({ ...valid, address1: "x".repeat(101) }).success).toBe(false);
  });
});

describe("states", () => {
  it("lists each code once", () => {
    const codes = INDIAN_STATES.map((state) => state.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("looks up a state's name from its code", () => {
    expect(stateName("MH")).toBe("Maharashtra");
  });
});
