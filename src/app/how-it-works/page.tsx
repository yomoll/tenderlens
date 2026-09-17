import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works",
};

const steps = [
  {
    title: "You ask in everyday language",
    body: "Type a question the way you would say it. The app does not need official form names or GOV.UK page titles.",
  },
  {
    title: "The question is interpreted",
    body: "GovGuide turns the question into a short intent and a set of GOV.UK search queries. Known topics, such as self-employment, also load the most relevant official paths directly.",
  },
  {
    title: "Official pages are retrieved",
    body: "Search uses the public GOV.UK Search API. Full page text and metadata come from the GOV.UK Content API, so the site is not scraped.",
  },
  {
    title: "A cited summary is written",
    body: "The answer is a plain-English summary, a “what you may need to do” checklist, and the official links underneath. If an AI model is configured, it may only use the retrieved pages. Otherwise the summary is extracted from those pages.",
  },
];

export default function HowItWorksPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight">How it works</h1>
      <p className="mt-3 max-w-[62ch] text-lg text-muted">
        This is a retrieval-augmented explainer: search first, then summarise, then cite. It is built so you can see every source.
      </p>

      <ol className="mt-10 space-y-0">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={`grid gap-4 border-line py-8 md:grid-cols-[7rem_minmax(0,1fr)] ${index === 0 ? "border-t" : ""} border-b`}
          >
            <p className="font-semibold text-accent">{String(index + 1).padStart(2, "0")}</p>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{step.title}</h2>
              <p className="mt-2 max-w-[62ch] text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-12 border border-line bg-surface p-6">
        <h2 className="text-2xl font-bold">What this is not</h2>
        <p className="mt-3 max-w-[62ch] text-muted">
          It is not legal advice, tax advice, or a government service. It cannot log in to HMRC, submit forms, or decide your eligibility. Use the GOV.UK links to act.
        </p>
        <p className="mt-6">
          <Link href="/" className="font-bold text-accent underline underline-offset-4 hover:text-accent-hover">
            Ask a question
          </Link>
        </p>
      </section>
    </main>
  );
}
