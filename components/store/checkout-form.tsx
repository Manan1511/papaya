"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { confirmPayment, startPayment } from "../../lib/checkout/actions";
import { INDIAN_STATES } from "../../lib/checkout/schema";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };

type RazorpayWindow = {
  open(): void;
  on(event: "payment.failed", handler: (response: { error: { description?: string } }) => void): void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayWindow;
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const BRAND = "#7a111d";

const fieldLabel = "flex flex-col gap-2 font-label text-label-md text-on-surface";
const selectClass =
  "w-full rounded border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface focus:border-2 focus:border-primary focus:outline-none focus:ring-4 focus:ring-tertiary-fixed/50 disabled:opacity-50";

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("The payment window didn't load"));
    document.head.append(script);
  });
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className={fieldLabel}>
      {label}
      {children}
      {error && (
        <span role="alert" className="font-body text-label-md text-error">
          {error}
        </span>
      )}
    </label>
  );
}

// Collects the delivery address, then hands the payment to Razorpay's window. Nothing about prices
// is sent from here: the server prices the bag itself.
export function CheckoutForm({ totalLabel }: { totalLabel: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "");

    setBusy(true);
    setMessage("");
    setFieldErrors({});

    try {
      const started = await startPayment({
        name: text("name"),
        email: text("email"),
        phone: text("phone"),
        address1: text("address1"),
        address2: text("address2"),
        city: text("city"),
        state: text("state"),
        pin: text("pin"),
      });
      if (!started.ok) {
        setFieldErrors(started.fieldErrors ?? {});
        setMessage(started.error);
        setBusy(false);
        return;
      }

      await loadRazorpay();
      const Razorpay = window.Razorpay;
      if (!Razorpay) throw new Error("The payment window didn't load");

      const checkout = new Razorpay({
        key: started.keyId,
        order_id: started.orderId,
        amount: started.amountPaise,
        currency: "INR",
        name: "Papaya",
        description: "Your order",
        prefill: { name: started.contact.name, email: started.contact.email, contact: started.contact.phone },
        theme: { color: BRAND },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (response: RazorpayResponse) => {
          setMessage("Payment received. Finishing your order…");
          const done = await confirmPayment({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }).catch(() => null);
          if (done?.ok) {
            router.push(`/order-confirmed?order=${encodeURIComponent(done.order)}`);
            return;
          }
          setMessage(
            done?.error ??
              "Your payment was received, but we couldn't finish your order just now. Please don't pay again. We'll complete it shortly and email you a confirmation.",
          );
          setBusy(false);
        },
      });
      checkout.on("payment.failed", (response) => {
        setMessage(response.error.description ?? "The payment didn't go through. You can try again.");
        setBusy(false);
      });
      checkout.open();
    } catch {
      setMessage("We couldn't open the payment window. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" error={fieldErrors.name}>
          <Input name="name" autoComplete="name" required maxLength={60} disabled={busy} />
        </Field>
        <Field label="Mobile number" error={fieldErrors.phone}>
          <Input name="phone" type="tel" autoComplete="tel" inputMode="tel" required disabled={busy} placeholder="98765 43210" />
        </Field>
      </div>
      <Field label="Email" error={fieldErrors.email}>
        <Input name="email" type="email" autoComplete="email" required maxLength={100} disabled={busy} />
      </Field>
      <Field label="Address" error={fieldErrors.address1}>
        <Input name="address1" autoComplete="address-line1" required maxLength={100} disabled={busy} />
      </Field>
      <Field label="Apartment, landmark (optional)" error={fieldErrors.address2}>
        <Input name="address2" autoComplete="address-line2" maxLength={100} disabled={busy} />
      </Field>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="City" error={fieldErrors.city}>
          <Input name="city" autoComplete="address-level2" required maxLength={50} disabled={busy} />
        </Field>
        <Field label="State" error={fieldErrors.state}>
          <select name="state" autoComplete="address-level1" required defaultValue="" disabled={busy} className={selectClass}>
            <option value="" disabled>
              Choose
            </option>
            {INDIAN_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="PIN code" error={fieldErrors.pin}>
          <Input name="pin" autoComplete="postal-code" inputMode="numeric" required maxLength={6} disabled={busy} />
        </Field>
      </div>

      {message && (
        <p role="alert" className="rounded-lg bg-surface-container-low p-4 font-body text-body-md text-on-surface">
          {message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={busy} className="w-full">
        {busy ? "Please wait…" : `Pay ${totalLabel}`}
      </Button>
      <p className="font-body text-label-md text-on-surface-variant">
        You'll pay securely with Razorpay: UPI, cards, net banking and wallets.
      </p>
    </form>
  );
}
