import { Pagination } from "../../../components/store/pagination";
import { ProductCard } from "../../../components/store/product-card";
import { Container } from "../../../components/ui/container";
import { Grid } from "../../../components/ui/grid";
import { SearchField } from "../../../components/ui/search-field";
import { searchProducts } from "../../../lib/shopify/catalog";
import { firstParam } from "../../../lib/params";

export const metadata = { title: "Search" };

const MAX_QUERY_LENGTH = 120;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = (firstParam(params.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const after = firstParam(params.after);
  const results = query ? await searchProducts(query, after) : null;

  return (
    <Container className="space-y-lg py-lg">
      <h1 className="font-headline text-headline-lg text-on-surface">Search</h1>
      <form method="get" role="search" className="max-w-xl">
        <SearchField label="Search products" name="q" defaultValue={query} />
      </form>

      {results && results.nodes.length === 0 && (
        <p className="font-body text-body-lg text-on-surface-variant">No pieces match “{query}”.</p>
      )}

      {results && results.nodes.length > 0 && (
        <Grid>
          {results.nodes.map((product) => (
            <div key={product.id} className="col-span-2 md:col-span-4 lg:col-span-3">
              <ProductCard product={product} />
            </div>
          ))}
        </Grid>
      )}

      {results && (
        <Pagination
          basePath="/search"
          search={{ q: query }}
          nextCursor={results.pageInfo.hasNextPage ? results.pageInfo.endCursor : null}
        />
      )}
    </Container>
  );
}
