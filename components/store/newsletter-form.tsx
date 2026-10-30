import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Inert until Phase 7 connects it to the Shopify customer API. Nothing is submitted yet.
export function NewsletterForm() {
  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row">
      <Input type="email" name="email" aria-label="Email address" placeholder="Email address" disabled />
      <Button type="submit" disabled>
        Sign up
      </Button>
      <p className="font-body text-label-md text-on-surface-variant sm:basis-full">
        Sign-ups open once the store is connected.
      </p>
    </form>
  );
}
