import { notFound } from "next/navigation";
import { Button, ButtonLink } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Chip } from "../../components/ui/chip";
import { Container } from "../../components/ui/container";
import { Grid } from "../../components/ui/grid";
import { Icon } from "../../components/ui/icon";
import { IconButton } from "../../components/ui/icon-button";
import { Input } from "../../components/ui/input";
import { PillNav } from "../../components/ui/pill-nav";
import { ProgressBar } from "../../components/ui/progress-bar";
import { SearchField } from "../../components/ui/search-field";

// Literal class names so Tailwind generates them.
const swatches = [
  { name: "primary", note: "#7a111d, chili maroon: text and button fills", className: "bg-primary text-on-primary" },
  { name: "primary-container", note: "#f08a1a, sun orange: badges and accents", className: "bg-primary-container text-on-primary-container" },
  { name: "secondary", note: "#04204a, marine navy: text and lines", className: "bg-secondary text-on-secondary" },
  { name: "secondary-container", note: "#9bc8e7, sky blue: stripes", className: "bg-secondary-container text-on-secondary-container" },
  { name: "tertiary-fixed-dim", note: "#eef1f5, light grey: tiles and the header pill", className: "bg-tertiary-fixed-dim text-on-tertiary-fixed" },
  { name: "tertiary", note: "#04204a, navy: borders", className: "bg-tertiary text-on-tertiary" },
  { name: "error", note: "#b3261e", className: "bg-error text-on-error" },
  { name: "surface-container", note: "#f1f3f6, light grey: footer and panels", className: "bg-surface-container text-on-surface" },
  { name: "on-surface", note: "#04204a, navy text", className: "bg-on-surface text-surface" },
];

// Review page for the design system. Hidden in production builds.
export default function StyleGuide() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <Container className="space-y-xl py-xl">
      <header className="space-y-sm">
        <h1 className="font-headline text-headline-xl text-primary">Design system</h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          Primitives built from design/stitch/tokens.md and the colour board.
        </p>
      </header>

      <section aria-labelledby="colour" className="space-y-md">
        <h2 id="colour" className="font-headline text-headline-md text-on-surface">Colour</h2>
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-3">
          {swatches.map((swatch) => (
            <div key={swatch.name} className={`rounded-lg p-4 ${swatch.className}`}>
              <p className="font-label text-label-md">{swatch.name}</p>
              <p className="font-label text-label-sm opacity-80">{swatch.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="type" className="space-y-md">
        <h2 id="type" className="font-headline text-headline-lg text-on-surface">Typography</h2>
        <div className="grid gap-gutter md:grid-cols-3">
          <div className="space-y-sm">
            <p className="font-headline text-headline-xl text-primary">Aa</p>
            <p className="font-label text-label-md text-on-surface-variant">Headline: Plus Jakarta Sans 700 / 800</p>
          </div>
          <div className="space-y-sm">
            <p className="font-body text-headline-xl text-on-surface-variant">Aa</p>
            <p className="font-label text-label-md text-on-surface-variant">Body: Be Vietnam Pro 400 / 600 / 700</p>
          </div>
          <div className="space-y-sm">
            <p className="font-label text-headline-xl text-on-surface">Aa</p>
            <p className="font-label text-label-md text-on-surface-variant">Label: Be Vietnam Pro 600 / 700</p>
          </div>
        </div>
        <p className="font-headline text-headline-xl text-on-surface">Headline XL, 48px</p>
        <p className="font-headline text-headline-lg text-on-surface">Headline LG, 32px</p>
        <p className="font-headline text-headline-lg-mobile text-on-surface">Headline LG mobile, 28px</p>
        <p className="font-headline text-headline-md text-on-surface">Headline MD, 24px</p>
        <p className="font-body text-body-lg text-on-surface">Body LG, 18px. Born from sun-drenched afternoons.</p>
        <p className="font-body text-body-md text-on-surface">Body MD, 16px. Born from sun-drenched afternoons.</p>
        <p className="font-label text-label-md text-on-surface">Label MD, 14px</p>
        <p className="font-label text-label-sm text-on-surface">Label SM, 12px</p>
      </section>

      <section aria-labelledby="layout" className="space-y-md">
        <h2 id="layout" className="font-headline text-headline-md text-on-surface">Layout</h2>
        <p className="font-body text-body-md text-on-surface-variant">
          Columns: 4 on mobile, 8 on tablet, 12 on desktop. Side margins: 16px, 32px, 40px. Max width 1280px. Gutter 20px.
        </p>
        <Grid>
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className="flex h-12 items-center justify-center rounded bg-primary-fixed font-label text-label-sm text-on-primary-fixed"
            >
              {index + 1}
            </div>
          ))}
        </Grid>
      </section>

      <section aria-labelledby="buttons" className="space-y-md">
        <h2 id="buttons" className="font-headline text-headline-md text-on-surface">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="inverted">Inverted</Button>
          <Button variant="outlined">Outlined</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg">Add to bag</Button>
          <ButtonLink href="/shop">Shop the collection</ButtonLink>
        </div>
      </section>

      <section aria-labelledby="icon-buttons" className="space-y-md">
        <h2 id="icon-buttons" className="font-headline text-headline-md text-on-surface">Icon buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <IconButton icon="search" label="Search" />
          <IconButton icon="build" label="Tools" tone="primary" />
          <IconButton icon="hub" label="Network" tone="secondary" />
          <IconButton icon="sell" label="Tag" tone="tertiary" />
          <IconButton icon="delete" label="Delete" tone="error" />
          <IconButton icon="edit" label="Edit" tone="tertiary" shape="square" />
          <Icon name="diamond" className="text-tertiary" />
          <Icon name="wb_sunny" className="text-primary-container" />
        </div>
      </section>

      <section aria-labelledby="chips" className="space-y-md">
        <h2 id="chips" className="font-headline text-headline-md text-on-surface">Chips</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Chip tone="primary" icon="edit">Label</Chip>
          <Chip tone="primary">New</Chip>
          <Chip tone="secondary">Style</Chip>
          <Chip>Lifestyle</Chip>
        </div>
      </section>

      <section aria-labelledby="navigation" className="space-y-md">
        <h2 id="navigation" className="font-headline text-headline-md text-on-surface">Navigation and search</h2>
        <PillNav
          label="Demo navigation"
          items={[
            { icon: "home", label: "Home", current: true },
            { icon: "search", label: "Search" },
            { icon: "shopping_bag", label: "Bag, 2 items", badge: 2 },
          ]}
        />
        <SearchField label="Search products" className="max-w-sm" />
      </section>

      <section aria-labelledby="progress" className="space-y-md">
        <h2 id="progress" className="font-headline text-headline-md text-on-surface">Progress</h2>
        <div className="max-w-sm space-y-3">
          <ProgressBar label="Demo progress, primary" value={60} tone="primary" />
          <ProgressBar label="Demo progress, secondary" value={80} tone="secondary" />
          <ProgressBar label="Demo progress, tertiary" value={50} tone="tertiary" />
        </div>
      </section>

      <section aria-labelledby="inputs" className="space-y-md">
        <h2 id="inputs" className="font-headline text-headline-md text-on-surface">Inputs</h2>
        <Input type="email" placeholder="Email address" aria-label="Email address" className="max-w-sm" />
      </section>

      <section aria-labelledby="cards" className="space-y-md">
        <h2 id="cards" className="font-headline text-headline-md text-on-surface">Cards</h2>
        <div className="grid gap-gutter md:grid-cols-2">
          <Card>
            <p className="font-body text-body-md text-on-surface">Solid card on the page background.</p>
          </Card>
          <Card variant="glass">
            <p className="font-body text-body-md text-on-surface">Glass card: 70% white with a 16px blur.</p>
          </Card>
        </div>
      </section>
    </Container>
  );
}
