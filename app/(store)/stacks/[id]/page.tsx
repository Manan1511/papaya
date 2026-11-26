import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PreviewBanner } from "../../../../components/store/preview-banner";
import { ShopStackForm } from "../../../../components/store/shop-stack-form";
import { Container } from "../../../../components/ui/container";
import { getHomeContent } from "../../../../lib/cms/home";
import { getStackProducts } from "../../../../lib/shopify/catalog";
import { stackPieces } from "../../../../lib/shopify/stack";

type Props = { params: Promise<{ id: string }> };

async function findStack(params: Props["params"]) {
  const { id } = await params;
  const { content, preview } = await getHomeContent();
  return { stack: content.stacks.find((stack) => stack.id === id), preview };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stack } = await findStack(params);
  if (!stack) return {};
  return { title: stack.title, openGraph: { images: [{ url: stack.image.url }] } };
}

export default async function StackPage({ params }: Props) {
  const { stack, preview } = await findStack(params);
  if (!stack) notFound();
  const pieces = stackPieces(stack.productIds, await getStackProducts(stack.productIds));

  return (
    <>
      {preview && <PreviewBanner path={`/stacks/${stack.id}`} />}
      <Container className="space-y-lg py-lg">
        <nav aria-label="Breadcrumb" className="font-label text-label-sm uppercase tracking-[0.05em] text-on-surface-variant">
          <Link href="/#stacks" className="hover:text-primary">
            The stacks
          </Link>
          <span className="mx-2">/</span>
          <span aria-current="page">{stack.title}</span>
        </nav>

        <div className="grid items-start gap-10 md:grid-cols-2">
          <Image
            src={stack.image.url}
            alt={stack.title}
            width={stack.image.width}
            height={stack.image.height}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="h-auto w-full rounded-xl"
          />
          <div className="flex flex-col gap-6">
            <h1 className="font-headline text-headline-lg text-on-surface">{stack.title}</h1>
            {pieces.length > 0 ? (
              <ShopStackForm pieces={pieces} />
            ) : (
              <p className="font-body text-body-lg text-on-surface-variant">These pieces aren't available right now.</p>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
