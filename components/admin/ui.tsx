import type { ReactNode } from "react";
import { Card } from "../ui/card";
import { Chip } from "../ui/chip";

export const fieldClass =
  "rounded border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body text-body-md text-on-surface disabled:opacity-60";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 font-label text-label-md text-on-surface">
      {label}
      {children}
    </label>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="space-y-4">
      <h2 className="font-headline text-headline-md text-on-surface">{title}</h2>
      {children}
    </Card>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <Card className="space-y-2">
      <p className="font-label text-label-md text-on-surface-variant">{label}</p>
      <p className="font-headline text-headline-xl text-primary">{value}</p>
      <p className="font-body text-label-md text-on-surface-variant">{hint}</p>
    </Card>
  );
}

const statusTones = {
  published: "secondary",
  approved: "secondary",
  read: "secondary",
  pending: "tertiary",
  draft: "tertiary",
  unread: "primary",
  rejected: "primary",
} as const;

export type Status = keyof typeof statusTones;

export function StatusChip({ status }: { status: Status }) {
  return <Chip tone={statusTones[status]}>{status}</Chip>;
}
