import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuthConfig } from "./config";

const SESSION_SECONDS = 12 * 60 * 60;

type AdminSession = { signedInAt?: number };

async function currentSession() {
  const config = getAdminAuthConfig();
  if (!config) return undefined;

  return getIronSession<AdminSession>(await cookies(), {
    password: config.sessionSecret,
    cookieName: "papaya_admin",
    ttl: SESSION_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    },
  });
}

// True only for a session signed in within the last 12 hours. Admin pages and actions call this
// themselves, because layouts don't re-run on every navigation.
export async function isAdminSession(): Promise<boolean> {
  const session = await currentSession();
  const signedInAt = session?.signedInAt;
  return signedInAt !== undefined && Date.now() - signedInAt < SESSION_SECONDS * 1000;
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) redirect("/admin/login");
}

export async function startAdminSession(): Promise<void> {
  const session = await currentSession();
  if (!session) throw new Error("Admin sign-in isn't configured");
  session.signedInAt = Date.now();
  await session.save();
}

export async function endAdminSession(): Promise<void> {
  const session = await currentSession();
  session?.destroy();
}
