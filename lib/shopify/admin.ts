import "server-only";
import { type ZodType, z } from "zod";
import { getEnv } from "../env";

// Published CMS content is cached until a publish revalidates its tag. The hour is a fallback.
const CMS_REVALIDATE_SECONDS = 60 * 60;

// Client-credentials tokens last 24 hours. A new one is minted five minutes before the old expires.
const REFRESH_MARGIN_MS = 5 * 60 * 1000;
const DEFAULT_TOKEN_SECONDS = 24 * 60 * 60;

export class AdminError extends Error {}

export type AdminCacheMode = { tags: string[] } | "no-store";

const credentials = z.object({
  SHOPIFY_CLIENT_ID: z.string().min(1),
  SHOPIFY_CLIENT_SECRET: z.string().min(1),
});

const tokenResponse = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive().optional(),
});

const envelope = z.object({
  data: z.unknown().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

let token: { value: string; expiresAt: number } | undefined;
let minting: Promise<string> | undefined;

async function mintToken(): Promise<string> {
  const env = getEnv();
  const parsed = credentials.safeParse(process.env);
  if (!parsed.success) throw new AdminError("Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET");

  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: parsed.data.SHOPIFY_CLIENT_ID,
      client_secret: parsed.data.SHOPIFY_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new AdminError(`Admin token request responded ${response.status}`);

  const { access_token, expires_in } = tokenResponse.parse(await response.json());
  const lifetimeMs = (expires_in ?? DEFAULT_TOKEN_SECONDS) * 1000;
  token = { value: access_token, expiresAt: Date.now() + lifetimeMs - REFRESH_MARGIN_MS };
  return access_token;
}

// Concurrent callers share one token request instead of each minting a token.
async function accessToken(): Promise<string> {
  if (token && Date.now() < token.expiresAt) return token.value;
  minting ??= mintToken().finally(() => {
    minting = undefined;
  });
  return minting;
}

// Sends one GraphQL document to the Admin API and returns its data, parsed by `schema`. Use
// "no-store" for anything that can include drafts or private data: a cached draft could reach a
// public page that shares the same request.
export async function adminRequest<T>(
  query: string,
  schema: ZodType<T>,
  variables: Record<string, unknown>,
  cache: AdminCacheMode,
): Promise<T> {
  const env = getEnv();
  const init: RequestInit & { next?: { tags: string[]; revalidate: number } } = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": await accessToken(),
    },
    body: JSON.stringify({ query, variables }),
  };

  if (cache === "no-store") {
    init.cache = "no-store";
  } else {
    init.cache = "force-cache";
    init.next = { tags: cache.tags, revalidate: CMS_REVALIDATE_SECONDS };
  }

  const url = `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/${env.SHOPIFY_API_VERSION}/graphql.json`;
  const response = await fetch(url, init);
  if (!response.ok) throw new AdminError(`Admin API responded ${response.status}`);

  const { data, errors } = envelope.parse(await response.json());
  if (errors?.length) throw new AdminError(`Admin API error: ${errors[0].message}`);
  return schema.parse(data);
}
