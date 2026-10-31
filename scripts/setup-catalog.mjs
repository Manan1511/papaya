// Creates the dev store's catalog structure: the manual collections, the "all"
// collection the shop page reads, and Headless publishing for both. Also creates
// the product metafields the storefront reads. Safe to re-run: anything that
// already exists is skipped, never changed.
//
// Products are not handled here. The placeholder products exist only on the dev
// store, so docs/shopify-setup.md, step 8, covers them.
//
// Run: node --env-file=.env.local scripts/setup-catalog.mjs

import { connectAdmin } from "./shopify-admin.mjs";

const MANUAL_COLLECTIONS = [
  "Necklaces",
  "Earrings",
  "Rings",
  "Bracelets",
  "Anklets",
  "New Arrivals",
  "Best Sellers",
  "The Amalfi Edit",
];

// The shop page reads the "all" handle. Every product priced above zero joins it.
const ALL_PRODUCTS = {
  title: "All products",
  handle: "all",
  ruleSet: {
    appliedDisjunctively: false,
    rules: [{ column: "VARIANT_PRICE", relation: "GREATER_THAN", condition: "0" }],
  },
};

const METAFIELDS = [
  { key: "care_tips", name: "Care tips", type: "multi_line_text_field" },
  { key: "complete_the_look", name: "Complete the look", type: "list.product_reference" },
];

const toHandle = (title) => title.toLowerCase().replace(/\s+/g, "-");

const PUBLICATIONS = `{ publications(first: 50) { nodes { id name } } }`;

const COLLECTIONS = `query ($publication: ID!) {
  collections(first: 250) {
    nodes { id handle publishedOnPublication(publicationId: $publication) }
  }
}`;

const CREATE_COLLECTION = `mutation ($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection { id }
    userErrors { field message }
  }
}`;

const PUBLISH = `mutation ($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    userErrors { field message }
  }
}`;

const METAFIELD_DEFINITIONS = `{
  metafieldDefinitions(first: 50, ownerType: PRODUCT, namespace: "papaya") { nodes { key } }
}`;

const CREATE_METAFIELD_DEFINITION = `mutation ($definition: MetafieldDefinitionInput!) {
  metafieldDefinitionCreate(definition: $definition) {
    createdDefinition { id }
    userErrors { field message }
  }
}`;

const { admin } = await connectAdmin();

const { publications } = await admin(PUBLICATIONS);
const headless = publications.nodes.find((publication) => publication.name === "Headless");
if (!headless) {
  throw new Error(`No Headless publication. Found: ${publications.nodes.map((p) => p.name).join(", ")}`);
}

const { collections } = await admin(COLLECTIONS, { publication: headless.id });
const byHandle = new Map(collections.nodes.map((collection) => [collection.handle, collection]));

const wanted = [...MANUAL_COLLECTIONS.map((title) => ({ title, handle: toHandle(title) })), ALL_PRODUCTS];

for (const { title, handle, ruleSet } of wanted) {
  let collection = byHandle.get(handle);
  if (collection) {
    console.log(`skip  collection ${handle} (exists)`);
  } else {
    const { collectionCreate } = await admin(CREATE_COLLECTION, { input: { title, handle, ruleSet } });
    if (collectionCreate.userErrors.length) {
      throw new Error(`${handle}: ${JSON.stringify(collectionCreate.userErrors)}`);
    }
    collection = { id: collectionCreate.collection.id, publishedOnPublication: false };
    console.log(`made  collection ${handle}`);
  }

  if (collection.publishedOnPublication) continue;

  const { publishablePublish } = await admin(PUBLISH, {
    id: collection.id,
    input: [{ publicationId: headless.id }],
  });
  if (publishablePublish.userErrors.length) {
    throw new Error(`${handle}: ${JSON.stringify(publishablePublish.userErrors)}`);
  }
  console.log(`published collection ${handle} to Headless`);
}

const { metafieldDefinitions } = await admin(METAFIELD_DEFINITIONS);
const existingKeys = new Set(metafieldDefinitions.nodes.map((definition) => definition.key));

for (const { key, name, type } of METAFIELDS) {
  if (existingKeys.has(key)) {
    console.log(`skip  metafield papaya.${key} (exists)`);
    continue;
  }

  const { metafieldDefinitionCreate } = await admin(CREATE_METAFIELD_DEFINITION, {
    definition: {
      name,
      namespace: "papaya",
      key,
      type,
      ownerType: "PRODUCT",
      access: { storefront: "PUBLIC_READ" },
    },
  });
  if (metafieldDefinitionCreate.userErrors.length) {
    throw new Error(`papaya.${key}: ${JSON.stringify(metafieldDefinitionCreate.userErrors)}`);
  }
  console.log(`made  metafield papaya.${key}`);
}
