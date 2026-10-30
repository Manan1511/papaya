import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { Icon } from "./icon";

export type IconButtonTone = "ghost" | "primary" | "secondary" | "tertiary" | "error";
export type IconButtonShape = "circle" | "square";

const base =
  "inline-flex size-10 shrink-0 items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const shapes: Record<IconButtonShape, string> = {
  circle: "rounded-full",
  square: "rounded-lg",
};

// Solid tones follow the board's colour FABs: orange, azure, yellow and red.
const tones: Record<IconButtonTone, string> = {
  ghost: "text-primary hover:bg-surface-container-high",
  primary: "bg-primary text-on-primary shadow-cta hover:bg-on-primary-fixed-variant",
  secondary: "bg-secondary text-on-secondary hover:bg-secondary-container",
  tertiary: "bg-tertiary-fixed-dim text-on-tertiary-fixed hover:bg-tertiary-fixed",
  error: "bg-error text-on-error hover:bg-on-error-container",
};

// Shared with components that need their own element, such as the mobile drawer trigger.
export function iconButtonClass({
  tone = "ghost",
  shape = "circle",
  className,
}: { tone?: IconButtonTone; shape?: IconButtonShape; className?: string } = {}): string {
  return cx(base, shapes[shape], tones[tone], className);
}

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: string;
  // Required: an icon-only control has no visible text of its own.
  label: string;
  tone?: IconButtonTone;
  shape?: IconButtonShape;
  href?: string;
  current?: boolean;
  filled?: boolean;
};

// Renders a link when given an href, otherwise a button. Button-only props are ignored for links.
export function IconButton({
  icon,
  label,
  tone,
  shape,
  href,
  current = false,
  filled = false,
  className,
  ...rest
}: Props) {
  const classes = iconButtonClass({ tone, shape, className });
  const content = <Icon name={icon} filled={filled} />;

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        title={label}
        aria-current={current ? "page" : undefined}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} title={label} className={classes} {...rest}>
      {content}
    </button>
  );
}
