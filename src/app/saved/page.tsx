import type { Metadata } from "next";
import { SavedList } from "@/components/SavedList";

export const metadata: Metadata = {
  title: "Saved answers",
};

export default function SavedPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight">Saved answers</h1>
      <p className="mt-3 max-w-[60ch] text-muted">
        These stay in this browser only. Clearing site data will delete them. They are not sent to GOV.UK.
      </p>
      <SavedList />
    </main>
  );
}
