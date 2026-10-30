import { Button } from "../ui/button";
import { Input } from "../ui/input";

const fieldLabel = "flex flex-col gap-2 font-label text-label-md text-on-surface";
const fieldClass =
  "rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body text-body-md text-on-surface disabled:opacity-50";

// Messages go to the CMS inbox in Phase 7. Until then the form shows its layout and submits nothing.
export function ContactForm() {
  return (
    <form className="flex max-w-xl flex-col gap-5">
      <label className={fieldLabel}>
        Name
        <Input name="name" disabled />
      </label>
      <label className={fieldLabel}>
        Email
        <Input type="email" name="email" disabled />
      </label>
      <label className={fieldLabel}>
        Topic
        <select name="topic" disabled className={fieldClass}>
          <option>Order or delivery</option>
          <option>Sizing</option>
          <option>Something else</option>
        </select>
      </label>
      <label className={fieldLabel}>
        Message
        <textarea name="message" rows={5} disabled className={fieldClass} />
      </label>
      <Button type="submit" disabled>
        Send message
      </Button>
      <p className="font-body text-label-md text-on-surface-variant">
        The contact form opens in a later update.
      </p>
    </form>
  );
}
