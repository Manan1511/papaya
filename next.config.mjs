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
};

export default nextConfig;
