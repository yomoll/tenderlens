import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Accessibility approach for TenderLens, including keyboard access, contrast and reduced motion.",
};

export default function AccessibilityPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 prose-page">
      <h1 className="text-4xl font-semibold tracking-tight">Accessibility</h1>
      <p className="mt-4 text-muted">
        TenderLens is designed to be usable with a keyboard, a screen reader and reduced motion settings. Pages use semantic
        headings, labelled forms, visible focus states and text that does not rely on colour alone.
      </p>
      <p className="mt-4 text-muted">
        Tender cards and filters are built for small screens, with a filter drawer on mobile and comparison stacking into cards
        instead of cramped tables.
      </p>
      <p className="mt-4 text-muted">
        If you find an accessibility barrier, contact CivicAI Labs through{" "}
        <a href="https://civicailabs.co.uk" className="font-semibold text-accent">
          civicailabs.co.uk
        </a>
        .
      </p>
    </main>
  );
}
