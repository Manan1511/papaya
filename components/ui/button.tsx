import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

type Variant = "primary" | "secondary" | "inverted" | "outlined";
type Size = "md" | "lg";

type Style = { variant?: Variant; size?: Size; className?: string };

const base =
  "inline-flex items-center justify-center gap-2 rounded font-label transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary shadow-cta hover:bg-on-primary-fixed-variant",
  secondary: "bg-surface-container-highest text-on-surface hover:bg-surface-container-high",
  inverted: "bg-inverse-surface text-inverse-on-surface hover:opacity-90",
  outlined: "border-2 border-primary bg-surface-container-lowest text-primary hover:bg-primary-fixed",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-label-md",
  lg: "h-14 px-8 text-body-md font-bold uppercase tracking-[0.02em]",
};

export function buttonClass({ variant = "primary", size = "md", className }: Style = {}): string {
  return cx(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Style) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  href,
  children,
  ...style
}: Style & { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClass(style)}>
      {children}
    </Link>
  );
}
