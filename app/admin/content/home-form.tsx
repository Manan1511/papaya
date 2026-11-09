"use client";

import { useActionState } from "react";
import { EntryActions, EntryMessage } from "../../../components/admin/entry-actions";
import { Field, fieldClass, Panel } from "../../../components/admin/ui";
import { VideoField } from "../../../components/admin/video-field";
import { Input } from "../../../components/ui/input";
import type { HomeContent } from "../../../lib/cms/model";
import { type HomeFormState, saveHome } from "./actions";

const initialState: HomeFormState = {};

export function HomeForm({
  entry,
  initial,
}: {
  entry: { id: string; updatedAt: string; live: boolean };
  initial: HomeContent;
}) {
  const [state, action, pending] = useActionState(saveHome, initialState);
  const updatedAt = state.updatedAt ?? entry.updatedAt;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={entry.id} />
      <input type="hidden" name="updatedAt" value={updatedAt} />

      <Panel title="Hero">
        <VideoField initial={initial.heroVideo} />
        <Field label="Headline">
          <Input name="heroTitle" defaultValue={initial.heroTitle} required maxLength={120} />
        </Field>
        <Field label="Text in the pill">
          <textarea
            name="heroBody"
            rows={2}
            defaultValue={initial.heroBody}
            required
            maxLength={200}
            className={fieldClass}
          />
        </Field>
      </Panel>

      <Panel title="Latest additions">
        <Field label="Title">
          <Input name="latestTitle" defaultValue={initial.latestTitle} required maxLength={120} />
        </Field>
        <Field label="Text">
          <textarea name="latestBody" rows={2} defaultValue={initial.latestBody} maxLength={300} className={fieldClass} />
        </Field>
      </Panel>

      <Panel title="The Amalfi Edit">
        <Field label="Title">
          <Input name="amalfiTitle" defaultValue={initial.amalfiTitle} required maxLength={120} />
        </Field>
        <Field label="Text">
          <textarea name="amalfiBody" rows={3} defaultValue={initial.amalfiBody} maxLength={300} className={fieldClass} />
        </Field>
      </Panel>

      <Panel title="How we make">
        <Field label="Title">
          <Input name="makingTitle" defaultValue={initial.makingTitle} required maxLength={120} />
        </Field>
        <Field label="Text">
          <textarea name="makingBody" rows={2} defaultValue={initial.makingBody} maxLength={300} className={fieldClass} />
        </Field>
      </Panel>

      <EntryMessage error={state.error} message={state.message} />
      <EntryActions
        live={entry.live}
        isNew={false}
        fixed
        pending={pending}
        previewHref="/api/preview?type=home&slug=home"
      />
    </form>
  );
}
