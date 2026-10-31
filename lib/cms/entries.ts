import "server-only";
import { z } from "zod";
import { isAdminSession, requireAdmin } from "../auth/session";
import { adminRequest } from "../shopify/admin";
import type { Kind } from "./model";

// Every cached CMS read carries this tag. Publish, unpublish and delete expire it.
export const CMS_TAG = "cms";

export class ConflictError extends Error {}
export class SlugTakenError extends Error {}
export class NotFoundError extends Error {}

export type EntryStatus = "draft" | "published";

// What the editor sees: the draft it works on, and the live copy if there is one.
export type StoredEntry<T> = {
  id: string;
  slug: string;
  status: EntryStatus;
  updatedAt: string;
  draft: T;
  published: T | null;
};

// The public copy: only the live content and its address.
export type PublishedEntry<T> = { slug: string; content: T };

// A live entry keeps its address. Changing it would break the page people already visit.
export function slugIsFixed<T>(entry: StoredEntry<T>): boolean {
  return entry.published !== null;
}

// Metaobject fields as Shopify returns them. A cleared field comes back as null.
const fieldRows = z.array(z.object({ key: z.string(), value: z.string().nullable() }));

const entryNode = z.object({
  id: z.string(),
  handle: z.string(),
  type: z.string(),
  updatedAt: z.string(),
  fields: fieldRows,
});

const writtenEntry = z.object({ id: z.string(), handle: z.string(), updatedAt: z.string() });
const userErrors = z.array(z.object({ message: z.string() }));

const LIST = `query ($type: String!) {
  metaobjects(type: $type, first: 250) {
    nodes { id handle type updatedAt fields { key value } }
  }
}`;

const ONE = `query ($id: ID!) {
  metaobject(id: $id) { id handle type updatedAt fields { key value } }
}`;

const BY_HANDLE = `query ($handle: MetaobjectHandleInput!) {
  metaobjectByHandle(handle: $handle) { id handle type updatedAt fields { key value } }
}`;

// Public reads ask only for the live copy, so a draft is never part of a cached response.
const PUBLISHED_LIST = `query ($type: String!) {
  metaobjects(type: $type, first: 250) {
    nodes { handle published: field(key: "published") { value } }
  }
}`;

const PUBLISHED_BY_HANDLE = `query ($handle: MetaobjectHandleInput!) {
  metaobjectByHandle(handle: $handle) { handle published: field(key: "published") { value } }
}`;

const CREATE = `mutation ($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle updatedAt }
    userErrors { message }
  }
}`;

const UPDATE = `mutation ($id: ID!, $metaobject: MetaobjectUpdateInput!) {
  metaobjectUpdate(id: $id, metaobject: $metaobject) {
    metaobject { id handle updatedAt }
    userErrors { message }
  }
}`;

const DELETE = `mutation ($id: ID!) {
  metaobjectDelete(id: $id) { deletedId userErrors { message } }
}`;

type EntryNode = z.infer<typeof entryNode>;
type FieldInput = { key: string; value: string };

// Shopify reports the app's namespace as "app--<id>--<name>", not as "$app:<name>".
function isKindType(resolved: string, kind: Kind<unknown>): boolean {
  return resolved.endsWith(`--${kind.name}`);
}

function parseDraftOrThrow<T>(raw: string | null, schema: z.ZodType<T>): T | null {
  if (!raw) return null;
  return schema.parse(JSON.parse(raw));
}

function toStored<T>(node: EntryNode, kind: Kind<T>): StoredEntry<T> {
  const fields = new Map(node.fields.map((field) => [field.key, field.value]));
  const draft = parseDraftOrThrow(fields.get("draft") ?? null, kind.schema);
  if (draft === null) throw new Error(`CMS entry ${node.handle} has no draft`);

  return {
    id: node.id,
    slug: node.handle,
    status: fields.get("status") === "published" ? "published" : "draft",
    updatedAt: node.updatedAt,
    draft,
    published: parseDraftOrThrow(fields.get("published") ?? null, kind.schema),
  };
}

// Public reads never throw on a bad entry. They log the problem and leave the entry out.
function parsePublished<T>(handle: string, raw: string | null, kind: Kind<T>): T | undefined {
  if (!raw) return undefined;
  try {
    const parsed = kind.schema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
    console.error(`CMS entry ${handle} failed validation`);
  } catch {
    console.error(`CMS entry ${handle} is not valid JSON`);
  }
  return undefined;
}

function assertUserErrorsEmpty(errors: { message: string }[], action: string): void {
  if (errors.length > 0) {
    throw new Error(`Could not ${action}: ${errors.map((error) => error.message).join("; ")}`);
  }
}

async function findBySlug(kind: Kind<unknown>, slug: string): Promise<EntryNode | null> {
  const data = await adminRequest(
    BY_HANDLE,
    z.object({ metaobjectByHandle: entryNode.nullable() }),
    { handle: { type: kind.type, handle: slug } },
    "no-store",
  );
  return data.metaobjectByHandle;
}

async function readById<T>(kind: Kind<T>, id: string): Promise<StoredEntry<T>> {
  const data = await adminRequest(ONE, z.object({ metaobject: entryNode.nullable() }), { id }, "no-store");
  const node = data.metaobject;
  if (!node || !isKindType(node.type, kind)) throw new NotFoundError("That entry no longer exists");
  return toStored(node, kind);
}

// The check reads the entry again, then writes. Shopify has no conditional write for metaobjects,
// so two saves within the same second can still collide. Single-admin use makes that unlikely.
function assertUnchanged(entry: { updatedAt: string }, expected: string): void {
  if (entry.updatedAt !== expected) {
    throw new ConflictError("Someone changed this after you opened it. Reload to see their version.");
  }
}

async function writeEntry(
  id: string,
  metaobject: { handle?: string; fields: FieldInput[] },
): Promise<z.infer<typeof writtenEntry>> {
  const data = await adminRequest(
    UPDATE,
    z.object({
      metaobjectUpdate: z.object({ metaobject: writtenEntry.nullable(), userErrors }),
    }),
    { id, metaobject },
    "no-store",
  );
  assertUserErrorsEmpty(data.metaobjectUpdate.userErrors, "save the entry");
  if (!data.metaobjectUpdate.metaobject) throw new Error("Shopify didn't return the saved entry");
  return data.metaobjectUpdate.metaobject;
}

async function deleteById(id: string): Promise<void> {
  const data = await adminRequest(
    DELETE,
    z.object({ metaobjectDelete: z.object({ deletedId: z.string().nullable(), userErrors }) }),
    { id },
    "no-store",
  );
  assertUserErrorsEmpty(data.metaobjectDelete.userErrors, "delete the entry");
}

export async function listEntries<T>(kind: Kind<T>): Promise<StoredEntry<T>[]> {
  await requireAdmin();
  const data = await adminRequest(LIST, z.object({ metaobjects: z.object({ nodes: z.array(entryNode) }) }), {
    type: kind.type,
  }, "no-store");
  return data.metaobjects.nodes.map((node) => toStored(node, kind));
}

export async function getEntry<T>(kind: Kind<T>, id: string): Promise<StoredEntry<T>> {
  await requireAdmin();
  return readById(kind, id);
}

// Draft lookup for the preview. It needs an admin session as well as draft mode, so a browser
// that kept the draft-mode cookie after sign-out sees live content only.
export async function getDraftBySlug<T>(kind: Kind<T>, slug: string): Promise<StoredEntry<T> | undefined> {
  if (!(await isAdminSession())) return undefined;
  const node = await findBySlug(kind, slug);
  return node && isKindType(node.type, kind) ? toStored(node, kind) : undefined;
}

export async function createEntry<T>(kind: Kind<T>, input: { slug: string; content: T }): Promise<string> {
  await requireAdmin();
  if (await findBySlug(kind, input.slug)) {
    throw new SlugTakenError("Another entry already uses that web address");
  }

  const content = kind.schema.parse(input.content);
  const data = await adminRequest(
    CREATE,
    z.object({ metaobjectCreate: z.object({ metaobject: writtenEntry.nullable(), userErrors }) }),
    {
      metaobject: {
        type: kind.type,
        handle: input.slug,
        fields: [
          { key: "slug", value: input.slug },
          { key: "status", value: "draft" },
          { key: "draft", value: JSON.stringify(content) },
        ],
      },
    },
    "no-store",
  );
  assertUserErrorsEmpty(data.metaobjectCreate.userErrors, "create the entry");
  const created = data.metaobjectCreate.metaobject;
  if (!created) throw new Error("Shopify didn't return the new entry");

  // Shopify adds a suffix when a handle is taken. A suffix here means another request won the race.
  if (created.handle !== input.slug) {
    await deleteById(created.id);
    throw new SlugTakenError("Another entry already uses that web address");
  }
  return created.id;
}

export async function saveDraft<T>(
  kind: Kind<T>,
  input: { id: string; updatedAt: string; slug: string; content: T },
): Promise<string> {
  await requireAdmin();
  const current = await readById(kind, input.id);
  assertUnchanged(current, input.updatedAt);

  const content = kind.schema.parse(input.content);
  const slugChanged = input.slug !== current.slug;
  if (slugChanged && slugIsFixed(current)) {
    throw new Error("A live page keeps its web address. Unpublish it before changing the address.");
  }
  if (slugChanged && (await findBySlug(kind, input.slug))) {
    throw new SlugTakenError("Another entry already uses that web address");
  }

  const saved = await writeEntry(input.id, {
    ...(slugChanged ? { handle: input.slug } : {}),
    fields: [
      { key: "slug", value: input.slug },
      { key: "draft", value: JSON.stringify(content) },
    ],
  });
  if (slugChanged && saved.handle !== input.slug) {
    await writeEntry(input.id, { handle: current.slug, fields: [] });
    throw new SlugTakenError("Another entry already uses that web address");
  }
  return saved.updatedAt;
}

// Copies the draft to the live slot. The draft and the live copy are then the same content.
export async function publishEntry<T>(kind: Kind<T>, input: { id: string; updatedAt: string }): Promise<string> {
  await requireAdmin();
  const current = await readById(kind, input.id);
  assertUnchanged(current, input.updatedAt);

  const saved = await writeEntry(input.id, {
    fields: [
      { key: "published", value: JSON.stringify(current.draft) },
      { key: "status", value: "published" },
    ],
  });
  return saved.updatedAt;
}

// Removes the live copy. The draft stays, so the page can be edited and published again.
export async function unpublishEntry<T>(kind: Kind<T>, input: { id: string; updatedAt: string }): Promise<string> {
  await requireAdmin();
  const current = await readById(kind, input.id);
  assertUnchanged(current, input.updatedAt);

  const saved = await writeEntry(input.id, {
    fields: [
      { key: "published", value: "" },
      { key: "status", value: "draft" },
    ],
  });
  return saved.updatedAt;
}

export async function deleteEntry<T>(kind: Kind<T>, id: string): Promise<void> {
  await requireAdmin();
  await readById(kind, id);
  await deleteById(id);
}

export async function listPublished<T>(kind: Kind<T>): Promise<PublishedEntry<T>[]> {
  const data = await adminRequest(
    PUBLISHED_LIST,
    z.object({
      metaobjects: z.object({
        nodes: z.array(z.object({ handle: z.string(), published: z.object({ value: z.string().nullable() }).nullable() })),
      }),
    }),
    { type: kind.type },
    { tags: [CMS_TAG] },
  );

  return data.metaobjects.nodes.flatMap((node) => {
    const content = parsePublished(node.handle, node.published?.value ?? null, kind);
    return content === undefined ? [] : [{ slug: node.handle, content }];
  });
}

export async function getPublished<T>(kind: Kind<T>, slug: string): Promise<PublishedEntry<T> | undefined> {
  const data = await adminRequest(
    PUBLISHED_BY_HANDLE,
    z.object({
      metaobjectByHandle: z
        .object({ handle: z.string(), published: z.object({ value: z.string().nullable() }).nullable() })
        .nullable(),
    }),
    { handle: { type: kind.type, handle: slug } },
    { tags: [CMS_TAG] },
  );

  const node = data.metaobjectByHandle;
  if (!node) return undefined;
  const content = parsePublished(node.handle, node.published?.value ?? null, kind);
  return content === undefined ? undefined : { slug: node.handle, content };
}
