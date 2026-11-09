// Creates the CMS metaobject definitions on the dev store. Safe to re-run:
// a type that already exists is skipped, never changed.
//
// Run: node --env-file=.env.local scripts/setup-metaobjects.mjs

import { connectAdmin } from "./shopify-admin.mjs";

const field = (key, name, type, required = false) => ({ key, name, type, required });

// Editable pages hold live and draft content as JSON, so editing never leaks a draft to the storefront.
const draftable = [
  field("slug", "Slug", "single_line_text_field", true),
  field("status", "Status", "single_line_text_field", true),
  field("draft", "Draft", "json"),
  field("published", "Published", "json"),
];

const DEFINITIONS = [
  { type: "$app:cms_page", name: "CMS page", fields: draftable },
  // Title, category, cover, excerpt, body, featured and published_at live inside draft/published.
  { type: "$app:diary_post", name: "Diary post", fields: draftable },
  // The homepage: one entry with its live and draft copy, including the hero video address.
  { type: "$app:home_page", name: "Homepage", fields: draftable },
  {
    type: "$app:review",
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
    type: "$app:contact_message",
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

const { admin } = await connectAdmin();

for (const def of DEFINITIONS) {
  const { metaobjectDefinitionByType } = await admin(EXISTING, { type: def.type });
  if (metaobjectDefinitionByType) {
    console.log(`skip  ${def.type} (exists)`);
    continue;
  }

  const { metaobjectDefinitionCreate } = await admin(CREATE, {
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
