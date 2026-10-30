import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InfoArticle } from "../../../../components/store/info-article";
import { Container } from "../../../../components/ui/container";
import { policies } from "../../../../lib/content/pages";

function findPolicy(handle: string) {
  return policies.find((policy) => policy.slug === handle);
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const policy = findPolicy(handle);
  return policy ? { title: policy.title } : {};
}

export default async function PolicyPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const policy = findPolicy(handle);
  if (!policy) notFound();

  return (
    <Container>
      <InfoArticle page={policy} />
    </Container>
  );
}
