// Creates the dev store's catalog structure: the manual collections, the type
// collections (Necklaces, Earrings, Bracelets), which fill from each product's type, the "all"
// collection the shop page reads, and Headless publishing for both. Also creates
// the product metafields the storefront reads. Safe to re-run: anything that
// already exists is skipped, never changed.
//
// Products are not handled here. The placeholder products exist only on the dev
// store, so docs/shopify-setup.md, step 8, covers them.
//
// Run: node --env-file=.env.local scripts/setup-catalog.mjs

import { connectAdmin } from "./shopify-admin.mjs";

// Filled by product type, so imported products appear without being added by hand.
const TYPE_COLLECTIONS = ["Necklaces", "Earrings", "Bracelets"];

const MANUAL_COLLECTIONS = [
  "Rings",
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
// The channel is named after the store, e.g. "Papaya Headless".
const headlessMatches = publications.nodes.filter((publication) => /headless/i.test(publication.name));
if (headlessMatches.length !== 1) {
  const names = publications.nodes.map((publication) => publication.name).join(", ");
  throw new Error(`Expected one Headless publication, found ${headlessMatches.length}. Publications: ${names}`);
}
const [headless] = headlessMatches;

const { collections } = await admin(COLLECTIONS, { publication: headless.id });
const byHandle = new Map(collections.nodes.map((collection) => [collection.handle, collection]));

const typeRuleSet = (type) => ({
  appliedDisjunctively: false,
  rules: [{ column: "TYPE", relation: "EQUALS", condition: type }],
});

const wanted = [
  ...MANUAL_COLLECTIONS.map((title) => ({ title, handle: toHandle(title) })),
  ...TYPE_COLLECTIONS.map((title) => ({ title, handle: toHandle(title), ruleSet: typeRuleSet(title) })),
  ALL_PRODUCTS,
];

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
