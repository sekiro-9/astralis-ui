"use client";

import { useActionState } from "react";
import { Alert, Button, Field, Textarea } from "astralis-ui";

import { postComment, type FormState } from "@/app/issues/actions";

export function CommentForm({ issueId, returnTo, maxLength }: { issueId: string; returnTo: string; maxLength: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(postComment, { error: null });

  return (
    // Keyed by the success count, so a posted comment leaves an empty box.
    <form key={state.done ?? 0} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="issue" value={issueId} />
      <input type="hidden" name="return" value={returnTo} />
      <Field>
        <Field.Label>Add a comment</Field.Label>
        <Textarea name="body" rows={3} maxLength={maxLength} required autoGrow placeholder="Shown as plain text." />
      </Field>
      {state.error && (
        <Alert status="error" variant="subtle">
          <Alert.Description>{state.error}</Alert.Description>
        </Alert>
      )}
      <Button type="submit" size="sm" loading={pending} className="self-start">
        Comment
      </Button>
    </form>
  );
}
