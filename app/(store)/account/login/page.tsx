import { Button } from "../../../../components/ui/button";
import { Container } from "../../../../components/ui/container";
import { Input } from "../../../../components/ui/input";

export const metadata = { title: "Sign in" };

// Sign-in moves to Shopify's hosted customer login in Phase 4c. Until then nothing is submitted.
export default function LoginPage() {
  return (
    <Container className="mx-auto max-w-md space-y-6 py-lg">
      <h1 className="font-headline text-headline-lg text-on-surface">Sign in</h1>
      <p className="font-body text-body-md text-on-surface-variant">
        Sign-in opens once customer accounts are connected.
      </p>
      <form className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 font-label text-label-md text-on-surface">
          Email
          <Input type="email" name="email" disabled />
        </label>
        <Button type="submit" disabled>
          Continue
        </Button>
      </form>
    </Container>
  );
}
