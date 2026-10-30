import { requireDevPreview } from "../../../lib/content/dev";
import Link from "next/link";
import { AdminShell } from "../../../components/admin/shell";
import { Panel, StatusChip } from "../../../components/admin/ui";
import { Button } from "../../../components/ui/button";
import { diaryPosts } from "../../../lib/content/diary";

export default function AdminDiary() {
  requireDevPreview();
  return (
    <AdminShell title="Diary">
      <div className="flex justify-end">
        <Button disabled>New post</Button>
      </div>
      <Panel title="Posts">
        <table className="w-full text-left font-body text-body-md text-on-surface">
          <thead>
            <tr>
              {["Title", "Category", "Status", ""].map((column) => (
                <th key={column} scope="col" className="border-b border-outline-variant py-3 font-label text-label-md">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {diaryPosts.map((post) => (
              <tr key={post.slug} className="border-b border-outline-variant/40">
                <td className="py-3">{post.title}</td>
                <td className="py-3">{post.category}</td>
                <td className="py-3">
                  <StatusChip status="published" />
                </td>
                <td className="py-3 text-right">
                  <Link href={`/admin/diary/${post.slug}`} className="font-label text-label-md text-secondary underline-offset-4 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </AdminShell>
  );
}
