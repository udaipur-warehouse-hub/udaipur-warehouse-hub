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

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <header className="no-print border-b border-border bg-surface sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-copper-dark shrink-0">
          <span className="inline-block h-8 w-8 rounded-full bg-copper text-white grid place-items-center text-sm font-bold">
            GM
          </span>
          <span className="hidden xs:inline">Ganpati Metals</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <span className="text-xs uppercase tracking-wide text-muted px-2">Retail Counter</span>
          {RETAIL_COUNTER_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} active={isActive(l.href)}>
              {l.label}
            </NavLink>
          ))}
          <span className="w-px h-6 bg-border mx-2" />
          {SEGMENT_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} active={isActive(l.href)}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden h-11 w-11 grid place-items-center rounded-lg hover:bg-background shrink-0"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border px-4 py-3 space-y-1">
          <div className="text-xs uppercase tracking-wide text-muted px-2 pt-1 pb-1">Retail Counter</div>
          {RETAIL_COUNTER_LINKS.map((l) => (
            <MobileNavLink key={l.href} href={l.href} active={isActive(l.href)} onClick={() => setOpen(false)}>
              {l.label}
            </MobileNavLink>
          ))}
          <div className="h-px bg-border my-2" />
          {SEGMENT_LINKS.map((l) => (
            <MobileNavLink key={l.href} href={l.href} active={isActive(l.href)} onClick={() => setOpen(false)}>
              {l.label}
            </MobileNavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg transition-colors ${
        active ? "bg-copper/10 text-copper-dark" : "hover:bg-background"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-3 rounded-lg text-base ${
        active ? "bg-copper/10 text-copper-dark font-medium" : "hover:bg-background"
      }`}
    >
      {children}
    </Link>
  );
}
