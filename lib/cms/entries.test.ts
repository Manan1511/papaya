import { beforeEach, describe, expect, it, vi } from "vitest";
import { isAdminSession } from "../auth/session";
import {
  ConflictError,
  SlugTakenError,
  createEntry,
  deleteEntry,
  getDraftBySlug,
  getEntry,
  getPublished,
  listEntries,
  listPublished,
  publishEntry,
  saveDraft,
  unpublishEntry,
} from "./entries";
import { type PageContent, pageKind } from "./model";
import { emptyRichText } from "./rich-text";

vi.mock("server-only", () => ({}));

vi.mock("../auth/session", () => ({
  requireAdmin: vi.fn(async () => {}),
  isAdminSession: vi.fn(async () => true),
}));

// An in-memory stand-in for the Admin API's metaobject operations. It answers the same GraphQL
// documents the module sends, so the logic under test runs as it does against the store.
const store = vi.hoisted(() => {
  type Row = { id: string; handle: string; type: string; updatedAt: string; fields: Map<string, string | null> };
  const rows = new Map<string, Row>();
  let clock = 0;
  let nextId = 1;

  const resolveType = (value: unknown) => String(value).replace("$app:", "app--1--");
  const stamp = () => new Date(Date.UTC(2026, 0, 1) + ++clock * 1000).toISOString();
  const toNode = (row: Row) => ({
    id: row.id,
    handle: row.handle,
    type: row.type,
    updatedAt: row.updatedAt,
    fields: [...row.fields].map(([key, value]) => ({ key, value })),
  });
  const publishedOnly = (query: string) => query.includes('published: field(key: "published")');

  return {
    rows,
    reset() {
      rows.clear();
      clock = 0;
      nextId = 1;
    },
    handle(query: string, variables: Record<string, unknown>): unknown {
      if (query.includes("metaobjectCreate")) {
        const input = variables.metaobject as {
          type: string;
          handle: string;
          fields: { key: string; value: string }[];
        };
        // Shopify adds a suffix to a handle that is already taken instead of rejecting it.
        let handle = input.handle;
        for (let suffix = 1; [...rows.values()].some((row) => row.handle === handle); suffix++) {
          handle = `${input.handle}-${suffix}`;
        }
        const id = `gid://shopify/Metaobject/${nextId++}`;
        const row: Row = {
          id,
          handle,
          type: resolveType(input.type),
          updatedAt: stamp(),
          fields: new Map(input.fields.map((field) => [field.key, field.value === "" ? null : field.value])),
        };
        rows.set(id, row);
        return { metaobjectCreate: { metaobject: { id, handle, updatedAt: row.updatedAt }, userErrors: [] } };
      }

      if (query.includes("metaobjectUpdate")) {
        const row = rows.get(String(variables.id));
        if (!row) return { metaobjectUpdate: { metaobject: null, userErrors: [{ message: "Not found" }] } };
        const input = variables.metaobject as { handle?: string; fields?: { key: string; value: string }[] };
        if (input.handle) row.handle = input.handle;
        for (const field of input.fields ?? []) row.fields.set(field.key, field.value === "" ? null : field.value);
        row.updatedAt = stamp();
        return { metaobjectUpdate: { metaobject: { id: row.id, handle: row.handle, updatedAt: row.updatedAt }, userErrors: [] } };
      }

      if (query.includes("metaobjectDelete")) {
        const id = String(variables.id);
        rows.delete(id);
        return { metaobjectDelete: { deletedId: id, userErrors: [] } };
      }

      if (query.includes("metaobjectByHandle")) {
        const { type, handle } = variables.handle as { type: string; handle: string };
        const row = [...rows.values()].find((candidate) => candidate.type === resolveType(type) && candidate.handle === handle);
        if (!row) return { metaobjectByHandle: null };
        return {
          metaobjectByHandle: publishedOnly(query)
            ? { handle: row.handle, published: { value: row.fields.get("published") ?? null } }
            : toNode(row),
        };
      }

      if (query.includes("metaobject(id")) {
        const row = rows.get(String(variables.id));
        return { metaobject: row ? toNode(row) : null };
      }

      if (query.includes("metaobjects(type")) {
        const matches = [...rows.values()].filter((row) => row.type === resolveType(variables.type));
        return {
          metaobjects: {
            nodes: matches.map((row) =>
              publishedOnly(query)
                ? { handle: row.handle, published: { value: row.fields.get("published") ?? null } }
                : toNode(row),
            ),
          },
        };
      }

      throw new Error(`Unhandled query in test: ${query.slice(0, 60)}`);
    },
  };
});

vi.mock("../shopify/admin", () => ({
  adminRequest: vi.fn(
    async (query: string, schema: { parse: (value: unknown) => unknown }, variables: Record<string, unknown>) =>
      schema.parse(store.handle(query, variables)),
  ),
}));

function page(title: string): PageContent {
  return { title, intro: "An introduction", body: emptyRichText };
}

beforeEach(() => {
  store.reset();
});

describe("CMS drafts and live copies", () => {
  it("keeps a new entry as a draft that only admin reads can see", async () => {
    const id = await createEntry(pageKind, { slug: "care-guide", content: page("Care") });

    expect(await listEntries(pageKind)).toMatchObject([{ id, slug: "care-guide", status: "draft", published: null }]);
    expect(await listPublished(pageKind)).toEqual([]);
    expect(await getPublished(pageKind, "care-guide")).toBeUndefined();
  });

  it("publishes the draft, and removes the live copy when unpublished, keeping the draft", async () => {
    const id = await createEntry(pageKind, { slug: "care-guide", content: page("Care") });
    const drafted = await getEntry(pageKind, id);

    await publishEntry(pageKind, { id, updatedAt: drafted.updatedAt });
    expect(await listPublished(pageKind)).toEqual([{ slug: "care-guide", content: page("Care") }]);

    const live = await getEntry(pageKind, id);
    await unpublishEntry(pageKind, { id, updatedAt: live.updatedAt });
    expect(await listPublished(pageKind)).toEqual([]);
    expect((await getEntry(pageKind, id)).draft).toEqual(page("Care"));
  });

  it("keeps showing the old live copy until the new draft is published", async () => {
    const id = await createEntry(pageKind, { slug: "care-guide", content: page("First") });
    await publishEntry(pageKind, { id, updatedAt: (await getEntry(pageKind, id)).updatedAt });

    await saveDraft(pageKind, {
      id,
      updatedAt: (await getEntry(pageKind, id)).updatedAt,
      slug: "care-guide",
      content: page("Second"),
    });
    expect((await getPublished(pageKind, "care-guide"))?.content.title).toBe("First");

    await publishEntry(pageKind, { id, updatedAt: (await getEntry(pageKind, id)).updatedAt });
    expect((await getPublished(pageKind, "care-guide"))?.content.title).toBe("Second");
  });

  it("refuses a save when the entry changed after it was opened", async () => {
    const id = await createEntry(pageKind, { slug: "care-guide", content: page("Care") });
    const opened = await getEntry(pageKind, id);
    await saveDraft(pageKind, { id, updatedAt: opened.updatedAt, slug: "care-guide", content: page("Mine") });

    await expect(
      saveDraft(pageKind, { id, updatedAt: opened.updatedAt, slug: "care-guide", content: page("Theirs") }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("refuses a web address that another entry already uses", async () => {
    await createEntry(pageKind, { slug: "care-guide", content: page("A") });

    await expect(createEntry(pageKind, { slug: "care-guide", content: page("B") })).rejects.toBeInstanceOf(
      SlugTakenError,
    );
  });

  it("moves an unpublished draft to a new web address", async () => {
    const id = await createEntry(pageKind, { slug: "draft-one", content: page("T") });

    await saveDraft(pageKind, {
      id,
      updatedAt: (await getEntry(pageKind, id)).updatedAt,
      slug: "draft-two",
      content: page("T"),
    });
    expect((await getEntry(pageKind, id)).slug).toBe("draft-two");
  });

  it("keeps the address of a live page fixed", async () => {
    const id = await createEntry(pageKind, { slug: "care-guide", content: page("Care") });
    await publishEntry(pageKind, { id, updatedAt: (await getEntry(pageKind, id)).updatedAt });

    await expect(
      saveDraft(pageKind, {
        id,
        updatedAt: (await getEntry(pageKind, id)).updatedAt,
        slug: "new-address",
        content: page("Care"),
      }),
    ).rejects.toThrow("keeps its web address");
  });

  it("removes an entry when it is deleted", async () => {
    const id = await createEntry(pageKind, { slug: "care-guide", content: page("Care") });

    await deleteEntry(pageKind, id);
    expect(await listEntries(pageKind)).toEqual([]);
  });

  it("returns the draft to the preview only with an admin session", async () => {
    await createEntry(pageKind, { slug: "care-guide", content: page("Unpublished") });

    expect((await getDraftBySlug(pageKind, "care-guide"))?.draft.title).toBe("Unpublished");

    vi.mocked(isAdminSession).mockResolvedValueOnce(false);
    expect(await getDraftBySlug(pageKind, "care-guide")).toBeUndefined();
  });

  it("leaves out a live entry whose stored content is invalid, and logs it", async () => {
    const id = await createEntry(pageKind, { slug: "care-guide", content: page("Care") });
    store.handle(
      `mutation { metaobjectUpdate }`,
      { id, metaobject: { fields: [{ key: "published", value: "not json" }] } },
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await listPublished(pageKind)).toEqual([]);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("care-guide"));
    log.mockRestore();
  });
});
