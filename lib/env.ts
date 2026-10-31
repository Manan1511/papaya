import { z } from "zod";

const envSchema = z.object({
  SHOPIFY_STORE_DOMAIN: z.string().regex(/^[a-z0-9-]+\.myshopify\.com$/),
  // Pinned to the Storefront schema the tests validate against (lib/shopify/schema.test.ts).
  SHOPIFY_API_VERSION: z.string().regex(/^\d{4}-\d{2}$/).default("2026-04"),
  SHOPIFY_STOREFRONT_PRIVATE_TOKEN: z.string().min(1),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

// Pure and uncached so callers and tests choose the source. Errors name the
// failing variables, never their values, so secrets stay out of logs.
export function parseEnv(source: Record<string, string | undefined>): Env {
  // A blank line in .env.local, copied from .env.example, means the variable is unset.
  const values = Object.fromEntries(Object.entries(source).map(([key, value]) => [key, value || undefined]));
  const result = envSchema.safeParse(values);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid environment: ${names}`);
  }
  return result.data;
}

let cached: Env | undefined;

// Parsed on first use, so pages that never touch Shopify don't need the variables.
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
