"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const RETAIL_COUNTER_LINKS = [
  { href: "/billing", label: "New Bill" },
  { href: "/catalog", label: "Item Catalog" },
  { href: "/sales", label: "Sales History" },
];

const SEGMENT_LINKS = [
  { href: "/retail-vendors", label: "Retail Vendors" },
  { href: "/credit-vendors", label: "Credit Vendors" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-copper-dark">
      <span className="inline-block h-8 w-8 rounded-full bg-copper text-white grid place-items-center text-sm font-bold shrink-0">
        GM
      </span>
      Ganpati Metals
    </Link>
  );
}

function SidebarLinks({
  isActive,
  onNavigate,
}: {
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-0.5 text-sm">
      <div className="text-xs uppercase tracking-wide text-muted px-3 pt-1 pb-1.5">Retail Counter</div>
      {RETAIL_COUNTER_LINKS.map((l) => (
        <SidebarLink key={l.href} href={l.href} active={isActive(l.href)} onClick={onNavigate}>
          {l.label}
        </SidebarLink>
      ))}
      <div className="h-px bg-border my-3" />
      {SEGMENT_LINKS.map((l) => (
        <SidebarLink key={l.href} href={l.href} active={isActive(l.href)} onClick={onNavigate}>
          {l.label}
        </SidebarLink>
      ))}
    </nav>
  );
}

function SidebarLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2.5 rounded-lg transition-colors ${
        active ? "bg-copper/10 text-copper-dark font-medium" : "hover:bg-background"
      }`}
    >
      {children}
    </Link>
  );
}

// ERP-style left sidebar on desktop; a top bar that opens a slide-in drawer
// on mobile, since a persistent sidebar would eat too much of a phone screen.
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <>
      <div className="md:hidden no-print sticky top-0 z-20 bg-surface border-b border-border h-14 flex items-center justify-between px-4">
        <Logo />
        <button
          onClick={() => setOpen(true)}
          className="h-11 w-11 grid place-items-center rounded-lg hover:bg-background -mr-1"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden no-print fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-surface border-r border-border p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                className="h-10 w-10 grid place-items-center rounded-lg hover:bg-background"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <SidebarLinks isActive={isActive} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 no-print border-r border-border bg-surface sticky top-0 h-screen overflow-y-auto p-4">
        <div className="mb-6 px-1">
          <Logo />
        </div>
        <SidebarLinks isActive={isActive} />
      </aside>
    </>
  );
}
