import { ContactForm } from "../../../components/store/contact-form";
import { Container } from "../../../components/ui/container";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <Container className="grid gap-10 py-lg md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="font-headline text-headline-xl text-on-surface">Contact</h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          Questions about an order, a size or a piece? Send us a message.
        </p>
      </div>
      <ContactForm />
    </Container>
  );
}
