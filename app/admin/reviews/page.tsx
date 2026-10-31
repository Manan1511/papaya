import { requireAdmin } from "../../../lib/auth/session";
import { AdminShell } from "../../../components/admin/shell";
import { Panel, type Status, StatusChip } from "../../../components/admin/ui";
import { Button } from "../../../components/ui/button";
import { adminReviews } from "../../../lib/content/admin";

export default async function AdminReviews() {
  await requireAdmin();
  return (
    <AdminShell title="Reviews">
      <Panel title="Moderation queue">
        {/* The table keeps its width on phones and scrolls inside the panel instead of the page. */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-body-md text-on-surface">
            <thead>
              <tr>
                {["Product", "Reviewer", "Rating", "Status", "Actions"].map((column) => (
                  <th key={column} scope="col" className="border-b border-outline-variant py-3 font-label text-label-md">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adminReviews.map((review) => (
                <tr key={review.id} className="border-b border-outline-variant/40">
                  <td className="py-3">{review.product}</td>
                  <td className="py-3">{review.name}</td>
                  <td className="py-3">{review.rating} / 5</td>
                  <td className="py-3">
                    <StatusChip status={review.status as Status} />
                  </td>
                  <td className="flex gap-2 py-3">
                    <Button variant="secondary" disabled>
                      Approve
                    </Button>
                    <Button variant="outlined" disabled>
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
