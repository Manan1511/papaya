// Sample reviews for development only (see dev.ts). They are invented to show the layout and
// are never shown in production. Real reviews come from the review system in Phase 7.
export type ReviewView = {
  id: string;
  name: string;
  rating: number;
  title?: string;
  body: string;
  verified: boolean;
  product: string;
};

export const sampleReviews: ReviewView[] = [
  {
    id: "sample-1",
    name: "Sample reviewer A",
    rating: 5,
    title: "Sample review",
    body: "Sample text showing the layout of a long review with a title.",
    verified: true,
    product: "Riviera Chain",
  },
  {
    id: "sample-2",
    name: "Sample reviewer B",
    rating: 5,
    body: "Sample text for a short review.",
    verified: false,
    product: "Sorrento Sun Ring",
  },
  {
    id: "sample-3",
    name: "Sample reviewer C",
    rating: 4,
    body: "Sample text for a four-star review.",
    verified: true,
    product: "Capri Hoops",
  },
  {
    id: "sample-4",
    name: "Sample reviewer D",
    rating: 5,
    body: "Sample text for a review with no title.",
    verified: false,
    product: "Positano Bracelet",
  },
];
