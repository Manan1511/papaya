// Sample admin data for the development-only admin screens. Nothing here is saved or connected.
export const adminStats = {
  pendingReviews: 3,
  unreadMessages: 2,
  unpublishedChanges: 1,
};

export const adminActivity = [
  { text: "Sample review waiting for approval", when: "Sample time" },
  { text: "Sample contact message received", when: "Sample time" },
  { text: "Sample homepage change saved as a draft", when: "Sample time" },
];

export const adminContentSections = [
  { id: "hero", title: "Hero", visible: true },
  { id: "latest", title: "Latest additions", visible: true },
  { id: "amalfi", title: "Amalfi Edit tile", visible: true },
  { id: "best", title: "Best seller tile", visible: true },
  { id: "making", title: "How we make tile", visible: false },
  { id: "newsletter", title: "Newsletter", visible: true },
];

export const adminReviews = [
  { id: "r1", product: "Riviera Chain", name: "Sample reviewer A", rating: 5, status: "pending" },
  { id: "r2", product: "Capri Hoops", name: "Sample reviewer B", rating: 4, status: "pending" },
  { id: "r3", product: "Sorrento Sun Ring", name: "Sample reviewer C", rating: 5, status: "approved" },
];

export const adminMessages = [
  {
    id: "m1",
    from: "Sample sender",
    subject: "Sample question about sizing",
    body: "Sample message body. Real messages appear here once the contact form is connected.",
    read: false,
  },
  {
    id: "m2",
    from: "Sample sender",
    subject: "Sample order question",
    body: "Sample message body for a second message.",
    read: true,
  },
];
