// The public address of the store, used for link previews and search results.
export const SITE_URL = "https://papaya.buzz";
export const SITE_NAME = "Papaya Jewellery";
export const SITE_DESCRIPTION =
  "Jewellery with personality, crafted with love. Thoughtfully handcrafted pieces, playful details and unexpected combinations.";

// Free-shipping threshold in rupees. Leave it null until the number is decided: the cart bar and
// the product note stay hidden until then.
export const FREE_SHIPPING_THRESHOLD_INR: number | null = null;

// The flat shipping charge in whole rupees, added at checkout unless the bag reaches the free-shipping
// threshold above. 0 means shipping is free on every order. Set it once the fee is decided.
export const SHIPPING_FEE_INR = 0;
