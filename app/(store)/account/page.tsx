import { ButtonLink } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Chip } from "../../../components/ui/chip";
import { Container } from "../../../components/ui/container";
import { sampleOrders } from "../../../lib/content/account";
import { isDevPreview } from "../../../lib/content/dev";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <Container className="space-y-lg py-lg">
      <h1 className="font-headline text-headline-xl text-on-surface">Your account</h1>
      <Card className="flex flex-col items-start gap-4 md:max-w-xl">
        <p className="font-body text-body-lg text-on-surface-variant">
          Sign in to see your orders and saved addresses.
        </p>
        <ButtonLink href="/account/login">Sign in</ButtonLink>
      </Card>

      {isDevPreview && (
        <section aria-labelledby="sample-orders" className="space-y-4">
          <h2 id="sample-orders" className="flex items-center gap-3 font-headline text-headline-md text-on-surface">
            Orders <Chip tone="tertiary">Sample</Chip>
          </h2>
          <table className="w-full text-left font-body text-body-md text-on-surface">
            <thead>
              <tr>
                {["Order", "Date", "Total", "Status"].map((column) => (
                  <th key={column} scope="col" className="border-b border-outline-variant py-3 font-label text-label-md">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleOrders.map((order) => (
                <tr key={order.number} className="border-b border-outline-variant/40">
                  <td className="py-3">{order.number}</td>
                  <td className="py-3">{order.date}</td>
                  <td className="py-3">{order.total}</td>
                  <td className="py-3">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </Container>
  );
}
