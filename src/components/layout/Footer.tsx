import Link from "next/link";
import { CONTRACTS_FINDER_URL, CIVICAI_LABS_URL, FIND_A_TENDER_URL, FOOTER_DISCLAIMER, OGL_ATTRIBUTION } from "@/lib/site";
import { Logo } from "./Logo";

const columns = [
  {
    title: "TenderLens",
    links: [
      { href: "/search", label: "Discover" },
      { href: "/saved", label: "Saved" },
      { href: "/glossary", label: "Glossary" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/for-smes", label: "For SMEs" },
      { href: FIND_A_TENDER_URL, label: "Official Find a Tender", external: true },
      { href: CONTRACTS_FINDER_URL, label: "Official Contracts Finder", external: true },
    ],
  },
  {
    title: "CivicAI Labs",
    links: [
      { href: "/about", label: "About CivicAI Labs" },
      { href: CIVICAI_LABS_URL, label: "Other tools", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <strong>TenderLens</strong>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted">UK public-sector opportunities explained for smaller organisations.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold">{column.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  {"external" in link && link.external ? (
                    <a href={link.href} className="text-muted hover:text-ink" rel="noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-muted hover:text-ink">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-sm text-muted">
          <p>{FOOTER_DISCLAIMER}</p>
          <p>{OGL_ATTRIBUTION}</p>
        </div>
      </div>
    </footer>
  );
}
