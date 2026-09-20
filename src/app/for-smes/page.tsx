import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For SMEs",
  description: "A concise guide to finding and reading UK public-sector tenders, written for smaller organisations.",
};

const topics = [
  {
    title: "Finding public contracts",
    body: "Most UK public buyers publish notices on Find a Tender, the Central Digital Platform. Contracts Finder remains useful for many below-threshold opportunities. TenderLens searches those official sources and always links back to them.",
  },
  {
    title: "Understanding procurement notices",
    body: "A notice is a public summary, not the full pack. Titles, values and dates can be incomplete. Read the description, then open the official documents before you decide whether to bid.",
  },
  {
    title: "CPV codes",
    body: "CPV codes classify what is being bought. They help you search, but a code can be broad or imperfect. Use them as a starting point, then read the actual requirement.",
  },
  {
    title: "Contract value",
    body: "Published values are estimates. They may be a range, a single figure, or missing. A high value does not always mean a large organisation is required. Check any stated financial thresholds in the documents.",
  },
  {
    title: "Clarification questions",
    body: "Many competitions allow questions up to a stated deadline, often earlier than the submission date. If the notice does not show a clarification deadline, look in the documents or on the e-tendering portal.",
  },
  {
    title: "Tender deadlines",
    body: "The closing date and time in the official notice is the one that matters. TenderLens displays it in your browser timezone, but does not change the official timestamp.",
  },
  {
    title: "SME suitability",
    body: "A notice may be flagged as suitable for SMEs or VCSEs. That is a buyer indication, not a decision that you are eligible. Larger suppliers are not automatically excluded unless the documents say so.",
  },
  {
    title: "Procurement documents",
    body: "Specifications, selection questionnaires, pricing schedules and terms usually sit behind the notice. TenderLens cannot invent those requirements if they are not in the published data.",
  },
  {
    title: "Preparing evidence",
    body: "Typical evidence includes case studies, policies, insurance, accreditations and pricing. Only treat an item as mandatory if the official documents ask for it.",
  },
  {
    title: "Common tender terminology",
    body: "Words such as contracting authority, lots, framework and award notice have specific meanings. Use the TenderLens glossary for plain-English definitions.",
  },
];

export default function ForSmesPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">For SMEs and smaller organisations</h1>
      <p className="mt-4 text-lg text-muted">
        Public contracts can look impenetrable. This page is a short briefing, not legal advice. Always check the original
        government notice and current official guidance.
      </p>
      <div className="mt-10 space-y-8">
        {topics.map((topic) => (
          <section key={topic.title}>
            <h2 className="text-2xl font-semibold">{topic.title}</h2>
            <p className="mt-2 text-muted">{topic.body}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted">
        Official starting points:{" "}
        <a href="https://www.gov.uk/contracts-finder" className="font-semibold text-accent">
          GOV.UK on Contracts Finder
        </a>
        ,{" "}
        <a href="https://www.find-tender.service.gov.uk/" className="font-semibold text-accent">
          Find a Tender
        </a>
        , and{" "}
        <a href="https://www.gov.uk/government/collections/procurement-act-2023" className="font-semibold text-accent">
          Procurement Act 2023 guidance
        </a>
        .
      </p>
      <p className="mt-6">
        <Link href="/glossary" className="font-semibold text-accent">
          Open the glossary
        </Link>
      </p>
    </main>
  );
}
