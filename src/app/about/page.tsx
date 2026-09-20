import type { Metadata } from "next";
import { CIVICAI_LABS_URL, INDEPENDENCE_DISCLAIMER } from "@/lib/site";

export const metadata: Metadata = {
  title: "About CivicAI Labs",
  description: "TenderLens is an independent CivicAI Labs service that explains official UK public procurement notices.",
};

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 prose-page">
      <h1 className="text-4xl font-semibold tracking-tight">About CivicAI Labs</h1>
      <p className="mt-4 text-lg text-muted">
        CivicAI Labs builds independent public-interest tools that make official information easier to use. TenderLens is one of
        those tools.
      </p>
      <p className="mt-4 text-muted">{INDEPENDENCE_DISCLAIMER}</p>
      <p className="mt-4 text-muted">
        Other tools and updates are published at{" "}
        <a href={CIVICAI_LABS_URL} className="font-semibold text-accent">
          civicailabs.co.uk
        </a>
        .
      </p>
    </main>
  );
}
