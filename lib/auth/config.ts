import "server-only";
import { z } from "zod";

const adminEnv = z.object({
  ADMIN_PASSWORD_HASH: z.string().startsWith("scrypt:"),
  SESSION_SECRET: z.string().min(32),
});

export type AdminAuthConfig = { passwordHash: string; sessionSecret: string };

// Null until both values are set. The storefront doesn't depend on them, and the admin stays
// closed until they are.
export function getAdminAuthConfig(): AdminAuthConfig | null {
  const parsed = adminEnv.safeParse(process.env);
  if (!parsed.success) return null;
  return { passwordHash: parsed.data.ADMIN_PASSWORD_HASH, sessionSecret: parsed.data.SESSION_SECRET };
}
