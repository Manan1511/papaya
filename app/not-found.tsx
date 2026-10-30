import { ButtonLink } from "../components/ui/button";
import { Container } from "../components/ui/container";

export default function NotFound() {
  return (
    <Container className="space-y-md py-xl">
      <h1 className="font-headline text-headline-lg text-on-surface">Page not found</h1>
      <p className="font-body text-body-lg text-on-surface-variant">
        The page you&apos;re looking for has moved or doesn&apos;t exist.
      </p>
      <ButtonLink href="/shop">Shop the collection</ButtonLink>
    </Container>
  );
}
