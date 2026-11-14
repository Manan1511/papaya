import { fileURLToPath } from "node:url";

// Pin the Turbopack root so a stray lockfile above this folder (the home directory here) can't
// change how the project is resolved.
const nextConfig = {
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  images: {
    // Product and collection photos are served from Shopify's CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
  // Sent with every response. No Content-Security-Policy yet: a nonce-based one makes every page
  // render per request, and it should be tried against a real Razorpay test payment first.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No page of ours is meant to sit inside another site's frame.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
    ];
  },
};

export default nextConfig;
