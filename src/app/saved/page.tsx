import type { Metadata } from "next";
import { SavedExperience } from "@/components/saved/SavedExperience";

export const metadata: Metadata = {
  title: "Saved tenders",
  description: "Opportunities saved on this device in TenderLens. Account syncing is coming later.",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Saved tenders</h1>
      <div className="mt-6">
        <SavedExperience />
      </div>
    </main>
  );
}
