"use client";

import { useActionState } from "react";
import { EntryActions, EntryMessage } from "../../../components/admin/entry-actions";
import { RichTextEditor } from "../../../components/admin/rich-text-editor";
import { Field, fieldClass } from "../../../components/admin/ui";
import { Input } from "../../../components/ui/input";
import type { PageContent } from "../../../lib/cms/model";
import { type PageFormState, savePage } from "./actions";

export type PageFormEntry = { id: string; updatedAt: string; live: boolean };

const initialState: PageFormState = {};

export function PageForm({ entry, initial }: { entry?: PageFormEntry; initial: PageContent & { slug: string } }) {
  const [state, action, pending] = useActionState(savePage, initialState);
  const live = entry?.live ?? false;
  const updatedAt = state.updatedAt ?? entry?.updatedAt ?? "";

  return (
    <form action={action} className="space-y-6">
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <input type="hidden" name="updatedAt" value={updatedAt} />

      <section className="space-y-5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-6">
        <Field label="Title">
          <Input name="title" defaultValue={initial.title} required />
        </Field>
        <Field label="Web address">
          {live ? (
            <>
              <input type="hidden" name="slug" value={initial.slug} />
              <Input defaultValue={initial.slug} readOnly aria-describedby="address-note" />
            </>
          ) : (
            <Input name="slug" defaultValue={initial.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          )}
        </Field>
        <p id="address-note" className="font-body text-label-md text-on-surface-variant">
          {live
            ? "The address stays fixed while the page is live. Unpublish it to change the address."
            : `The page is served at /pages/${initial.slug || "your-address"}.`}
        </p>
        <Field label="Introduction">
          <textarea name="intro" rows={3} defaultValue={initial.intro} className={fieldClass} />
        </Field>
      </section>

      <section className="space-y-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-6">
        <p className="font-label text-label-md text-on-surface">Page text</p>
        <RichTextEditor name="body" label="Page text" initial={initial.body} />
      </section>

      <EntryMessage error={state.error} message={state.message} />
      <EntryActions
        live={live}
        isNew={!entry}
        pending={pending}
        previewHref={entry ? `/api/preview?type=page&slug=${encodeURIComponent(initial.slug)}` : undefined}
      />
    </form>
  );
}
