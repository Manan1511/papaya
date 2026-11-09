import { ProductCard } from "../../components/store/product-card";
import { ButtonLink } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
import { Grid } from "../../components/ui/grid";
import { Icon } from "../../components/ui/icon";
import { landingCopy } from "../../lib/content/landing";
import { ALL_PRODUCTS_HANDLE, getCollectionPage } from "../../lib/shopify/catalog";

export default async function Home() {
  const [newest, bestSelling] = await Promise.all([
    getCollectionPage({ handle: ALL_PRODUCTS_HANDLE, sort: "newest", filters: [] }),
    getCollectionPage({ handle: ALL_PRODUCTS_HANDLE, sort: "best", filters: [] }),
  ]);
  const latest = newest?.products.nodes.slice(0, 4) ?? [];
  const [bestSeller] = (bestSelling?.products.nodes ?? []).filter((product) => !latest.some((item) => item.id === product.id));

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="beach-stripes absolute inset-0 -z-10" />
        {/* The white wave sweeps from the upper left to the lower right over the stripes. */}
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 -z-10 size-full">
          <path d="M0 6C40 6 70 30 100 31V70C92 78 45 95 0 99Z" className="fill-surface" />
        </svg>
        <Container className="flex min-h-[38rem] flex-col justify-center gap-6 pb-section-gap pt-32">
          <h1 className="max-w-xl font-headline text-headline-xl text-on-surface">{landingCopy.heroTitle}</h1>
          <p className="w-fit max-w-xl text-balance rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-3 font-body text-body-lg font-semibold text-on-surface">
            {landingCopy.heroBody}
          </p>
          <div>
            <ButtonLink href="/shop" size="lg">
              Shop the collection
            </ButtonLink>
          </div>
        </Container>
        <div aria-hidden="true" className="stripe-band h-9 md:h-10" />
      </section>

      {latest.length > 0 && (
        <Container className="space-y-10 py-section-gap">
          <header className="space-y-3 text-center">
            <h2 className="font-headline text-headline-lg text-primary">{landingCopy.latestTitle}</h2>
            <p className="mx-auto max-w-md font-body text-body-md text-on-surface-variant">{landingCopy.latestBody}</p>
          </header>
          <Grid>
            {latest.map((product) => (
              <div key={product.id} className="col-span-2 md:col-span-4 lg:col-span-3">
                <ProductCard product={product} />
              </div>
            ))}
          </Grid>
        </Container>
      )}

      <Container className="pb-section-gap">
        <Grid>
          <div className="col-span-4 flex flex-col justify-between gap-6 rounded-lg border-[1.5px] border-tertiary bg-secondary-fixed p-8 shadow-hard-secondary md:col-span-8 lg:col-span-6">
            <div className="space-y-3">
              <h2 className="font-headline text-headline-lg text-on-secondary-fixed">{landingCopy.amalfiTitle}</h2>
              <p className="font-body text-body-lg text-on-secondary-fixed">{landingCopy.amalfiBody}</p>
            </div>
            <div>
              <ButtonLink href="/collections/the-amalfi-edit" variant="outlined" className="hover:shadow-hard-tertiary">
                Explore the edit
              </ButtonLink>
            </div>
          </div>

          {bestSeller && (
            <div className="col-span-4 flex flex-col gap-4 md:col-span-4 lg:col-span-3">
              <h2 className="font-headline text-headline-md text-on-surface">Best seller</h2>
              <ProductCard product={bestSeller} />
            </div>
          )}

          <div className="col-span-4 flex flex-col justify-between gap-6 rounded-lg border-[1.5px] border-tertiary bg-surface-container-lowest p-6 shadow-hard-secondary md:col-span-4 lg:col-span-3">
            <span className="flex size-16 items-center justify-center rounded-full border-[1.5px] border-tertiary bg-surface-container-lowest">
              <Icon name="diamond" className="text-[32px] text-tertiary" />
            </span>
            <div className="space-y-2">
              <h2 className="font-headline text-headline-md text-on-surface">{landingCopy.makingTitle}</h2>
              <p className="font-body text-body-md text-on-surface">{landingCopy.makingBody}</p>
            </div>
            <div>
              <ButtonLink href="/pages/sustainability" variant="outlined">
                Read more
              </ButtonLink>
            </div>
          </div>
        </Grid>
      </Container>
    </>
  );
}
