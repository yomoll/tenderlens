import Link from "next/link";
import { FIND_A_TENDER_URL } from "@/lib/site";

export function EmptyState({
  title,
  body,
  actionHref = "/search",
  actionLabel = "Explore tenders",
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card px-6 py-12 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-muted">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={actionHref} className="inline-flex min-h-11 items-center rounded-md bg-cta px-4 font-semibold text-cta-ink">
          {actionLabel}
        </Link>
        <a href={FIND_A_TENDER_URL} className="inline-flex min-h-11 items-center rounded-md border border-line px-4 font-semibold">
          Open Find a Tender
        </a>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="card border-danger/30 px-6 py-10 text-center" role="alert">
      <h2 className="text-xl font-semibold">Tender data is temporarily unavailable</h2>
      <p className="mx-auto mt-2 max-w-xl text-muted">
        {message || "Please try again shortly or search directly on Find a Tender."}
      </p>
      <a
        href={FIND_A_TENDER_URL}
        className="mt-6 inline-flex min-h-11 items-center rounded-md bg-cta px-4 font-semibold text-cta-ink"
      >
        Search on Find a Tender
      </a>
    </div>
  );
}
