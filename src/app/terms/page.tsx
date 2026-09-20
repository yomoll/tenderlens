import type { Metadata } from "next";
import { INDEPENDENCE_DISCLAIMER } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for TenderLens, an independent CivicAI Labs service.",
};

export default function TermsPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 prose-page">
      <h1 className="text-4xl font-semibold tracking-tight">Terms of use</h1>
      <p className="mt-4 text-muted">{INDEPENDENCE_DISCLAIMER}</p>
      <p className="mt-4 text-muted">
        TenderLens is provided free of charge for searching and understanding publicly available procurement notices. Information
        may be incomplete, delayed or unavailable when government APIs rate-limit or fail.
      </p>
      <p className="mt-4 text-muted">
        You remain responsible for checking the original notice and documents before bidding or making commercial decisions.
        TenderLens does not provide legal, financial or procurement advice and does not guarantee that any organisation is
        eligible for a contract.
      </p>
      <p className="mt-4 text-muted">
        Official data remains subject to the Open Government Licence and the terms of the source services. Do not use TenderLens
        to submit tenders or to scrape government sites beyond the documented public APIs used here.
      </p>
    </main>
  );
}
