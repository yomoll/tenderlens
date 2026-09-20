import type { Metadata } from "next";
import { SearchExperience } from "@/components/search/SearchExperience";
import { searchTenders } from "@/lib/procurement/source";
import type { TenderSearchResult } from "@/lib/procurement/types";
import { parseSearchInput } from "@/lib/search/validate";
import { FIND_A_TENDER_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toURLSearchParams(raw: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const next = Array.isArray(value) ? value[0] : value;
    if (next) params.set(key, next);
  }
  return params;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const raw = await searchParams;
  const hasQuery = Object.keys(raw).length > 0;
  return {
    title: "Search public contracts",
    description: "Search UK public-sector opportunities from official Contracts Finder and Find a Tender notices.",
    alternates: { canonical: "/search" },
    robots: { index: !hasQuery, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const parsed = parseSearchInput(toURLSearchParams(raw));
  let result: TenderSearchResult | null = null;
  let error: string | null = parsed.errors[0] ?? null;

  if (!error) {
    try {
      result = await searchTenders(parsed.params);
    } catch {
      error = "Tender data is temporarily unavailable. Please try again shortly or search directly on Find a Tender.";
    }
  }

  return (
    <main id="main">
      <SearchExperience initial={result} error={error} officialUrl={FIND_A_TENDER_URL} params={parsed.params} />
    </main>
  );
}
