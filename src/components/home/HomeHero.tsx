import Link from "next/link";
import { POPULAR_SEARCHES } from "@/lib/procurement/categories";
import { INDEPENDENCE_DISCLAIMER } from "@/lib/site";
import { SearchBar } from "@/components/search/SearchBar";

const trust = [
  "Official procurement data",
  "AI-powered explanations",
  "Free to search",
  "Original sources always linked",
];

export function HomeHero() {
  return (
    <div>
      <section className="bg-hero text-hero-ink">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 md:pb-14 md:pt-14">
          <p className="text-sm font-medium text-hero-ink/80">Independent CivicAI Labs service</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
            Public contracts shouldn&apos;t be difficult to understand.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-hero-ink/85">
            Search UK public-sector opportunities and turn complex tender notices into clear, actionable information.
          </p>
        </div>
      </section>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <div className="max-w-3xl">
            <SearchBar autoFocus />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href="/search" className="text-sm font-semibold text-accent">
              Browse opportunities
            </Link>
            <span className="text-sm text-muted">Popular:</span>
            {POPULAR_SEARCHES.map((item) => (
              <Link
                key={item.label}
                href={`/search?q=${encodeURIComponent(item.query)}`}
                className="rounded-md bg-navy-soft px-3 py-1.5 text-sm font-medium hover:bg-line"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="border-b border-line bg-navy-soft/60">
        <ul className="mx-auto grid max-w-6xl gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((item) => (
            <li key={item} className="text-sm font-medium">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function HomeRest() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold tracking-tight">Built for smaller organisations</h2>
        <p className="mt-3 max-w-2xl text-muted">
          TenderLens helps SMEs, sole traders, startups, charities, CICs, voluntary organisations, agencies, consultants and
          freelancers read public contracts more clearly.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { title: "Search", body: "TenderLens searches official public procurement information from Contracts Finder and Find a Tender." },
            { title: "Understand", body: "It turns procurement language into easier-to-read explanations, grounded in the published notice." },
            { title: "Verify and act", body: "You follow the original government notice before making decisions. TenderLens never submits a bid." },
          ].map((item) => (
            <div key={item.title} className="rounded-[12px] border border-line bg-surface p-5">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
        <Link href="/how-it-works" className="mt-6 inline-flex min-h-11 items-center font-semibold text-accent">
          How TenderLens works
        </Link>
      </section>
      <section className="bg-cta text-cta-ink">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="max-w-4xl text-sm leading-relaxed opacity-90">{INDEPENDENCE_DISCLAIMER}</p>
        </div>
      </section>
    </div>
  );
}
