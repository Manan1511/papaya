import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "../../../components/ui/card";
import { isAdminSession } from "../../../lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

export default async function AdminLogin() {
  if (await isAdminSession()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <Card className="w-full max-w-sm space-y-6">
        <h1 className="font-headline text-headline-md text-on-surface">Papaya admin</h1>
        <p className="font-body text-body-md text-on-surface-variant">Enter the shared admin password.</p>
        <LoginForm />
      </Card>
    </main>
  );
}
