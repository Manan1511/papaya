import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "../../../../components/ui/container";
import { getPolicy, isPolicyHandle } from "../../../../lib/shopify/policies";

type Params = Promise<{ handle: string }>;

async function findPolicy(params: Params) {
  const { handle } = await params;
  return isPolicyHandle(handle) ? getPolicy(handle) : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const policy = await findPolicy(params);
  return policy ? { title: policy.title } : {};
}

export default async function PolicyPage({ params }: { params: Params }) {
  const policy = await findPolicy(params);
  if (!policy) notFound();

  return (
    <Container>
      <article className="mx-auto max-w-3xl space-y-10 py-lg">
        <h1 className="font-headline text-headline-xl text-on-surface">{policy.title}</h1>
        {/* The shop owner writes this HTML in Shopify's policy editor, so it is shown as written. */}
        <div className="policy-body" dangerouslySetInnerHTML={{ __html: policy.body }} />
      </article>
    </Container>
  );
}
