import type { ReactNode } from "react";
import { SiteFooter } from "../../components/store/site-footer";
import { SiteHeader } from "../../components/store/site-header";
import { fetchCart } from "../../lib/cart/cart";
import { readCartId } from "../../lib/cart/session";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  // The header shows the bag, so every store page reads the cart. A shopper without a cart
  // costs no Storefront request.
  const cartId = await readCartId();
  const cart = cartId ? await fetchCart(cartId) : null;

  return (
    <>
      <SiteHeader cart={cart} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
