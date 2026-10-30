import Link from "next/link";
import { buttonClass } from "../ui/button";

// Cursor pagination: the next page keeps every current filter and adds the cursor.
export function Pagination({
  basePath,
  search,
  nextCursor,
}: {
  basePath: string;
  search: Record<string, string>;
  nextCursor: string | null;
}) {
  if (!nextCursor) return null;

  const params = new URLSearchParams({ ...search, after: nextCursor });
  return (
    <nav aria-label="Pagination" className="flex justify-center">
      <Link href={`${basePath}?${params.toString()}`} className={buttonClass({ variant: "outlined" })}>
        Show more
      </Link>
    </nav>
  );
}
