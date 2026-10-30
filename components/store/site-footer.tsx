import Image from "next/image";
import Link from "next/link";
import { Card } from "../ui/card";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";
import { NewsletterForm } from "./newsletter-form";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/collections/necklaces", label: "Necklaces" },
      { href: "/collections/earrings", label: "Earrings" },
      { href: "/collections/rings", label: "Rings" },
      { href: "/collections/bracelets", label: "Bracelets" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/pages/shipping-returns", label: "Shipping & Returns" },
      { href: "/pages/size-guide", label: "Size Guide" },
      { href: "/pages/care-guide", label: "Care Guide" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/story", label: "Our Story" },
      { href: "/pages/sustainability", label: "Sustainability" },
      { href: "/diary", label: "Diary" },
      { href: "/reviews", label: "Reviews" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/policies/privacy-policy", label: "Privacy" },
      { href: "/policies/terms-of-service", label: "Terms" },
      { href: "/policies/refund-policy", label: "Refund" },
    ],
  },
];

export type SocialLink = { label: string; href: string };

// Socials come from the CMS global (Phase 5). Until then the caller passes none, so no placeholder links show.
export function SiteFooter({ socials = [] }: { socials?: SocialLink[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-section-gap overflow-hidden rounded-t-xl bg-surface-container">
      <Container className="pt-12">
        <Card className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <h2 className="font-headline text-headline-md text-on-surface">Join the Beach Club</h2>
            <p className="mt-2 font-body text-body-md text-on-surface-variant">
              Early access to new collections, events, and a touch of sunshine in your inbox.
            </p>
          </div>
          <div className="w-full md:max-w-md">
            <NewsletterForm />
          </div>
        </Card>
      </Container>

      <Container className="grid gap-10 py-12 md:grid-cols-5">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <Image
            src="/brand/papaya-logo.png"
            alt="Papaya"
            width={865}
            height={263}
            className="h-10 w-auto self-start mix-blend-multiply"
          />
          <p className="max-w-xs font-body text-body-md text-on-surface-variant">
            Bringing the warmth and vibrancy of endless summer to your everyday wardrobe.
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
            <h2 className="font-headline text-body-lg font-bold text-on-surface">{column.title}</h2>
            {column.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-underline self-start font-body text-body-md text-on-surface-variant transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </Container>

      <Container className="flex flex-col gap-4 border-t border-outline-variant/40 py-6 md:flex-row md:items-center md:justify-between">
        <p className="font-body text-body-md text-secondary">© {year} Papaya Jewellery. Stay Sunny.</p>
        <div className="flex flex-wrap items-center gap-4">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline self-start font-body text-body-md text-on-surface-variant transition-colors hover:text-primary"
            >
              {social.label}
            </a>
          ))}
          <Icon name="credit_card" className="text-outline" />
          <Icon name="payments" className="text-outline" />
        </div>
      </Container>
    </footer>
  );
}
