import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InfoArticle } from "../../../../components/store/info-article";
import { Container } from "../../../../components/ui/container";
import { infoPages } from "../../../../lib/content/pages";

function findPage(slug: string) {
  return infoPages.find((page) => page.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = findPage(slug);
  return page ? { title: page.title, description: page.intro } : {};
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) notFound();

  return (
    <Container>
      <InfoArticle page={page} />
    </Container>
  );
}
