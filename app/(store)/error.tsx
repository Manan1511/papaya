"use client";

import { Button } from "../../components/ui/button";
import { Container } from "../../components/ui/container";

// Shows a plain message. The error itself stays in the server log, never on the page.
export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="space-y-md py-xl">
      <h1 className="font-headline text-headline-lg text-on-surface">Something went wrong</h1>
      <p className="font-body text-body-lg text-on-surface-variant">
        We couldn&apos;t load this page. Try again in a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </Container>
  );
}
