// The admin session cookie's name. The proxy checks it exists before an admin page is served, and
// lib/auth/session.ts reads and seals it. Both import the name from here.
export const ADMIN_COOKIE = "papaya_admin";
