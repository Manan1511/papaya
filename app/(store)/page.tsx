import { NewsletterForm } from "../../components/store/newsletter-form";
import { ProductCard } from "../../components/store/product-card";
import { ButtonLink } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
import { Grid } from "../../components/ui/grid";
import { Icon } from "../../components/ui/icon";
import { landingCopy } from "../../lib/content/landing";
import { getPlaceholder } from "../../lib/content/placeholders";

export default function Home() {
  const latest = landingCopy.latestHandles.map(getPlaceholder);
  const bestSeller = getPlaceholder(landingCopy.bestSellerHandle);

  return (
    <>
      <section className="bg-gradient-to-br from-primary-container via-tertiary-fixed to-secondary-fixed">
        <Container className="flex min-h-[28rem] flex-col justify-center gap-6 py-section-gap">
          <h1 className="max-w-2xl font-headline text-headline-xl text-on-primary-container">
            {landingCopy.heroTitle}
          </h1>
          <p className="max-w-xl font-body text-body-lg text-on-primary-container">{landingCopy.heroBody}</p>
          <div>
            <ButtonLink href="/shop" size="lg">
              Shop the collection
            </ButtonLink>
          </div>
        </Container>
      </section>

      <div aria-hidden="true" className="citrus-band" />

      <Container className="space-y-10 py-section-gap">
        <header className="space-y-3 text-center">
          <h2 className="font-headline text-headline-lg text-primary">{landingCopy.latestTitle}</h2>
          <p className="mx-auto max-w-md font-body text-body-md text-on-surface-variant">{landingCopy.latestBody}</p>
        </header>
        <Grid>
          {latest.map((product) => (
            <div key={product.id} className="col-span-2 md:col-span-2 lg:col-span-3">
              <ProductCard product={product} href="/shop" />
            </div>
          ))}
        </Grid>
      </Container>

      <Container className="pb-section-gap">
        <Grid>
          <div className="col-span-4 flex flex-col justify-between gap-6 rounded-lg bg-secondary-fixed p-8 md:col-span-8 lg:col-span-6">
            <div className="space-y-3">
              <h2 className="font-headline text-headline-lg text-on-secondary-fixed">{landingCopy.amalfiTitle}</h2>
              <p className="font-body text-body-lg text-on-secondary-fixed">{landingCopy.amalfiBody}</p>
            </div>
            <div>
              <ButtonLink href="/collections/the-amalfi-edit" variant="outlined">
                Explore the edit
              </ButtonLink>
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-4 rounded-lg bg-tertiary-fixed p-6 md:col-span-4 lg:col-span-3">
            <span className="font-label text-label-md text-on-tertiary-fixed-variant">Best seller</span>
            <ProductCard product={bestSeller} href="/shop" />
          </div>

          <div className="col-span-4 flex flex-col justify-between gap-6 rounded-lg bg-surface-container-high p-6 md:col-span-4 lg:col-span-3">
            <Icon name="diamond" className="text-[40px] text-tertiary" />
            <div className="space-y-2">
              <h2 className="font-headline text-headline-md text-on-surface">{landingCopy.makingTitle}</h2>
              <p className="font-body text-body-md text-on-surface-variant">{landingCopy.makingBody}</p>
            </div>
            <div>
              <ButtonLink href="/pages/sustainability" variant="outlined">
                Read more
              </ButtonLink>
            </div>
          </div>
        </Grid>
      </Container>

      <section className="bg-primary-fixed/40 py-section-gap">
        <Container className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="font-headline text-headline-lg text-on-surface">{landingCopy.newsletterTitle}</h2>
          <p className="font-body text-body-lg text-on-surface-variant">{landingCopy.newsletterBody}</p>
          <div className="mx-auto max-w-md">
            <NewsletterForm />
          </div>
        </Container>
      </section>
    </>
  );
}
