import type { MetadataRoute } from "next";

// Keep the admin, account, bag and API routes out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/admin", "/account", "/cart", "/api/"],
    },
  };
}
