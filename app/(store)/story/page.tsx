import Image from "next/image";
import { ButtonLink } from "../../../components/ui/button";
import { Container } from "../../../components/ui/container";
import { Icon } from "../../../components/ui/icon";
import { storyCopy } from "../../../lib/content/story";

export const metadata = { title: "Our Story" };

export default function StoryPage() {
  return (
    <section className="bg-surface-container-low">
      <Container className="grid items-center gap-10 py-section-gap md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-balance font-headline text-headline-xl text-primary">{storyCopy.title}</h1>
          {storyCopy.paragraphs.map((paragraph) => (
            <p key={paragraph} className="font-body text-body-lg text-on-surface-variant">
              {paragraph}
            </p>
          ))}
          <p className="font-headline text-headline-md text-on-surface">
            {storyCopy.signOff}
            <span className="block text-primary">{storyCopy.signature}</span>
          </p>
          <div>
            <ButtonLink href="/shop" size="lg">
              {storyCopy.cta}
            </ButtonLink>
          </div>
        </div>
        <div className="relative mt-lg md:mt-0">
          <div className="overflow-hidden rounded-lg border-[1.5px] border-tertiary shadow-hard-secondary">
            <Image
              src="/brand/story-founders.jpg"
              alt={storyCopy.photoAlt}
              width={870}
              height={1087}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute -bottom-4 -left-2 flex size-16 -rotate-12 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant shadow-sm md:-bottom-6 md:-left-6"
          >
            <Icon name="wb_sunny" filled className="text-[32px]" />
          </span>
        </div>
      </Container>
    </section>
  );
}
