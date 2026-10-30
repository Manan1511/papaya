import { revalidateTag } from "next/cache";
import { getEnv } from "../../../lib/env";
import { verifyWebhookHmac } from "../../../lib/webhook";

// Shopify product and collection webhooks land here. The signature is checked before anything
// is revalidated, so only Shopify can invalidate the catalog.
export async function POST(request: Request) {
  const secret = getEnv().SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret is not configured", { status: 500 });

  const body = await request.text();
  if (!verifyWebhookHmac(body, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  if (topic.startsWith("products/")) revalidateTag("products", "max");
  if (topic.startsWith("collections/")) revalidateTag("collections", "max");
  return new Response(null, { status: 200 });
}
