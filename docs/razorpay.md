# Razorpay checkout

Shoppers pay on the store's own `/checkout` page. Razorpay's window takes the payment, then the site creates the order in Shopify. Shopify stays the record of products, stock, discounts and orders.

## How it works

1. **Bag to checkout.** The Checkout button opens `/checkout`. The shopper fills in an address.
2. **Pay.** `startPayment` (`lib/checkout/actions.ts`) reads the bag from Shopify, prices it, and asks Razorpay for an order of exactly that amount. The browser sends the address only, never prices or items. The order details are packed into the Razorpay order's notes.
3. **Confirm.** After payment, `confirmPayment` checks Razorpay's signature, then `finalizePayment` (`lib/checkout/finalize.ts`) rebuilds the order from the notes and the amount Razorpay took, and creates it in Shopify with stock decremented. The bag is cleared and the shopper lands on `/order-confirmed`.
4. **Safety net.** If the shopper pays and closes the tab, Razorpay calls `/api/razorpay/webhook` and the same `finalizePayment` makes the order. The webhook waits two minutes after the payment before acting, so it doesn't race the browser.

An order is made once per payment. The Razorpay order records the Shopify order name in its notes, and every Shopify order carries the tag `rzp_<razorpay order id>`.

## Set it up

You do these. Keep every key in `.env.local`, never in chat or commits.

1. In the Razorpay dashboard, switch to **Test mode**, then Account & Settings → API keys → generate a key pair.
2. Add to `.env.local`:
   - `RAZORPAY_KEY_ID` (starts `rzp_test_`)
   - `RAZORPAY_KEY_SECRET`
3. Add the webhook: Account & Settings → Webhooks → Add. Set the URL to `https://<your-site>/api/razorpay/webhook`, tick **payment.captured**, and type a secret. Put the same secret in `RAZORPAY_WEBHOOK_SECRET`. Razorpay only calls HTTPS addresses, so use the deployed site or a tunnel.
4. Restart the dev server. The Shopify app already needs `write_orders`.
5. Make a test payment. Razorpay's dashboard lists test card and UPI details.
6. For live: generate live keys (`rzp_live_`), replace the three variables in Netlify's environment settings, add the webhook again in Live mode, and redeploy.

Payments are captured automatically when Razorpay's auto-capture is on. If it is off, the site captures the payment itself when it makes the order.

## What you see in Shopify

- Orders show as paid, with gateway "Razorpay" and the payment id in the order note.
- Orders made with test keys are flagged as test orders and tagged `razorpay-test`, and no receipt email is sent.
- Tag `amount-mismatch`: Shopify priced the lines differently from what Razorpay charged, for example because a price changed during checkout. The customer paid the amount shown. Check the order by hand.

## Shipping

`SHIPPING_FEE_INR` in `lib/content/site.ts` is the flat shipping charge and is **0**, so shipping is free until you set it. `FREE_SHIPPING_THRESHOLD_INR` waives the fee above that subtotal.

## Not covered yet

- **Taxes.** Orders carry no tax lines, so GST isn't broken out in Shopify. Prices are charged as listed.
- **Cash on delivery** and partial advances.
- **Refunds.** Refund from the Razorpay dashboard and mark the Shopify order by hand.
- **Order monitoring in the admin.** Use the Shopify and Razorpay dashboards.
- A payment with no order details (not made through this checkout) is acknowledged and left for a person.
