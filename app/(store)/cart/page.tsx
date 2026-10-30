import type { Metadata } from "next";
import Link from "next/link";
import { CartContents, CartSummary } from "../../../components/store/cart-contents";
import { Container } from "../../../components/ui/container";
import { fetchCart } from "../../../lib/cart/cart";
import { readCartId } from "../../../lib/cart/session";

export const metadata: Metadata = { title: "Your bag" };

// The full bag page. The drawer in the header shows the same contents.
export default async function CartPage() {
  const cartId = await readCartId();
  const cart = cartId ? await fetchCart(cartId) : null;

  return (
    <Container className="space-y-lg py-lg">
      <h1 className="font-headline text-headline-lg text-on-surface">Your bag</h1>

      {cart && cart.lines.nodes.length > 0 ? (
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start">
          <CartContents cart={cart} />
          <aside className="rounded-lg bg-surface-container-low p-6 md:sticky md:top-28">
            <CartSummary cart={cart} />
          </aside>
        </div>
      ) : (
        <CartContents cart={cart} />
      )}

      <Link href="/shop" className="link-underline inline-block font-label text-label-md text-secondary">
        Continue shopping
      </Link>
    </Container>
  );
}
