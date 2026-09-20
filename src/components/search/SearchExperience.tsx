"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SearchParams, SearchSort, Tender, TenderSearchResult } from "@/lib/procurement/types";
import { searchQueryString } from "@/lib/search/validate";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { LoadingTenderCard } from "@/components/tenders/LoadingTenderCard";
import { TenderList } from "@/components/tenders/TenderList";
import { SearchBar } from "./SearchBar";
import { SearchFilters } from "./SearchFilters";

export function SearchExperience({
  initial,
  error,
  officialUrl,
  params,
}: {
  initial: TenderSearchResult | null;
  error: string | null;
  officialUrl: string;
  params: SearchParams;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const filters = params;
  const dialog = useRef<HTMLDialogElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const currentQuery = searchQueryString(filters);

  function apply(next: SearchParams) {
    const query = searchQueryString(next);
    if (query === currentQuery) return;
    startTransition(() => {
      router.replace(`/search${query ? `?${query}` : ""}`);
    });
  }

  function changeSort(sort: SearchSort) {
    apply({ ...filters, sort });
  }

  const data = initial;
  const total = data?.total ?? data?.results.length ?? 0;
  const queryLabel = filters.q ? `"${filters.q}"` : "open opportunities";
  const loading = pending && !data?.results.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="lg:sticky lg:top-16 lg:z-20 lg:bg-paper lg:py-3">
        <SearchBar key={filters.q || "open"} initialQuery={filters.q || ""} sticky />
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-surface px-4 font-medium"
          onClick={() => {
            setFiltersOpen(true);
            dialog.current?.showModal();
          }}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="card sticky top-32 p-5">
            <h2 className="text-base font-semibold">Filters</h2>
            <div className="mt-4">
              <SearchFilters value={filters} onChange={apply} />
            </div>
          </div>
        </aside>
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {loading ? "Searching opportunities" : `${total.toLocaleString("en-GB")} opportunities`}
              </h1>
              <p className="text-muted">for {queryLabel}</p>
            </div>
            <label className="text-sm">
              <span className="sr-only">Sort results</span>
              <select
                className="h-11 rounded-md border border-line bg-surface px-3"
                value={filters.sort ?? "best-match"}
                onChange={(event) => changeSort(event.target.value as SearchSort)}
              >
                <option value="best-match">Best match</option>
                <option value="deadline-soonest">Deadline soonest</option>
                <option value="newly-published">Newly published</option>
                <option value="highest-value">Highest value</option>
                <option value="lowest-value">Lowest value</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-muted">
            Best match uses the official Contracts Finder relevance score when available, otherwise newest first. TenderLens
            does not invent relevance.
          </p>
          {pending ? (
            <p className="mt-3 text-sm text-muted" role="status" aria-live="polite">
              Updating results…
            </p>
          ) : null}
          {data?.sourceStatus.usingFixtures ? (
            <p className="mt-3 rounded-md bg-warning-soft px-3 py-2 text-sm text-warning" role="status">
              Showing marked sample data because official APIs were unavailable. These are not live opportunities.
            </p>
          ) : null}
          {data && (!data.sourceStatus.contractsFinder.ok || !data.sourceStatus.findATender.ok) ? (
            <p className="mt-3 text-sm text-muted" role="status">
              {!data.sourceStatus.contractsFinder.ok ? "Contracts Finder is temporarily unavailable. " : null}
              {!data.sourceStatus.findATender.ok ? "Find a Tender feed is temporarily unavailable. " : null}
              Results below use whichever official source responded. You can also search on{" "}
              <a className="underline" href={officialUrl}>
                Find a Tender
              </a>
              .
            </p>
          ) : null}
          <div className={`mt-6 ${pending ? "opacity-70" : ""}`} aria-busy={pending}>
            {loading ? (
              <div className="grid gap-4" aria-busy="true" aria-live="polite">
                <LoadingTenderCard />
                <LoadingTenderCard />
                <LoadingTenderCard />
              </div>
            ) : error && !data?.results.length ? (
              <ErrorState message={error} />
            ) : !data?.results.length ? (
              <EmptyState
                title="No opportunities matched those filters."
                body="Try broadening keywords, removing the location restriction, increasing the value range, or including planning notices."
                actionLabel="Clear search"
                actionHref="/search"
              />
            ) : (
              <TenderList tenders={data.results as Tender[]} />
            )}
          </div>
        </section>
      </div>

      <dialog
        ref={dialog}
        className="w-[min(100%,28rem)] rounded-lg border border-line bg-surface p-0 text-ink"
        onClose={() => setFiltersOpen(false)}
      >
        {filtersOpen ? (
          <div className="max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button type="button" className="min-h-11 min-w-11" onClick={() => dialog.current?.close()} aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4">
              <SearchFilters value={filters} onChange={apply} idPrefix="mobile-filter" />
            </div>
            <button
              type="button"
              className="mt-6 min-h-11 w-full rounded-md bg-cta font-semibold text-cta-ink"
              onClick={() => dialog.current?.close()}
            >
              Show results
            </button>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
