import { fixturesAllowed } from "../site";
import { userSafeUpstreamMessage } from "../http";
import { numericSortValue } from "../format/currency";
import { contractsFinderSource } from "./contracts-finder";
import { findATenderSource } from "./find-a-tender";
import { fixtureById, fixtureSearch } from "./fixtures";
import { parseTenderId } from "./ids";
import type { SearchParams, SearchSort, SourceHealth, Tender, TenderSearchResult } from "./types";


function sortResults(tenders: Tender[], sort: SearchSort | undefined): Tender[] {
  const mode = sort ?? "best-match";
  return [...tenders].sort((a, b) => {
    if (mode === "deadline-soonest") {
      const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    }
    if (mode === "newly-published") {
      return (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) - (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
    }
    if (mode === "highest-value") {
      return numericSortValue(b.value) - numericSortValue(a.value);
    }
    if (mode === "lowest-value") {
      const aValue = numericSortValue(a.value);
      const bValue = numericSortValue(b.value);
      if (!Number.isFinite(aValue)) return 1;
      if (!Number.isFinite(bValue)) return -1;
      return aValue - bValue;
    }
    const aScore = a.relevanceScore ?? 0;
    const bScore = b.relevanceScore ?? 0;
    if (aScore !== bScore) return bScore - aScore;
    return (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) - (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
  });
}

function healthFromError(label: string, error: unknown): SourceHealth {
  return {
    ok: false,
    label,
    message: userSafeUpstreamMessage(error),
  };
}

function dedupe(tenders: Tender[]): Tender[] {
  const seen = new Set<string>();
  const result: Tender[] = [];
  for (const tender of tenders) {
    const key = tender.id;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(tender);
  }
  return result;
}

export async function searchTenders(params: SearchParams): Promise<TenderSearchResult> {
  const [cfResult, fatResult] = await Promise.allSettled([
    contractsFinderSource.search(params),
    findATenderSource.search(params),
  ]);

  const cfOk = cfResult.status === "fulfilled";
  const fatOk = fatResult.status === "fulfilled";
  const cfTenders = cfOk ? cfResult.value.results : [];
  const fatTenders = fatOk ? fatResult.value.results : [];

  const results = sortResults(dedupe([...cfTenders, ...fatTenders]), params.sort);
  const total = (cfOk ? cfResult.value.total : 0) || results.length;

  const sourceStatus = {
    contractsFinder: cfOk
      ? { ok: true, label: "Contracts Finder" }
      : healthFromError("Contracts Finder", cfResult.reason),
    findATender: fatOk ? { ok: true, label: "Find a Tender" } : healthFromError("Find a Tender", fatResult.reason),
    usingFixtures: false,
  };

  if (!cfOk && !fatOk) {
    if (fixturesAllowed()) {
      const fixtures = fixtureSearch(params.q);
      return {
        ...fixtures,
        results: sortResults(fixtures.results, params.sort),
        sourceStatus: {
          ...sourceStatus,
          usingFixtures: true,
        },
      };
    }
    return {
      results: [],
      total: 0,
      sourceStatus,
    };
  }

  const pageSize = Math.min(params.pageSize ?? 20, 50);
  const offset = Number.parseInt(params.cursor || "0", 10) || 0;
  const page = results.slice(offset, offset + pageSize);
  const next = offset + pageSize < results.length ? String(offset + pageSize) : undefined;

  return {
    results: page,
    total: cfOk ? Math.max(total ?? 0, results.length) : results.length,
    nextCursor: next,
    sourceStatus,
  };
}

export async function getTender(id: string): Promise<Tender | null> {
  const parsed = parseTenderId(id);
  if (!parsed) {
    if (fixturesAllowed()) return fixtureById(id);
    return null;
  }

  try {
    if (parsed.source === "contracts-finder") {
      return await contractsFinderSource.getTender(parsed.nativeId);
    }
    return await findATenderSource.getTender(parsed.nativeId);
  } catch (error) {
    if (fixturesAllowed()) {
      return fixtureById(`${parsed.source === "contracts-finder" ? "cf" : "fat"}:${parsed.nativeId}`) ?? fixtureById(id);
    }
    throw error;
  }
}

export async function latestOpportunities(limit = 6): Promise<TenderSearchResult> {
  return searchTenders({
    status: "open",
    sort: "newly-published",
    pageSize: limit,
  });
}
