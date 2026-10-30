"use server";

import { z } from "zod";
import { searchProducts } from "../shopify/catalog";
import type { ProductSummary } from "../shopify/schemas";

const querySchema = z.string().trim().min(2).max(120);

// Quick results while the shopper types. The full list lives on /search.
export async function suggestProducts(query: string): Promise<{ products: ProductSummary[] }> {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success) return { products: [] };
  const results = await searchProducts(parsed.data);
  return { products: results.nodes.slice(0, 6) };
}
