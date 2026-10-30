import { notFound } from "next/navigation";
import { Pagination } from "../../../components/store/pagination";
import { ProductCard } from "../../../components/store/product-card";
import { ProductFilters } from "../../../components/store/product-filters";
import { Container } from "../../../components/ui/container";
import { Grid } from "../../../components/ui/grid";
import { ALL_PRODUCTS_HANDLE, getCollectionPage } from "../../../lib/shopify/catalog";
import { listingToSearch, parseListing, toProductFilters } from "../../../lib/shopify/listing";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListing(await searchParams);
  const page = await getCollectionPage({
    handle: ALL_PRODUCTS_HANDLE,
    sort: params.sort,
    filters: toProductFilters(params),
    after: params.after,
  });
  if (!page) notFound();

  const { nodes, pageInfo } = page.products;

  return (
    <Container className="space-y-lg py-lg">
      <h1 className="font-headline text-headline-lg text-on-surface">Shop</h1>
      <ProductFilters params={params} showType />
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
        basePath="/shop"
        search={listingToSearch(params)}
        nextCursor={pageInfo.hasNextPage ? pageInfo.endCursor : null}
      />
    </Container>
  );
}
