// Adds the seed pages and diary posts to the CMS as live content. Entries that already exist are
// skipped, so this is safe to run again. Run: npm run seed:cms
import { z } from "zod";
import pages from "../docs/seed/cms-pages.json";
import posts from "../docs/seed/cms-diary.json";
import { type Kind, pageKind, postKind } from "../lib/cms/model";
import { adminRequest } from "../lib/shopify/admin";

const BY_HANDLE = `query ($handle: MetaobjectHandleInput!) {
  metaobjectByHandle(handle: $handle) { id }
}`;

const CREATE = `mutation ($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { handle }
    userErrors { message }
  }
}`;

async function seed<T>(kind: Kind<T>, entries: { slug: string }[]): Promise<void> {
  for (const entry of entries) {
    const existing = await adminRequest(
      BY_HANDLE,
      z.object({ metaobjectByHandle: z.object({ id: z.string() }).nullable() }),
      { handle: { type: kind.type, handle: entry.slug } },
      "no-store",
    );
    if (existing.metaobjectByHandle) {
      console.log(`skip  ${kind.name} ${entry.slug} (exists)`);
      continue;
    }

    // The schema strips the slug, which is stored separately.
    const draft = JSON.stringify(kind.schema.parse(entry));
    const created = await adminRequest(
      CREATE,
      z.object({
        metaobjectCreate: z.object({
          metaobject: z.object({ handle: z.string() }).nullable(),
          userErrors: z.array(z.object({ message: z.string() })),
        }),
      }),
      {
        metaobject: {
          type: kind.type,
          handle: entry.slug,
          fields: [
            { key: "slug", value: entry.slug },
            { key: "status", value: "published" },
            { key: "draft", value: draft },
            { key: "published", value: draft },
          ],
        },
      },
      "no-store",
    );

    const { metaobject, userErrors } = created.metaobjectCreate;
    if (userErrors.length > 0 || metaobject?.handle !== entry.slug) {
      throw new Error(`Could not create ${kind.name} ${entry.slug}: ${JSON.stringify(userErrors)}`);
    }
    console.log(`made  ${kind.name} ${entry.slug}`);
  }
}

async function main(): Promise<void> {
  await seed(pageKind, pages);
  await seed(postKind, posts);
}

void main();
