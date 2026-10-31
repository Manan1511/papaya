"use client";

import { useActionState } from "react";
import { Field } from "../../../components/admin/ui";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { type SignInState, signIn } from "../auth-actions";

const initialState: SignInState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="space-y-5">
      <Field label="Password">
        <Input type="password" name="password" autoComplete="current-password" required autoFocus />
      </Field>
      {state.error && (
        <p role="alert" className="font-body text-body-md text-error">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
