// Admin API client shared by the setup scripts. Each run mints its own
// client-credentials token (valid 24 hours), so no token is stored on disk.
// Errors name the failing call, never the credentials.

export async function connectAdmin() {
  const store = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-04";

  if (!store || !clientId || !clientSecret) {
    throw new Error("Set SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in .env.local");
  }

  const tokenRes = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  if (!tokenRes.ok) throw new Error(`Token request failed (${tokenRes.status}): ${await tokenRes.text()}`);
  const { access_token: token, scope } = await tokenRes.json();

  const endpoint = `https://${store}/admin/api/${apiVersion}/graphql.json`;

  async function admin(query, variables) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) throw new Error(`Admin API ${res.status}: ${await res.text()}`);
    const { data, errors } = await res.json();
    if (errors) throw new Error(`GraphQL: ${JSON.stringify(errors)}`);
    return data;
  }

  return { scope, admin };
}
