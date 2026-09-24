"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Alert, Button, Field, Input, Text, Textarea } from "astralis-ui";

import { submitDraft, type FormState } from "@/app/issues/actions";

export interface DuplicateOption {
  id: string;
  href: string;
  title: string;
  label: string;
}

interface ReportFormProps {
  draftId: string;
  description: { title: string; happened?: string; expected?: string };
  duplicates: DuplicateOption[];
  limits: { title: number; body: number };
}

/**
 * The reporter's last look before a report goes public: their words, and,
 * when the fingerprint matches, the choice between adding to an existing
 * issue and opening a new one. The likely duplicate is chosen by default,
 * since that is what keeps one problem in one issue.
 */
export function ReportForm({ draftId, description, duplicates, limits }: ReportFormProps) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitDraft, { error: null });
  const [join, setJoin] = useState(duplicates[0]?.id ?? "new");

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="draft" value={draftId} />

      <Field required>
        <Field.Label>Title</Field.Label>
        <Input name="title" defaultValue={description.title} maxLength={limits.title} required />
      </Field>
      <Field>
        <Field.Label>What happened</Field.Label>
        <Textarea name="happened" defaultValue={description.happened ?? ""} maxLength={limits.body} rows={4} autoGrow />
      </Field>
      <Field>
        <Field.Label>What you expected</Field.Label>
        <Textarea name="expected" defaultValue={description.expected ?? ""} maxLength={limits.body} rows={3} autoGrow />
      </Field>

      {duplicates.length > 0 && (
        <fieldset className="flex flex-col gap-2 rounded-xl border border-stroke-base p-4">
          <legend className="px-1 text-sm font-medium text-label">This looks like an existing issue</legend>
          <Text size="sm" color="muted">
            Reports with the same component, rules and library version were filed before. Adding yours
            raises that issue&apos;s report count, which tells maintainers how many people it affects.
          </Text>
          {duplicates.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-subtle">
              <input type="radio" name="join" value={d.id} checked={join === d.id} onChange={() => setJoin(d.id)} className="mt-1" />
              <span className="text-sm">
                Add my report to{" "}
                <Link href={d.href} target="_blank" className="font-medium underline">
                  {d.title}
                </Link>{" "}
                <span className="text-label-muted">({d.label})</span>
              </span>
            </label>
          ))}
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-subtle">
            <input type="radio" name="join" value="new" checked={join === "new"} onChange={() => setJoin("new")} className="mt-1" />
            <span className="text-sm">It is a different problem: open a new issue</span>
          </label>
        </fieldset>
      )}

      {state.error && (
        <Alert status="error" variant="subtle">
          <Alert.Description>{state.error}</Alert.Description>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {join === "new" ? "Submit the issue" : "Add my report"}
        </Button>
        <Text size="xs" color="muted">
          Submitting makes the report public, with your GitHub username.
        </Text>
      </div>
    </form>
  );
}
