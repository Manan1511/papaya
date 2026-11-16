import { CollectionTile } from "../../components/store/collection-tile";
import { HeroVideo } from "../../components/store/hero-video";
import { PreviewBanner } from "../../components/store/preview-banner";
import { ProductCard } from "../../components/store/product-card";
import { ReelsStrip } from "../../components/store/reels-strip";
import { ButtonLink } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
import { Grid } from "../../components/ui/grid";
import { Icon } from "../../components/ui/icon";
import { getHomeContent } from "../../lib/cms/home";
import { ALL_PRODUCTS_HANDLE, getCollectionPage, getHomeCollections } from "../../lib/shopify/catalog";

// Tiles per row: two on a phone, with an odd one out given the first full row; two on a tablet; up to
// three on a desktop.
function tileSpan(index: number, count: number): string {
  const lead = index === 0 && count % 2 === 1;
  return `${lead ? "col-span-4" : "col-span-2"} ${lead ? "md:col-span-8" : "md:col-span-4"} lg:col-span-4`;
}

export default async function Home() {
  const [{ content, preview }, collections, bestSelling] = await Promise.all([
    getHomeContent(),
    getHomeCollections(),
    getCollectionPage({ handle: ALL_PRODUCTS_HANDLE, sort: "best", filters: [] }),
  ]);
  const [bestSeller] = bestSelling?.products.nodes ?? [];
  return (
    <>
      {preview && <PreviewBanner path="/" />}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="beach-stripes absolute inset-0 -z-10" />
        {/* The white wave sweeps from the upper left to the lower right over the stripes. */}
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 -z-10 size-full">
          <path d="M0 6C40 6 70 30 100 31V70C92 78 45 95 0 99Z" className="fill-surface" />
        </svg>
        <Container className="grid min-h-[38rem] items-center gap-10 pb-section-gap pt-32 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6">
            <h1 className="max-w-xl font-headline text-headline-xl text-on-surface">{content.heroTitle}</h1>
            <p className="w-fit max-w-xl text-balance rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-3 font-body text-body-lg font-semibold text-on-surface">
              {content.heroBody}
            </p>
            <div className="flex justify-center md:justify-start">
              <ButtonLink href="/shop" size="lg">
                Shop the collection
              </ButtonLink>
            </div>
          </div>
          {content.heroVideo && <HeroVideo src={content.heroVideo} />}
        </Container>
        <div aria-hidden="true" className="stripe-band h-9 md:h-10" />
      </section>

      {collections.length > 0 && (
        <Container className="space-y-10 py-section-gap">
          <header className="space-y-3 text-center">
            <h2 className="font-headline text-headline-lg text-primary">{content.collectionsTitle}</h2>
            <p className="mx-auto max-w-md font-body text-body-md text-on-surface-variant">{content.collectionsBody}</p>
          </header>
          <Grid>
            {collections.map((collection, index) => (
              <div key={collection.id} className={tileSpan(index, collections.length)}>
                <CollectionTile collection={collection} />
              </div>
            ))}
          </Grid>
        </Container>
      )}

      {content.reels.length > 0 && (
        <section className="space-y-10 pb-section-gap">
          {(content.reelsTitle || content.reelsBody) && (
            <Container>
              <header className="space-y-3 text-center">
                {content.reelsTitle && <h2 className="font-headline text-headline-lg text-primary">{content.reelsTitle}</h2>}
                {content.reelsBody && (
                  <p className="mx-auto max-w-md font-body text-body-md text-on-surface-variant">{content.reelsBody}</p>
                )}
              </header>
            </Container>
          )}
          <ReelsStrip reels={content.reels} />
        </section>
      )}

      <Container className="pb-section-gap">
        <Grid>
          <div className="col-span-4 flex flex-col justify-between gap-6 rounded-lg border-[1.5px] border-tertiary bg-secondary-fixed p-8 shadow-hard-secondary md:col-span-8 lg:col-span-6">
            <div className="space-y-3">
              <h2 className="font-headline text-headline-lg text-on-secondary-fixed">{content.amalfiTitle}</h2>
              <p className="font-body text-body-lg text-on-secondary-fixed">{content.amalfiBody}</p>
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
              <h2 className="font-headline text-headline-md text-on-surface">{content.makingTitle}</h2>
              <p className="font-body text-body-md text-on-surface">{content.makingBody}</p>
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
