import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Each admin page calls requireDevPreview() itself. A notFound() in this layout doesn't stop the
// page's output from reaching a prerendered 404, so the gate sits where the content is rendered.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
