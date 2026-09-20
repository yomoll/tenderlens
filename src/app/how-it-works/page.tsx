import type { Metadata } from "next";
import Link from "next/link";
import { CONTRACTS_FINDER_URL, FIND_A_TENDER_URL, INDEPENDENCE_DISCLAIMER } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description: "How TenderLens searches official UK procurement notices and explains them without replacing the original documents.",
};

export default function HowItWorksPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 prose-page">
      <h1 className="text-4xl font-semibold tracking-tight">How TenderLens works</h1>
      <p className="mt-4 text-lg text-muted">
        TenderLens helps smaller organisations find UK public contracts and understand the published notice. It does not replace
        the official documents.
      </p>
      <ol className="mt-10 space-y-8">
        <li>
          <h2 className="text-2xl font-semibold">Search</h2>
          <p className="mt-2 text-muted">
            TenderLens searches official public procurement information from{" "}
            <a href={CONTRACTS_FINDER_URL} className="font-semibold text-accent">
              Contracts Finder
            </a>{" "}
            and{" "}
            <a href={FIND_A_TENDER_URL} className="font-semibold text-accent">
              Find a Tender
            </a>
            . Find a Tender is the UK Central Digital Platform for notices published from 24 February 2025.
          </p>
        </li>
        <li>
          <h2 className="text-2xl font-semibold">Understand</h2>
          <p className="mt-2 text-muted">
            TenderLens turns procurement language into easier-to-read explanations. If an AI provider is configured, it can only
            use the official fields supplied to it. If not, TenderLens still builds a structured summary from those same fields.
          </p>
        </li>
        <li>
          <h2 className="text-2xl font-semibold">Verify and act</h2>
          <p className="mt-2 text-muted">
            Users follow the original government notice before making decisions. Every opportunity links back to its official
            source.
          </p>
        </li>
      </ol>
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">What TenderLens does not do</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
          <li>issue tenders</li>
          <li>accept tender submissions</li>
          <li>guarantee eligibility</li>
          <li>guarantee contract awards</li>
          <li>provide legal advice</li>
          <li>represent the UK Government</li>
        </ul>
      </section>
      <p className="mt-10 text-sm text-muted">{INDEPENDENCE_DISCLAIMER}</p>
      <p className="mt-6">
        <Link href="/search" className="font-semibold text-accent">
          Find opportunities
        </Link>
      </p>
    </main>
  );
}
