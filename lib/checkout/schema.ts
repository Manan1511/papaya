import { z } from "zod";

// Codes are the ones Shopify uses for Indian states and union territories. Order creation falls back
// to the state's name if Shopify turns a code down (lib/checkout/shopify-order.ts).
export const INDIAN_STATES = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
] as const;

const stateCodes = INDIAN_STATES.map((state) => state.code) as [string, ...string[]];

export function stateName(code: string): string {
  return INDIAN_STATES.find((state) => state.code === code)?.name ?? code;
}

// Ten digits that start 6 to 9, however the shopper typed them: "+91 98765 43210", "098765-43210".
const phone = z
  .string()
  .transform((value) => value.replace(/[\s\-()]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number."));

// The field lengths keep the packed order notes under Razorpay's limits (lib/checkout/notes.ts).
export const checkoutFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(60, "That name is too long."),
  email: z.string().trim().toLowerCase().max(100).pipe(z.email("Enter a valid email address.")),
  phone,
  address1: z.string().trim().min(3, "Enter your street address.").max(100, "That address is too long."),
  address2: z.string().trim().max(100, "That address is too long.").default(""),
  city: z.string().trim().min(2, "Enter your city.").max(50, "That city name is too long."),
  state: z.enum(stateCodes, { error: "Choose your state." }),
  pin: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a 6-digit PIN code."),
});

export type CheckoutForm = z.infer<typeof checkoutFormSchema>;
