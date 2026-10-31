import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Each admin page checks the session itself. Layouts don't re-run on every navigation, so the check
// sits next to the content it protects.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
