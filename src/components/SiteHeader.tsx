"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "@phosphor-icons/react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Ask" },
  { href: "/saved", label: "Saved" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="no-print bg-header text-header-ink">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5 text-header-ink">
          <span className="flex h-8 w-8 items-center justify-center bg-white text-brand">
            <Compass size={20} weight="bold" aria-hidden="true" />
          </span>
          <span className="text-[1.2rem] font-bold tracking-tight">GovGuide AI</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-[1.05rem] font-semibold ${
                  active ? "bg-white text-brand" : "text-header-ink hover:bg-black/10"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <details className="relative md:hidden">
      <summary className="cursor-pointer list-none border border-white/70 px-3 py-1.5 text-sm font-semibold">
        Menu
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-44 border border-line bg-surface p-2 text-ink">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 text-sm ${pathname === link.href ? "bg-accent-soft font-semibold" : "hover:bg-warn-bg"}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </details>
  );
}
