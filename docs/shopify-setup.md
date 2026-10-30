# Shopify setup (Phase 1)

Owner: you. I can't create accounts, sign in, or submit forms in Shopify.

Keep every secret in `.env.local`. Never paste tokens or secrets into chat, commits, or this file.

Prerequisite: Node 20.6 or newer (the setup script reads `.env.local` with `--env-file`).

## Decisions

Already decided in the Stitch interview: INR development store, Headless sales channel, Customer Account API for accounts (Phase 4c), Search & Discovery filters, and placeholder products until your catalog arrives.

Confirmed defaults:

- **Admin API auth: Dev Dashboard app with client credentials.** Shopify's current official path mints 24-hour tokens for these apps, and the server renews them. The app and the store must belong to the same Partner organization, or token requests fail with `shop_not_permitted`.
- **Verified Buyer window: last 60 days only.** Shopify returns only the last 60 days of orders unless the app is approved for `read_all_orders`. Full history needs a Shopify approval request with a rationale. Approval timing is unknown.

Facts that changed from the plan:

- **API version:** pin `2026-04`. It is the version the Storefront schema in the tests describes, so every query is checked against it. Move the pin only after refreshing that schema from a newer `@shopify/hydrogen-react`.
- **Customer Account API:** does not accept `localhost` or plain-HTTP callback URLs. Local development needs an HTTPS tunnel (ngrok or Cloudflare Tunnel) or a deploy preview. This matters only in Phase 4c.
- **Payments in India:** Shopify Payments is probably not available there. The sources so far are vendor blogs, not Shopify. Check Shopify's own country list before launch.

## Steps

### 1. Partner account and development store

1. Create a Shopify Partner account at partners.shopify.com.
2. Go to Stores, then Add store, then Development store. Name it "Papaya Dev" and set the currency to INR.
3. Record the store domain (`<name>.myshopify.com`) as `SHOPIFY_STORE_DOMAIN`.
4. Payments: development stores come with a built-in test gateway (Bogus Gateway), so checkout works without a real provider. Labels may differ; check Settings, then Payments.

### 2. Headless channel and Storefront tokens

1. In the store admin, add the Headless sales channel from Sales channels.
2. Create a storefront. Shopify labels this "Create storefront" during install and "Add storefront" later.
3. Copy the public token to `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` and the private token to `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`. Save the private token when it is shown. Shopify lets you rotate it in the Headless channel if you lose it. The code reads only the private token.
4. Check the public token once `.env.local` exists:

```bash
curl -s "https://YOUR-STORE.myshopify.com/api/2026-04/graphql.json" -H "Content-Type: application/json" -H "X-Shopify-Storefront-Access-Token: YOUR_PUBLIC_TOKEN" -d '{"query":"{ shop { name } }"}'
```

Expected output: `{"data":{"shop":{"name":"..."}}}`

### 3. Admin API app (proposed: Dev Dashboard)

1. In the Partner dashboard, in the same organization as the development store, create a Dev Dashboard app.
2. Request these access scopes: `read_products`, `read_orders`, `read_customers`, `write_customers`, `read_metaobjects`, `write_metaobjects`, `read_metaobject_definitions`, `write_metaobject_definitions`, `read_files`, `write_files`. If a call later fails and the error names another scope, add it then.
3. Install the app on the development store.
4. Copy the client ID to `SHOPIFY_CLIENT_ID` and the client secret to `SHOPIFY_CLIENT_SECRET`. The secret stays on the server.

Fallback, only if the Dev Dashboard path is blocked: create a legacy custom app under Settings, then Apps and sales channels, then Develop apps. Grant the same scopes and copy its Admin API access token to `SHOPIFY_ADMIN_TOKEN`. Whether Shopify still lets you create these apps, and how long their tokens last, is unconfirmed.

### 4. Search & Discovery

1. Confirm the Search & Discovery app is installed. It is free.
2. Add product filters: product type, availability, price, and the variant options you use (size, and colour if you use it). Skip metal filters. The range is acrylic and resin.

### 5. Collections

Create these manual collections. Each title gives the handle, lowercased and hyphenated:

Necklaces, Earrings, Rings, Bracelets, Anklets, New Arrivals, Best Sellers, The Amalfi Edit

Also create an automated collection titled All products that includes every product. Its handle must be `all`, because the shop page reads it.

### 6. Product metafields

Create these under Settings, then Custom data, then Products. Labels may differ.

- `papaya.care_tips`: Multi-line text. The storefront shows it as written.
- `papaya.complete_the_look`: Product, list.
- Badges: tag a product `new` or `limited`. A product that is sold out shows "Sold out" whatever its tags say.

### 7. Metaobject definitions

Not manual. `scripts/setup-metaobjects.mjs` creates them once Step 3 is done. The script is idempotent, and storefront access is set to none.

### 8. Placeholder products

Import `docs/seed/placeholder-products.csv`. It holds 12 products and 18 variants. Every product is tagged `placeholder`, so you can delete them in bulk before launch.

1. In the store admin, go to Products, then Import, and upload the file.
2. Publish the products to the Headless channel. The Storefront API hides products that aren't published to its channel. Filter by tag `placeholder`, select all, then use the publishing or availability options and tick Headless. Labels may differ.
3. Run the check below.

Your real catalog replaces these (Q8).

```bash
curl -s "https://YOUR-STORE.myshopify.com/api/2026-04/graphql.json" -H "Content-Type: application/json" -H "X-Shopify-Storefront-Access-Token: YOUR_PUBLIC_TOKEN" -d '{"query":"{ products(first: 20) { nodes { title } } }"}'
```

Expected: 12 titles.

## Webhooks (catalog updates)

Shopify tells the site when products or collections change, so cached pages refresh straight away.

1. Go to Settings, then Notifications, then Webhooks (labels may differ). Add these topics: `products/create`, `products/update`, `products/delete`, `collections/create`, `collections/update`, `collections/delete`.
2. Set the address to `https://<your-site>/api/revalidate`. Shopify only delivers to HTTPS, so use a deploy preview or a tunnel during development.
3. Copy the webhook's signing secret to `SHOPIFY_WEBHOOK_SECRET` in `.env.local`. The route rejects any request that fails this check.

## Check before Phase 4c and Phase 7

- **Protected customer data:** reading customer fields such as email and name needs Shopify approval. Not checked yet. Reviews and the newsletter depend on it.
- **`read_all_orders`:** request it only if the 60-day window is not enough.
- **Customer Account API callbacks:** add them in the Headless channel when accounts are built. Use a tunnel or deploy-preview URL.
- **Launch payment gateway for India:** choose it and confirm Shopify's country list.

## Done when

- [ ] Storefront curl returns the shop name
- [ ] Dev Dashboard app (or fallback token) installed on the development store
- [ ] Collections, including the `all` collection, and product metafield definitions exist
- [ ] Search & Discovery filters set
