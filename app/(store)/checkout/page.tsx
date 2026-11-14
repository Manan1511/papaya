import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "../../../components/store/checkout-form";
import { Container } from "../../../components/ui/container";
import { fetchCart } from "../../../lib/cart/cart";
import { readCartId } from "../../../lib/cart/session";
import { priceBag, shippingRules } from "../../../lib/checkout/pricing";
import { formatPrice } from "../../../lib/format";
import { getRazorpayConfig } from "../../../lib/payments/config";
import { fromPaise } from "../../../lib/payments/money";

export const metadata: Metadata = { title: "Checkout" };

const rupees = (paise: number) => formatPrice({ amount: fromPaise(paise), currencyCode: "INR" });

// Delivery details and payment. The bag is read from Shopify here, and priced again on the server
// when the shopper pays, so nothing on this page can change what they are charged.
export default async function CheckoutPage() {
  const cartId = await readCartId();
  const cart = cartId ? await fetchCart(cartId) : null;
  if (!cart || cart.lines.nodes.length === 0) redirect("/cart");

  const priced = priceBag(cart, shippingRules);
  const ready = getRazorpayConfig() !== null;

  return (
    <Container className="space-y-lg py-lg">
      <h1 className="font-headline text-headline-lg text-on-surface">Checkout</h1>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_22rem] md:items-start">
        <section aria-label="Delivery and payment">
          {!priced.ok ? (
            <p role="alert" className="rounded-lg bg-surface-container-low p-4 font-body text-body-md text-on-surface">
              {priced.message}{" "}
              <Link href="/cart" className="link-underline font-label text-label-md text-secondary">
                Back to your bag
              </Link>
            </p>
          ) : !ready ? (
            <p role="status" className="rounded-lg bg-surface-container-low p-4 font-body text-body-md text-on-surface">
              Online payments aren't open yet. Please check back soon.
            </p>
          ) : (
            <CheckoutForm totalLabel={rupees(priced.bag.totalPaise)} />
          )}
        </section>

        <aside className="rounded-lg bg-surface-container-low p-6 md:sticky md:top-28">
          <h2 className="mb-4 font-headline text-headline-md text-on-surface">Your order</h2>
          <ul className="flex flex-col divide-y divide-outline-variant/40">
            {cart.lines.nodes.map((line) => (
              <li key={line.id} className="flex gap-3 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded bg-surface-container">
                  {line.merchandise.image && (
                    <Image
                      src={line.merchandise.image.url}
                      alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                      width={line.merchandise.image.width ?? 120}
                      height={line.merchandise.image.height ?? 120}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 justify-between gap-2 font-body text-body-md text-on-surface">
                  <div>
                    <p>{line.merchandise.product.title}</p>
                    <p className="text-label-md text-on-surface-variant">
                      {line.merchandise.title !== "Default Title" && `${line.merchandise.title} · `}Qty {line.quantity}
                    </p>
                  </div>
                  <p>{formatPrice(line.cost.totalAmount)}</p>
                </div>
              </li>
            ))}
          </ul>

          {priced.ok && (
            <dl className="mt-4 flex flex-col gap-2 border-t border-outline-variant/40 pt-4 font-body text-body-md text-on-surface">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{rupees(priced.bag.subtotalPaise)}</dd>
              </div>
              {priced.bag.discountPaise > 0 && (
                <div className="flex justify-between">
                  <dt>Discount{priced.bag.discountCode && ` (${priced.bag.discountCode})`}</dt>
                  <dd>−{rupees(priced.bag.discountPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{priced.bag.shippingPaise === 0 ? "Free" : rupees(priced.bag.shippingPaise)}</dd>
              </div>
              <div className="flex justify-between border-t border-outline-variant/40 pt-2 font-bold">
                <dt>Total</dt>
                <dd>{rupees(priced.bag.totalPaise)}</dd>
              </div>
            </dl>
          )}
        </aside>
      </div>

      <Link href="/cart" className="link-underline inline-block font-label text-label-md text-secondary">
        Back to your bag
      </Link>
    </Container>
  );
}
