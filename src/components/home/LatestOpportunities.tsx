import { latestOpportunities } from "@/lib/procurement/source";
import { FIND_A_TENDER_URL } from "@/lib/site";
import { LoadingTenderCard } from "@/components/tenders/LoadingTenderCard";
import { TenderCard } from "@/components/tenders/TenderCard";
import { ErrorState } from "@/components/ui/EmptyState";

export async function LatestOpportunities() {
  let data;
  try {
    data = await latestOpportunities(6);
  } catch {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold tracking-tight">Latest opportunities</h2>
        <div className="mt-6">
          <ErrorState />
        </div>
      </section>
    );
  }

  const failed = !data.sourceStatus.contractsFinder.ok && !data.sourceStatus.findATender.ok && !data.results.length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Latest opportunities</h2>
      <p className="mt-2 max-w-2xl text-muted">
        Recently published notices from official sources. TenderLens does not invent live contracts.
      </p>
      {data.sourceStatus.usingFixtures ? (
        <p className="mt-3 rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
          Showing marked sample data because official APIs were unavailable. These are not live opportunities.
        </p>
      ) : null}
      {failed ? (
        <div className="mt-6">
          <ErrorState />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.results.map((tender) => (
            <TenderCard key={tender.id} tender={tender} compact />
          ))}
        </div>
      )}
      <a href={FIND_A_TENDER_URL} className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-accent">
        Browse more on Find a Tender
      </a>
    </section>
  );
}

export function LatestOpportunitiesFallback() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-3xl font-semibold tracking-tight">Latest opportunities</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <LoadingTenderCard />
        <LoadingTenderCard />
        <LoadingTenderCard />
        <LoadingTenderCard />
      </div>
    </section>
  );
}
