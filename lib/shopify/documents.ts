// GraphQL documents for the Storefront API. Kept free of server-only imports so the
// schema test can check every document against the pinned schema.

const PRODUCT_CARD = /* GraphQL */ `
  fragment ProductCard on Product {
    id
    handle
    title
    productType
    tags
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
  }
`;

const COLLECTION_CARD = /* GraphQL */ `
  fragment CollectionCard on Collection {
    id
    handle
    title
    image {
      url
      altText
      width
      height
    }
    products(first: 1) {
      nodes {
        featuredImage {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const CART_FIELDS = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    discountCodes {
      code
      applicable
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
              width
              height
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        ...CollectionCard
      }
    }
  }
  ${COLLECTION_CARD}
`;

export const COLLECTION_QUERY = /* GraphQL */ `
  query Collection(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD}
`;

export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      ...ProductCard
      description
      media(first: 12) {
        nodes {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
          ... on Video {
            previewImage {
              url
              altText
              width
              height
            }
            sources {
              url
              mimeType
              height
            }
          }
        }
      }
      options(first: 10) {
        name
        values
      }
      variants(first: 50) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
      collections(first: 1) {
        nodes {
          handle
          title
        }
      }
      careTips: metafield(namespace: "papaya", key: "care_tips") {
        value
      }
      completeTheLook: metafield(namespace: "papaya", key: "complete_the_look") {
        references(first: 4) {
          nodes {
            ... on Product {
              ...ProductCard
            }
          }
        }
      }
    }
  }
  ${PRODUCT_CARD}
`;

export const SHOP_QUERY = /* GraphQL */ `
  query Shop($query: String, $first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD}
`;

// What the shop's filters offer, read from the catalog: the product types in use, and the options
// on every product, from which the sizes are taken.
export const FACETS_QUERY = /* GraphQL */ `
  query Facets {
    productTypes(first: 250) {
      nodes
    }
    products(first: 250) {
      nodes {
        options {
          name
          values
        }
      }
    }
  }
`;

export const SEARCH_QUERY = /* GraphQL */ `
  query Search($query: String!, $first: Int!, $after: String) {
    search(query: $query, types: [PRODUCT], first: $first, after: $after, unavailableProducts: HIDE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on Product {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD}
`;

export const CART_QUERY = /* GraphQL */ `
  query Cart($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
  ${CART_FIELDS}
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
  ${CART_FIELDS}
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
  ${CART_FIELDS}
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
  ${CART_FIELDS}
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
  ${CART_FIELDS}
`;

export const CART_DISCOUNT_CODES_MUTATION = /* GraphQL */ `
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
  ${CART_FIELDS}
`;

// Each policy is null until it is written in Shopify (Settings > Policies).
export const SHOP_POLICIES_QUERY = /* GraphQL */ `
  query ShopPolicies {
    shop {
      privacyPolicy {
        title
        body
      }
      refundPolicy {
        title
        body
      }
      termsOfService {
        title
        body
      }
    }
  }
`;
