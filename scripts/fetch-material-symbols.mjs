// Fetches a subset of Material Symbols Outlined into public/fonts so the icon
// font is self-hosted and carries only the glyphs we use. Re-run after adding
// an icon to ICONS: npm run icons
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Every icon named in design/stitch, plus the ones the header and footer use.
const ICONS = [
  "account_balance_wallet", "add", "add_circle", "arrow_downward", "campaign", "close",
  "credit_card", "dashboard", "diamond", "draw", "edit", "group", "insights", "local_shipping",
  "loyalty", "menu", "notifications", "payments", "person", "public", "search", "settings",
  "shopping_bag", "shopping_cart", "star", "storefront", "trending_down", "trending_up",
  "wb_sunny", "water_drop", "build", "delete", "home", "hub", "sell",
];

const FAMILY = "Material+Symbols+Outlined:wght,FILL@100..700,0..1";
// Google only serves woff2 to browser-like user agents.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const cssUrl = `https://fonts.googleapis.com/css2?family=${FAMILY}&icon_names=${ICONS.join(",")}`;
const css = await (await fetch(cssUrl, { headers: { "User-Agent": USER_AGENT } })).text();

// The icon response's URLs don't end in .woff2, so match on the declared format.
const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\) format\('woff2'\)/g)].map((m) => m[1]);
if (urls.length !== 1) throw new Error(`Expected one woff2 URL, got ${urls.length}`);

const font = await fetch(urls[0]);
if (!font.ok) throw new Error(`Font download failed: ${font.status}`);

const out = path.join("public", "fonts", "material-symbols-outlined.woff2");
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, Buffer.from(await font.arrayBuffer()));
console.log(`wrote ${out} with ${ICONS.length} icons`);
