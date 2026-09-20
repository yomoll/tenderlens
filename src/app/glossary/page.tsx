import type { Metadata } from "next";
import { GlossarySearch } from "@/components/glossary/GlossarySearch";

export const metadata: Metadata = {
  title: "Procurement glossary",
  description: "Plain-English definitions of common UK public procurement terms used in TenderLens.",
};

export default function GlossaryPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Procurement glossary</h1>
      <p className="mt-4 text-lg text-muted">
        Plain English first. These definitions are for orientation only and do not replace official guidance or the tender
        documents.
      </p>
      <div className="mt-8">
        <GlossarySearch />
      </div>
    </main>
  );
}
