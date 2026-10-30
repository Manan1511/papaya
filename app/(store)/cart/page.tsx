import type { Metadata } from "next";
import Link from "next/link";
import { CartContents } from "../../../components/store/cart-contents";
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
      <div className="max-w-2xl">
        <CartContents cart={cart} />
      </div>
      <Link href="/shop" className="font-label text-label-md text-secondary underline-offset-4 hover:underline">
        Continue shopping
      </Link>
    </Container>
  );
}
