import "server-only";
import { type ZodType, z } from "zod";
import { getEnv } from "../env";

// Catalog reads stay cached until a webhook revalidates their tags. The hour is a fallback
// for a webhook that never arrives.
const CATALOG_REVALIDATE_SECONDS = 60 * 60;

export class StorefrontError extends Error {}

export type CacheMode = { tags: string[] } | "no-store";

const envelope = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

// Sends one GraphQL document to the Storefront API and returns its data, parsed by `schema`.
export async function storefront<T>(
  query: string,
  schema: ZodType<T>,
  variables: Record<string, unknown>,
  cache: CacheMode,
): Promise<T> {
  const env = getEnv();
  const init: RequestInit & { next?: { tags: string[]; revalidate: number } } = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  };

  if (cache === "no-store") {
    init.cache = "no-store";
  } else {
    init.cache = "force-cache";
    init.next = { tags: cache.tags, revalidate: CATALOG_REVALIDATE_SECONDS };
  }

  const url = `https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_API_VERSION}/graphql.json`;
  const response = await fetch(url, init);
  if (!response.ok) throw new StorefrontError(`Storefront API responded ${response.status}`);

  const { data, errors } = envelope.parse(await response.json());
  if (errors?.length) throw new StorefrontError(`Storefront API error: ${errors[0].message}`);
  return schema.parse(data);
}
