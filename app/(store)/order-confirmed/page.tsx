import type { Metadata } from "next";
import { ButtonLink } from "../../../components/ui/button";
import { Container } from "../../../components/ui/container";
import { Icon } from "../../../components/ui/icon";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false, follow: false } };

// Shopify order names look like #1001. Anything else in the address is ignored.
const ORDER_NAME = /^#?[A-Za-z0-9-]{1,20}$/;

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { order } = await searchParams;
  const name = typeof order === "string" && ORDER_NAME.test(order) ? order : null;

  return (
    <Container className="flex flex-col items-center gap-6 py-section-gap text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-container via-tertiary-fixed to-secondary-fixed text-on-primary-container">
        <Icon name="diamond" className="text-[44px]" />
      </span>
      <div className="max-w-md space-y-3">
        <h1 className="font-headline text-headline-lg text-on-surface">Thank you!</h1>
        <p className="font-body text-body-lg text-on-surface">
          {name ? `Your order ${name} is confirmed.` : "Your order is confirmed."}
        </p>
        <p className="font-body text-body-md text-on-surface-variant">
          We've emailed you the details. We'll write again when your order ships.
        </p>
      </div>
      <ButtonLink href="/shop">Keep shopping</ButtonLink>
    </Container>
  );
}
