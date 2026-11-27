import { describe, expect, it } from "vitest";
import { drawingFor } from "./category-icon";

describe("drawingFor", () => {
  it("tells earrings from rings and a style from a kind of piece", () => {
    expect(["Necklaces", "Earrings", "Rings", "Bracelets", "Anklets"].map(drawingFor)).toEqual([
      "necklace",
      "earrings",
      "ring",
      "bracelet",
      "anklet",
    ]);
    expect(drawingFor("The long edits")).toBe("long");
    expect(drawingFor("Everyday Minimal Jewellery")).toBe("minimal");
  });

  it("has no drawing for a name it doesn't know", () => {
    expect(drawingFor("The Amalfi Edit")).toBeNull();
    expect(drawingFor("Spring Offers")).toBeNull();
  });
});
