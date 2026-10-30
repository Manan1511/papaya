import { readFileSync } from "node:fs";
import { type IntrospectionQuery, buildClientSchema, parse, validate } from "graphql";
import { describe, expect, it } from "vitest";
import * as documents from "./documents";

// Every document is checked against the Storefront schema shipped in @shopify/hydrogen-react,
// the 2026-04 API the runtime pins. A wrong field or argument fails here, not at checkout.
const introspection = JSON.parse(
  readFileSync("node_modules/@shopify/hydrogen-react/storefront.schema.json", "utf8"),
) as IntrospectionQuery;
// assumeValid skips graphql-js's own check of the schema, which rejects a deprecation flag in
// Shopify's introspection file. The documents are still validated in full below.
const schema = buildClientSchema(introspection, { assumeValid: true });

describe("Storefront documents", () => {
  for (const [name, source] of Object.entries(documents)) {
    it(`${name} validates against the pinned schema`, () => {
      const errors = validate(schema, parse(source));
      expect(errors.map((error) => error.message)).toEqual([]);
    });
  }
});
