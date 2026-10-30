import Image from "next/image";
import Link from "next/link";
import type { Cart } from "../../lib/shopify/schemas";
import { Container } from "../ui/container";
import { PillNav } from "../ui/pill-nav";
import { CartDrawer } from "./cart-drawer";
import { MobileNav } from "./mobile-nav";
import { SearchOverlay } from "./search-overlay";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/story", label: "Our Story" },
  { href: "/diary", label: "Diary" },
  { href: "/reviews", label: "Reviews" },
];

// The logo file has a white background, so it blends into the page with multiply.
export function SiteHeader({ cart }: { cart: Cart | null }) {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" aria-label="Papaya home" className="shrink-0">
          <Image
            src="/brand/papaya-logo.jpg"
            alt=""
            width={865}
            height={263}
            priority
            className="h-8 w-auto mix-blend-multiply md:h-10"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 font-label text-label-md md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-underline text-on-surface-variant transition-colors duration-200 hover:text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <PillNav
            label="Search, account and bag"
            items={[
              { label: "Search", node: <SearchOverlay /> },
              { icon: "person", label: "Account", href: "/account" },
              { label: "Bag", node: <CartDrawer cart={cart} /> },
            ]}
          />
          <MobileNav links={navLinks} />
        </div>
      </Container>
    </header>
  );
}
