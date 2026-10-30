import { requireDevPreview } from "../../../lib/content/dev";
import { Field } from "../../../components/admin/ui";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";

// Sign-in with the shared password arrives in Phase 6. Until then nothing is submitted.
export default function AdminLogin() {
  requireDevPreview();
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <Card className="w-full max-w-sm space-y-6">
        <h1 className="font-headline text-headline-md text-on-surface">Papaya admin</h1>
        <p className="font-body text-body-md text-on-surface-variant">Sign-in arrives in Phase 6.</p>
        <form className="space-y-5">
          <Field label="Password">
            <Input type="password" name="password" disabled />
          </Field>
          <Button type="submit" disabled>
            Sign in
          </Button>
        </form>
      </Card>
    </main>
  );
}
