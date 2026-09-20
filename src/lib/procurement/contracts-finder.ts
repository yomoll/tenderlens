import { cached, SEARCH_CACHE_TTL_MS, DETAIL_CACHE_TTL_MS } from "../cache";
import { isoDaysFromNow } from "../format/deadline";
import { fetchJson } from "../http";
import { cpvCodesForCategory } from "./categories";
import { encodeTenderId } from "./ids";
import { normalizeContractsFinderItem, normalizeContractsFinderNotice } from "./normalize";
import type { ProcurementSource, SearchParams, Tender, TenderSearchResult } from "./types";

const ENGLAND_REGIONS = [
  "East Midlands",
  "East of England",
  "London",
  "North East",
  "North West",
  "South East",
  "South West",
  "West Midlands",
  "Yorkshire and The Humber",
];

function baseUrl(): string {
  return (process.env.CONTRACTS_FINDER_BASE_URL || "https://www.contractsfinder.service.gov.uk").replace(/\/$/, "");
}

function regionFilter(region?: SearchParams["region"]): string | undefined {
  if (!region || region === "uk") return undefined;
  if (region === "england") return ENGLAND_REGIONS.join(",");
  if (region === "scotland") return "Scotland";
  if (region === "wales") return "Wales";
  if (region === "northern-ireland") return "Northern Ireland";
  return undefined;
}

function deadlineWindow(params: SearchParams): { from?: string; to?: string } {
  if (params.deadlineFrom || params.deadlineTo) {
    return { from: params.deadlineFrom, to: params.deadlineTo };
  }
  if (params.deadlinePreset === "7") return { to: isoDaysFromNow(7) };
  if (params.deadlinePreset === "30") return { to: isoDaysFromNow(30) };
  if (params.deadlinePreset === "90") return { to: isoDaysFromNow(90) };
  return {};
}

function searchBody(params: SearchParams) {
  const deadlines = deadlineWindow(params);
  const status = params.status ?? "open";
  const types = status === "planning" ? ["Pipeline"] : ["Contract"];
  const statuses =
    status === "planning" ? undefined : status === "awarded" ? ["Awarded"] : ["Open"];

  return {
    searchCriteria: {
      types,
      statuses,
      keyword: params.q || undefined,
      queryString: params.buyer ? `"${params.buyer}"` : undefined,
      regions: regionFilter(params.region),
      valueFrom: params.minValue,
      valueTo: params.maxValue,
      deadlineFrom: deadlines.from,
      deadlineTo: deadlines.to,
      suitableForSme: params.sme ? true : undefined,
      suitableForVco: params.vcse ? true : undefined,
      cpvCodes: cpvCodesForCategory(params.category),
    },
    size: Math.min(Math.max(params.pageSize ?? 80, 1), 200),
  };
}

async function searchNotices(params: SearchParams): Promise<TenderSearchResult> {
  const body = searchBody(params);
  const payload = await fetchJson<{
    hitCount?: number;
    noticeList?: unknown[];
  }>(`${baseUrl()}/api/rest/2/search_notices/json`, {
    method: "POST",
    source: "Contracts Finder",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let results = (payload.noticeList ?? [])
    .map(normalizeContractsFinderItem)
    .filter((item): item is Tender => Boolean(item));

  if (params.buyer) {
    const needle = params.buyer.toLowerCase();
    results = results.filter((item) => item.buyer.name.toLowerCase().includes(needle));
  }

  return {
    results,
    total: payload.hitCount,
    sourceStatus: {
      contractsFinder: { ok: true, label: "Contracts Finder" },
      findATender: { ok: true, label: "Find a Tender" },
      usingFixtures: false,
    },
  };
}

export const contractsFinderSource: ProcurementSource = {
  id: "contracts-finder",
  async search(params) {
    const key = `cf:search:${JSON.stringify(searchBody(params))}`;
    return cached(key, SEARCH_CACHE_TTL_MS, () => searchNotices(params));
  },
  async getTender(id) {
    const key = `cf:notice:${id}`;
    return cached(key, DETAIL_CACHE_TTL_MS, async () => {
      const payload = await fetchJson<unknown>(`${baseUrl()}/api/rest/2/get_published_notice/json/${id}`, {
        source: "Contracts Finder",
      });
      return normalizeContractsFinderNotice(payload);
    });
  },
};

export async function searchContractsFinderOcds(limit = 20): Promise<Tender[]> {
  const url = new URL(`${baseUrl()}/Published/Notices/OCDS/Search`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("stages", "tender");
  try {
    const payload = await cached(`cf:ocds:${limit}`, SEARCH_CACHE_TTL_MS, () =>
      fetchJson<{ releases?: unknown[] }>(url.toString(), { source: "Contracts Finder OCDS" }),
    );
    return (payload.releases ?? [])
      .map((release) => {
        const record = release as { ocid?: string; tender?: { title?: string } };
        if (!record.ocid || !record.tender?.title) return null;
        return {
          ...normalizeContractsFinderItem({
            id: record.ocid,
            title: record.tender.title,
          }),
        };
      })
      .filter((item): item is Tender => Boolean(item));
  } catch {
    return [];
  }
}

export function contractsFinderNoticeUrl(nativeId: string): string {
  return `https://www.contractsfinder.service.gov.uk/Notice/${encodeTenderId("contracts-finder", nativeId).replace(/^cf:/, "")}`;
}
