"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/search", label: "Discover" },
  { href: "/saved", label: "Saved" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-smes", label: "For SMEs" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="leading-tight">
            <span className="block text-[1.05rem] font-semibold tracking-tight text-navy">TenderLens</span>
            <span className="block text-[0.7rem] text-muted">by CivicAI Labs</span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/search" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  active ? "bg-navy-soft text-navy" : "text-muted hover:bg-navy-soft hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:bg-navy-soft hover:text-ink"
            aria-label="Search opportunities"
          >
            <Search size={18} />
          </Link>
          <ThemeToggle />
          <Link
            href="/search"
            className="hidden min-h-11 items-center rounded-md bg-cta px-4 text-sm font-semibold text-cta-ink hover:bg-accent-hover md:inline-flex"
          >
            Find opportunities
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-surface px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-3 text-base font-medium hover:bg-navy-soft"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/search" className="rounded-md bg-cta px-3 py-3 text-center font-semibold text-cta-ink" onClick={() => setOpen(false)}>
              Find opportunities
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
