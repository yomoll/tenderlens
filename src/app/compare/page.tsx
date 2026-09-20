import type { Metadata } from "next";
import { CompareExperience } from "@/components/saved/CompareExperience";

export const metadata: Metadata = {
  title: "Compare tenders",
  description: "Compare facts from up to three saved UK public contracts. TenderLens does not rank a best tender.",
  robots: { index: false, follow: false },
};

export default function ComparePage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Compare tenders</h1>
      <p className="mt-2 max-w-2xl text-muted">
        This view places official fields side by side. It does not say which opportunity is best.
      </p>
      <div className="mt-8">
        <CompareExperience />
      </div>
    </main>
  );
}
