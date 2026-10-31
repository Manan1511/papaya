import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "../../app/admin/auth-actions";
import { Button, ButtonLink } from "../ui/button";
import { Icon } from "../ui/icon";

const sections = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/content", label: "Content", icon: "edit" },
  { href: "/admin/diary", label: "Diary", icon: "draw" },
  { href: "/admin/pages", label: "Pages", icon: "insights" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/inbox", label: "Inbox", icon: "notifications" },
];

// The admin frame from the Stitch admin screen. Each page checks the session before it renders
// this shell, so the shell itself only lays things out.
export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface md:flex">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-outline-variant/40 bg-surface-container-lowest p-6 md:flex">
        <Link href="/admin" className="font-headline text-headline-md text-primary">
          Papaya admin
        </Link>
        <nav aria-label="Admin" className="flex flex-col gap-1">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-label text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            >
              <Icon name={section.icon} />
              {section.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/40 bg-surface-container-lowest px-4 py-4 md:px-8">
          <h1 className="font-headline text-headline-md text-on-surface">{title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href="/" variant="outlined">
              View store
            </ButtonLink>
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <nav
          aria-label="Admin sections on small screens"
          className="flex gap-2 overflow-x-auto border-b border-outline-variant/40 bg-surface-container-lowest px-4 py-2 md:hidden"
        >
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="shrink-0 rounded-full bg-surface-container-high px-4 py-2 font-label text-label-md text-on-surface"
            >
              {section.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 space-y-6 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
