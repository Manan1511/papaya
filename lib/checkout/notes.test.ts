import { describe, expect, it } from "vitest";
import { NotesTooLargeError, ORDER_DONE_KEY, type OrderDraft, packNotes, unpackNotes } from "./notes";

const variant = (n: number) => `gid://shopify/ProductVariant/${41000000000000 + n}`;

function draft(overrides: Partial<OrderDraft> = {}): OrderDraft {
  return {
    lines: [
      { variantId: variant(1), quantity: 2 },
      { variantId: variant(2), quantity: 1 },
    ],
    name: "Asha Rao",
    email: "asha@example.com",
    phone: "9876543210",
    address1: "12 Marine Drive",
    address2: "Flat 4B",
    city: "Mumbai",
    state: "MH",
    pin: "400001",
    discountCode: "SUMMER",
    discountPaise: 20000,
    shippingPaise: 9900,
    ...overrides,
  };
}

describe("order notes", () => {
  it("rebuilds the order from what was packed", () => {
    expect(unpackNotes(packNotes(draft()))).toEqual(draft());
  });

  it("keeps an empty second address line and an empty discount code", () => {
    const plain = draft({ address2: "", discountCode: "", discountPaise: 0, shippingPaise: 0 });
    expect(unpackNotes(packNotes(plain))).toEqual(plain);
  });

  it("stays inside Razorpay's limits, with room for the order-done note", () => {
    const notes = packNotes(draft());
    expect(Object.keys(notes).length + 1).toBeLessThanOrEqual(15);
    expect(ORDER_DONE_KEY).not.toBeUndefined();
    for (const value of Object.values(notes)) expect(value.length).toBeLessThanOrEqual(250);
  });

  it("spreads many lines over several notes without splitting an entry", () => {
    const lines = Array.from({ length: 30 }, (_, i) => ({ variantId: variant(i), quantity: (i % 9) + 1 }));
    const notes = packNotes(draft({ lines }));
    expect(notes.l2).toBeDefined();
    for (const key of ["l1", "l2", "l3"]) {
      for (const entry of (notes[key] ?? "").split(",").filter(Boolean)) expect(entry).toMatch(/^\d+:\d+$/);
    }
    expect(unpackNotes(notes)?.lines).toEqual(lines);
  });

  it("refuses an order with more lines than the notes can hold", () => {
    const lines = Array.from({ length: 60 }, (_, i) => ({ variantId: variant(i), quantity: 1 }));
    expect(() => packNotes(draft({ lines }))).toThrow(NotesTooLargeError);
  });

  it("refuses a field that would be cut off", () => {
    expect(() => packNotes(draft({ address1: "x".repeat(251) }))).toThrow(NotesTooLargeError);
  });

  it("returns null when the notes don't describe a whole order", () => {
    const notes = packNotes(draft());
    expect(unpackNotes({})).toBeNull();
    expect(unpackNotes({ ...notes, em: "" })).toBeNull();
    expect(unpackNotes({ ...notes, dd: "-5" })).toBeNull();
    expect(unpackNotes({ ...notes, l1: "41000000000001:x" })).toBeNull();
    const { l1: _gone, ...noLines } = notes;
    expect(unpackNotes(noLines)).toBeNull();
  });
});
