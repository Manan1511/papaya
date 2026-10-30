// Creates the CMS metaobject definitions on the dev store. Safe to re-run:
// a type that already exists is skipped, never changed.
//
// Run: node --env-file=.env.local scripts/setup-metaobjects.mjs

const STORE = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-04";

if (!STORE || !CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Set SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in .env.local");
}

const field = (key, name, type, required = false) => ({ key, name, type, required });

// Editable pages hold live and draft content as JSON, so editing never leaks a draft to the storefront.
const draftable = [
  field("slug", "Slug", "single_line_text_field", true),
  field("status", "Status", "single_line_text_field", true),
  field("draft", "Draft", "json"),
  field("published", "Published", "json"),
];

const DEFINITIONS = [
  { type: "cms_page", name: "CMS page", fields: draftable },
  // Title, category, cover, excerpt, body, featured and published_at live inside draft/published.
  { type: "diary_post", name: "Diary post", fields: draftable },
  {
    type: "review",
    name: "Review",
    fields: [
      field("product", "Product", "product_reference", true),
      field("rating", "Rating", "number_integer", true),
      field("title", "Title", "single_line_text_field"),
      field("body", "Body", "multi_line_text_field", true),
      field("name", "Name", "single_line_text_field", true),
      field("email", "Email", "single_line_text_field", true), // stored, never rendered
      field("photo", "Photo", "file_reference"),
      field("verified", "Verified buyer", "boolean"),
      field("status", "Status", "single_line_text_field", true), // pending | approved | rejected
      field("created_at", "Created at", "date_time", true),
    ],
  },
  {
    type: "contact_message",
    name: "Contact message",
    fields: [
      field("name", "Name", "single_line_text_field", true),
      field("email", "Email", "single_line_text_field", true),
      field("subject", "Subject", "single_line_text_field"),
      field("message", "Message", "multi_line_text_field", true),
      field("read", "Read", "boolean"),
      field("created_at", "Created at", "date_time", true),
    ],
  },
];

const EXISTING = `query ($type: String!) {
  metaobjectDefinitionByType(type: $type) { id }
}`;

const CREATE = `mutation ($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition { id }
    userErrors { field message code }
  }
}`;

async function accessToken() {
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`Token request failed (${res.status}): ${await res.text()}`);
  return (await res.json()).access_token;
}

async function admin(token, query, variables) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Admin API ${res.status}: ${await res.text()}`);
  const { data, errors } = await res.json();
  if (errors) throw new Error(`GraphQL: ${JSON.stringify(errors)}`);
  return data;
}

const token = await accessToken();

for (const def of DEFINITIONS) {
  const { metaobjectDefinitionByType } = await admin(token, EXISTING, { type: def.type });
  if (metaobjectDefinitionByType) {
    console.log(`skip  ${def.type} (exists)`);
    continue;
  }

  const { metaobjectDefinitionCreate } = await admin(token, CREATE, {
    definition: {
      type: def.type,
      name: def.name,
      access: { storefront: "NONE" },
      fieldDefinitions: def.fields,
    },
  });

  const { userErrors } = metaobjectDefinitionCreate;
  if (userErrors.length) throw new Error(`${def.type}: ${JSON.stringify(userErrors)}`);
  console.log(`made  ${def.type}`);
}
