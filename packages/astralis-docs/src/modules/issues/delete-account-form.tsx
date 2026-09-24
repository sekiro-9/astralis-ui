"use client";

import { useActionState } from "react";
import { Alert, Button, Field, Input } from "astralis-ui";

import { deleteAccount, type FormState } from "@/app/issues/actions";

export function DeleteAccountForm({ confirmWord }: { confirmWord: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(deleteAccount, { error: null });

  return (
    <form action={action} className="flex flex-col gap-3">
      <Field required>
        <Field.Label>Type {confirmWord} to confirm</Field.Label>
        <Input name="confirm" autoComplete="off" spellCheck={false} required />
      </Field>
      {state.error && (
        <Alert status="error" variant="subtle">
          <Alert.Description>{state.error}</Alert.Description>
        </Alert>
      )}
      <Button type="submit" colorScheme="error" variant="outline" loading={pending} className="self-start">
        Delete my account
      </Button>
    </form>
  );
}
