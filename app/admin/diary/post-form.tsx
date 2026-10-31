"use client";

import { useActionState } from "react";
import { EntryActions, EntryMessage } from "../../../components/admin/entry-actions";
import { RichTextEditor } from "../../../components/admin/rich-text-editor";
import { Field, fieldClass } from "../../../components/admin/ui";
import { Input } from "../../../components/ui/input";
import { diaryCategories, type PostContent } from "../../../lib/cms/model";
import { type PostFormState, savePost } from "./actions";

export type PostFormEntry = { id: string; updatedAt: string; live: boolean };

const initialState: PostFormState = {};

export function PostForm({ entry, initial }: { entry?: PostFormEntry; initial: PostContent & { slug: string } }) {
  const [state, action, pending] = useActionState(savePost, initialState);
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
            ? "The address stays fixed while the post is live. Unpublish it to change the address."
            : `The post is served at /diary/${initial.slug || "your-address"}.`}
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Category">
            <select name="category" defaultValue={initial.category} className={fieldClass}>
              {diaryCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <Input type="date" name="publishedOn" defaultValue={initial.publishedOn} required />
          </Field>
        </div>
        <Field label="Excerpt">
          <textarea name="excerpt" rows={2} defaultValue={initial.excerpt} className={fieldClass} />
        </Field>
        <label className="flex items-center gap-2 font-label text-label-md text-on-surface">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="size-4 accent-primary" />
          Feature this post at the top of the diary
        </label>
      </section>

      <section className="space-y-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-6">
        <p className="font-label text-label-md text-on-surface">Article</p>
        <RichTextEditor name="body" label="Article" initial={initial.body} />
      </section>

      <EntryMessage error={state.error} message={state.message} />
      <EntryActions
        live={live}
        isNew={!entry}
        pending={pending}
        previewHref={entry ? `/api/preview?type=diary&slug=${encodeURIComponent(initial.slug)}` : undefined}
      />
    </form>
  );
}
