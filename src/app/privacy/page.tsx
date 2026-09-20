import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How TenderLens handles searches, saved tenders and optional AI requests.",
};

export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 prose-page">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-4 text-muted">TenderLens is an independent CivicAI Labs service. You do not need an account to search.</p>
      <h2 className="mt-8 text-2xl font-semibold">Searches</h2>
      <p className="mt-2 text-muted">
        Search queries are sent to TenderLens servers so we can query official procurement APIs. We do not require a login.
        Government services will receive the search criteria needed to return notices.
      </p>
      <h2 className="mt-8 text-2xl font-semibold">Saved tenders</h2>
      <p className="mt-2 text-muted">
        Saved tenders are stored locally in your browser with localStorage. They are not sent to CivicAI Labs in this version.
        Clearing site data removes them. Account syncing is not available yet.
      </p>
      <h2 className="mt-8 text-2xl font-semibold">Fit checker</h2>
      <p className="mt-2 text-muted">
        Fit-checker answers remain on your device unless you run a check. If an AI provider is enabled, the organisation details
        you enter are sent temporarily with the official tender fields to generate a comparison. TenderLens does not store that
        profile on a server in V1.
      </p>
      <h2 className="mt-8 text-2xl font-semibold">AI explanations</h2>
      <p className="mt-2 text-muted">
        If an AI API key is configured on the server, official notice fields (and fit-checker answers, when used) are sent to that
        provider to produce structured JSON. If no key is configured, explanations are generated on the server from official
        fields only.
      </p>
      <h2 className="mt-8 text-2xl font-semibold">What we do not do</h2>
      <p className="mt-2 text-muted">
        No tender application is submitted through TenderLens. We do not use invasive tracking in V1. Analytics events are
        structured for a later privacy-friendly addition and currently stay in the browser.
      </p>
    </main>
  );
}
