import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans, Yellowtail } from "next/font/google";
import type { ReactNode } from "react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/content/site";
import "./globals.css";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-headline",
  display: "swap",
});

const body = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// A brush script for one accent word in the hero headline.
const script = Yellowtail({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // What a shared link shows in WhatsApp and other apps: the name, the description and the share image
  // from app/opengraph-image.png.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
};

// Tells search engines the store's name and logo, so results can show them.
const structuredData = JSON.stringify([
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
]).replace(/</g, "\\u003c");

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${headline.variable} ${body.variable} ${script.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
        {children}
      </body>
    </html>
  );
}
