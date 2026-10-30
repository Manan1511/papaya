import Image from "next/image";
import Link from "next/link";
import { Container } from "../../../components/ui/container";
import { Grid } from "../../../components/ui/grid";
import { getCollections } from "../../../lib/shopify/catalog";

export const metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <Container className="space-y-lg py-lg">
      <h1 className="font-headline text-headline-lg text-on-surface">Collections</h1>
      <Grid>
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group col-span-2 flex flex-col gap-3 md:col-span-4 lg:col-span-4"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-container">
              {collection.image && (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText ?? collection.title}
                  width={collection.image.width ?? 800}
                  height={collection.image.height ?? 1000}
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <h2 className="font-headline text-headline-md text-on-surface group-hover:text-primary">
              {collection.title}
            </h2>
          </Link>
        ))}
      </Grid>
    </Container>
  );
}
