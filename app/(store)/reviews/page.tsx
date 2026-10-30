import { ReviewCard } from "../../../components/store/review-card";
import { ReviewDialog } from "../../../components/store/review-dialog";
import { Container } from "../../../components/ui/container";
import { Grid } from "../../../components/ui/grid";
import { isDevPreview } from "../../../lib/content/dev";
import { sampleReviews } from "../../../lib/content/reviews";

export const metadata = { title: "Reviews" };

export default function ReviewsPage() {
  // Sample reviews appear only in development. Production shows the empty state until approved
  // reviews exist (Phase 7).
  const reviews = isDevPreview ? sampleReviews : [];
  const average =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;

  return (
    <Container className="space-y-lg py-lg">
      <header className="space-y-4 text-center">
        <h1 className="font-headline text-headline-xl text-primary">A wall of love</h1>
        <p className="mx-auto max-w-2xl font-body text-body-lg text-on-surface-variant">
          See how the community is shining bright with Papaya jewellery.
        </p>
        <div className="flex justify-center">
          <ReviewDialog />
        </div>
      </header>

      {average === null ? (
        <p className="text-center font-body text-body-lg text-on-surface-variant">
          No reviews yet. Approved reviews will appear here.
        </p>
      ) : (
        <p aria-live="polite" className="text-center font-label text-label-md text-on-surface-variant">
          Average {average.toFixed(1)} out of 5 from {reviews.length} reviews
        </p>
      )}

      {reviews.length > 0 && (
        <Grid>
          {reviews.map((review) => (
            <div key={review.id} className="col-span-4 md:col-span-4 lg:col-span-4">
              <ReviewCard review={review} sample={isDevPreview} />
            </div>
          ))}
        </Grid>
      )}
    </Container>
  );
}
