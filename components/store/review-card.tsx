import type { ReviewView } from "../../lib/content/reviews";
import { Chip } from "../ui/chip";
import { Icon } from "../ui/icon";

export function ReviewCard({ review, sample = false }: { review: ReviewView; sample?: boolean }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-lg">
      <div role="img" aria-label={`Rated ${review.rating} out of 5`} className="flex gap-1 text-primary-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon key={star} name="star" filled={star <= review.rating} className="text-[20px]" />
        ))}
      </div>
      {review.title && <h3 className="font-headline text-headline-md text-on-surface">{review.title}</h3>}
      <p className="font-body text-body-md text-on-surface-variant">{review.body}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <p className="font-label text-label-md text-on-surface">{review.name}</p>
        {review.verified && <Chip tone="secondary">Verified buyer</Chip>}
        {sample && <Chip tone="tertiary">Sample</Chip>}
      </div>
      <p className="font-body text-label-md text-on-surface-variant">On {review.product}</p>
    </article>
  );
}
