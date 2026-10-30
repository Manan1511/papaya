import Image from "next/image";
import { ButtonLink } from "../../../components/ui/button";
import { Container } from "../../../components/ui/container";
import { Icon } from "../../../components/ui/icon";
import { storyCopy, storyMilestones } from "../../../lib/content/story";

export const metadata = { title: "Our Story" };

export default function StoryPage() {
  return (
    <>
      <section className="bg-surface-container-low">
        <Container className="grid items-center gap-10 py-section-gap md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="font-headline text-headline-xl text-primary">{storyCopy.title}</h1>
            <p className="font-body text-body-lg text-on-surface-variant">{storyCopy.body}</p>
            <div>
              <ButtonLink href="#timeline" variant="secondary">
                {storyCopy.cta}
              </ButtonLink>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-primary-container via-tertiary-fixed to-secondary-fixed p-10">
            <Image
              src="/brand/papaya-logo.jpg"
              alt="Papaya"
              width={865}
              height={263}
              className="h-auto w-full max-w-sm mix-blend-multiply"
            />
          </div>
        </Container>
      </section>

      <section id="timeline" aria-labelledby="timeline-title">
        <Container className="space-y-10 py-section-gap">
          <h2 id="timeline-title" className="text-center font-headline text-headline-lg text-on-surface">
            Milestones in the sun
          </h2>
          <ol className="mx-auto flex max-w-3xl flex-col gap-8">
            {storyMilestones.map((milestone) => (
              <li key={milestone.title} className="flex gap-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                  <Icon name={milestone.icon} />
                </div>
                <div className="space-y-2">
                  <p className="font-label text-label-sm uppercase tracking-wider text-on-surface-variant">
                    {milestone.when}
                  </p>
                  <h3 className="font-headline text-headline-md text-on-surface">{milestone.title}</h3>
                  <p className="font-body text-body-md text-on-surface-variant">{milestone.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
