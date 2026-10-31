// Sample reviews and the account preview show only in development. Production builds show empty
// states, so nothing that looks like a real customer or order reaches a shopper.
export const isDevPreview = process.env.NODE_ENV !== "production";
