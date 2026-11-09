import { AdminShell } from "../../components/admin/shell";

// Shown the moment an admin link is clicked, while the page waits on Shopify. It also lets Next.js
// prefetch the frame ahead of the click, so switching sections doesn't wait for the data.
export default function AdminLoading() {
  return (
    <AdminShell title={<span className="block h-8 w-40 animate-pulse rounded bg-surface-container-high" />}>
      <div aria-busy="true" className="space-y-4">
        <span className="sr-only" role="status">
          Loading
        </span>
        <div className="h-24 animate-pulse rounded-lg bg-surface-container-high" />
        <div className="h-64 animate-pulse rounded-lg bg-surface-container-high" />
      </div>
    </AdminShell>
  );
}
