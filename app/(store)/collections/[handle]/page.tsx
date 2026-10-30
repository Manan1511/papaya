import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pagination } from "../../../../components/store/pagination";
import { ProductCard } from "../../../../components/store/product-card";
import { ProductFilters } from "../../../../components/store/product-filters";
import { Container } from "../../../../components/ui/container";
import { Grid } from "../../../../components/ui/grid";
import { getCollectionPage } from "../../../../lib/shopify/catalog";
import { listingToSearch, parseListing, toProductFilters } from "../../../../lib/shopify/listing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  // The default view, so this call shares its cache entry with the page below.
  const page = await getCollectionPage({ handle, sort: "best", filters: [] });
  if (!page) return {};
  return {
    title: page.title,
    description: page.description.slice(0, 160) || undefined,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { handle } = await params;
  const listing = parseListing(await searchParams);
  const page = await getCollectionPage({
    handle,
    sort: listing.sort,
    filters: toProductFilters(listing),
    after: listing.after,
  });
  if (!page) notFound();

  const { nodes, pageInfo } = page.products;

  return (
    <Container className="space-y-lg py-lg">
      <header className="space-y-2">
        <h1 className="font-headline text-headline-lg text-on-surface">{page.title}</h1>
        {page.description && (
          <p className="font-body text-body-lg text-on-surface-variant">{page.description}</p>
        )}
      </header>
      <ProductFilters params={listing} showType={false} />
      {nodes.length === 0 ? (
        <p className="font-body text-body-lg text-on-surface-variant">No pieces match these filters.</p>
      ) : (
        <Grid>
          {nodes.map((product) => (
            <div key={product.id} className="col-span-2 md:col-span-4 lg:col-span-3">
              <ProductCard product={product} />
            </div>
          ))}
        </Grid>
      )}
      <Pagination
        basePath={`/collections/${handle}`}
        search={listingToSearch(listing)}
        nextCursor={pageInfo.hasNextPage ? pageInfo.endCursor : null}
      />
    </Container>
  );
}
