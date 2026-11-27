import { CategoryBar } from "../../components/store/category-bar";
import { CollectionTile } from "../../components/store/collection-tile";
import { HeroHeadline } from "../../components/store/hero-headline";
import { HeroVideo } from "../../components/store/hero-video";
import { PreviewBanner } from "../../components/store/preview-banner";
import { ProductCard } from "../../components/store/product-card";
import { AccentHeading } from "../../components/store/accent-heading";
import { ReelsStrip } from "../../components/store/reels-strip";
import { StackCard } from "../../components/store/stack-card";
import { StackCarousel } from "../../components/store/stack-carousel";
import { ButtonLink } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
import { Grid } from "../../components/ui/grid";
import { Icon } from "../../components/ui/icon";
import { homeDefaults } from "../../lib/content/landing";
import { getHomeContent } from "../../lib/cms/home";
import { ALL_PRODUCTS_HANDLE, getCollectionPage, getShoppableCollections, getStackProducts } from "../../lib/shopify/catalog";
import { stackPieces } from "../../lib/shopify/stack";

// Tiles per row: two on a phone, with an odd one out given the first full row; two on a tablet; up to
// three on a desktop.
function tileSpan(index: number, count: number): string {
  const lead = index === 0 && count % 2 === 1;
  return `${lead ? "col-span-4" : "col-span-2"} ${lead ? "md:col-span-8" : "md:col-span-4"} lg:col-span-4`;
}

export default async function Home() {
  const [{ content, preview }, shoppable, bestSelling] = await Promise.all([
    getHomeContent(),
    getShoppableCollections(),
    getCollectionPage({ handle: ALL_PRODUCTS_HANDLE, sort: "best", filters: [] }),
  ]);
  const [bestSeller] = bestSelling?.products.nodes ?? [];
  // The category bar lists every collection. The tiles further down show the first six.
  const collections = shoppable.slice(0, 6);
  // A stack shows only while at least one of its pieces is in the shop. If they can't be read, the
  // section is left out and the rest of the page still shows.
  const stackProducts = await getStackProducts(content.stacks.flatMap((stack) => stack.productIds)).catch(() => []);
  const stacks = content.stacks
    .map((stack) => ({ stack, pieces: stackPieces(stack.productIds, stackProducts) }))
    .filter(({ pieces }) => pieces.length > 0);
  // Until reels are added the section shows placeholder frames, with the shipped heading if none was saved.
  const reelsTitle = content.reelsTitle || homeDefaults.reelsTitle;
  const reelsBody = content.reelsBody || homeDefaults.reelsBody;
  return (
    <>
      {preview && <PreviewBanner path="/" />}
      <CategoryBar collections={shoppable} />
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="beach-dots absolute inset-0 -z-10" />
        {/* The white wave sweeps from the upper left to the lower right over the dots. */}
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 -z-10 size-full">
          <path d="M0 6C40 6 70 30 100 31V70C92 78 45 95 0 99Z" className="fill-surface" />
        </svg>
        <Container className="grid min-h-[38rem] items-center gap-10 pb-section-gap pt-10 md:grid-cols-2 md:pt-16">
          <div className="flex flex-col justify-center gap-6">
            {/* On a phone the headline runs across the dots, so each letter gets a white outline (stroke
                painted under the fill) to stay readable on any colour. */}
            <HeroHeadline className="max-w-xl text-[clamp(1.75rem,9.6vw,3rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-on-surface max-md:[-webkit-text-stroke:0.4rem_#fff] max-md:[paint-order:stroke_fill] md:text-[clamp(1.75rem,4.4vw,3rem)]">
              {content.heroTitle}
            </HeroHeadline>
            <p className="w-fit max-w-xl text-balance rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-3 font-body text-body-lg font-semibold text-on-surface">
              {content.heroBody}
            </p>
            <div className="flex justify-center md:justify-start">
              <ButtonLink href="/shop" size="lg">
                Shop the collection
              </ButtonLink>
            </div>
          </div>
          {content.heroVideo && (
            <div className="max-md:order-first">
              <HeroVideo src={content.heroVideo} />
            </div>
          )}
        </Container>
        <div aria-hidden="true" className="stripe-band h-9 md:h-10" />
      </section>

      {stacks.length > 0 && (
        <section id="stacks" className="scroll-mt-24 pt-section-gap">
          <Container className="space-y-10">
            <header className="space-y-3 text-center">
              <h2 className="font-headline text-headline-lg uppercase text-primary">
                {content.stacksTitle || homeDefaults.stacksTitle}
              </h2>
              <p className="mx-auto max-w-md text-balance font-body text-body-md text-on-surface-variant">
                {content.stacksBody || homeDefaults.stacksBody}
              </p>
            </header>
            <StackCarousel>
              {stacks.map(({ stack, pieces }) => (
                <StackCard key={stack.id} stack={stack} pieces={pieces} />
              ))}
            </StackCarousel>
          </Container>
        </section>
      )}

      {(content.reels.length > 0 || content.reelsPlaceholders) && (
      <section className="space-y-10 pt-section-gap">
        <Container>
          <header className="space-y-3 text-center">
            <AccentHeading className="font-headline text-headline-lg text-tertiary">{reelsTitle}</AccentHeading>
            <p className="mx-auto max-w-xs text-balance font-body text-body-md text-on-surface-variant md:max-w-md">{reelsBody}</p>
          </header>
        </Container>
        <ReelsStrip reels={content.reels} />
      </section>
      )}

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

      <Container className={collections.length > 0 ? "pb-section-gap" : "py-section-gap"}>
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
