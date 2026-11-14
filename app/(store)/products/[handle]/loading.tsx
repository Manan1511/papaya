import { Container } from "../../../../components/ui/container";
import { cx } from "../../../../lib/cx";

function Bar({ className }: { className: string }) {
  return <div className={cx("animate-pulse rounded bg-surface-container-high motion-reduce:animate-none", className)} />;
}

// The product page's shape while it loads: breadcrumb, photo with thumbnails, then the title, price,
// description, size chips, quantity and Add to bag. Sizes follow the real page so nothing jumps
// when the product arrives.
export default function ProductLoading() {
  return (
    <Container className="space-y-xl py-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Loading product
      </span>

      <Bar className="h-4 w-56" />

      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Bar className="aspect-[4/5] rounded-xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Bar key={index} className="h-24 w-20 shrink-0 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <Bar className="h-10 w-3/4" />
            <Bar className="h-7 w-28" />
          </div>

          <div className="space-y-2">
            <Bar className="h-5 w-full" />
            <Bar className="h-5 w-full" />
            <Bar className="h-5 w-2/3" />
          </div>

          <div className="space-y-3">
            <Bar className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Bar key={index} className="h-11 w-16 rounded-full" />
              ))}
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Bar className="h-4 w-16" />
              <Bar className="h-11 w-24" />
            </div>
            <Bar className="h-14 flex-1" />
          </div>

          <Bar className="h-4 w-48" />
          <Bar className="h-4 w-20" />
        </div>
      </div>

      <div className="space-y-4">
        <Bar className="h-9 w-40" />
        <Bar className="h-5 w-72" />
      </div>
    </Container>
  );
}
