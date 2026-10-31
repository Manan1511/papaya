"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuthConfig } from "../../lib/auth/config";
import { verifyPassword } from "../../lib/auth/password";
import { endAdminSession, startAdminSession } from "../../lib/auth/session";
import { clearFailures, loginLocked, recordFailure } from "../../lib/auth/throttle";

export type SignInState = { error?: string };

// Only the address Netlify reports is used. Other headers come from the client, and a client
// could change them on every attempt, which would defeat the limit.
async function clientKey(): Promise<string> {
  return (await headers()).get("x-nf-client-connection-ip") ?? "unknown";
}

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const config = getAdminAuthConfig();
  if (!config) return { error: "Admin sign-in isn't set up yet." };

  const key = await clientKey();
  if (loginLocked(key)) return { error: "Too many attempts. Wait 15 minutes, then try again." };

  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0 || password.length > 256) {
    return { error: "Enter the password." };
  }

  if (!(await verifyPassword(password, config.passwordHash))) {
    recordFailure(key);
    return { error: "That password isn't right." };
  }

  clearFailures(key);
  await startAdminSession();
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}
