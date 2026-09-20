import { cached, DETAIL_CACHE_TTL_MS, FEED_CACHE_TTL_MS } from "../cache";
import { isoDaysFromNow } from "../format/deadline";
import { fetchJson } from "../http";
import { categoryFromCpv, cpvCodesForCategory } from "./categories";
import { normalizeFindATenderPackage, normalizeFindATenderRelease } from "./normalize";
import type { ProcurementSource, SearchParams, Tender } from "./types";

function baseUrl(): string {
  return (process.env.FIND_A_TENDER_BASE_URL || "https://www.find-tender.service.gov.uk").replace(/\/$/, "");
}

type OcdsPackage = {
  releases?: unknown[];
  records?: unknown[];
  links?: { next?: string };
};

function stageFor(status?: SearchParams["status"]): string {
  if (status === "planning") return "planning";
  if (status === "awarded") return "award";
  return "tender";
}

function matchesParams(tender: Tender, params: SearchParams): boolean {
  if (params.q) {
    const hay = `${tender.title} ${tender.description ?? ""} ${tender.buyer.name}`.toLowerCase();
    if (!hay.includes(params.q.toLowerCase())) return false;
  }
  if (params.buyer && !tender.buyer.name.toLowerCase().includes(params.buyer.toLowerCase())) return false;
  if (params.sme && tender.suitableForSME !== true) return false;
  if (params.vcse && tender.suitableForVCSE !== true) return false;
  if (params.minValue) {
    const amount = tender.value?.max ?? tender.value?.min;
    if (amount === undefined || amount < params.minValue) return false;
  }
  if (params.maxValue) {
    const amount = tender.value?.min ?? tender.value?.max;
    if (amount === undefined || amount > params.maxValue) return false;
  }
  if (params.category && params.category !== "other") {
    const wanted = cpvCodesForCategory(params.category) ?? [];
    const prefixes = wanted.map((code) => code.slice(0, 2));
    const tenderPrefixes = (tender.cpvCodes ?? []).map((item) => item.code.replace(/\D/g, "").slice(0, 2));
    const label = categoryFromCpv(tender.cpvCodes);
    const categoryLabel = tender.category;
    const matchCpv = tenderPrefixes.some((prefix) => prefixes.includes(prefix));
    const matchLabel = Boolean(label && categoryLabel && label === categoryLabel);
    if (!matchCpv && !matchLabel) return false;
  }
  if (params.region && params.region !== "uk") {
    const locations = (tender.locations ?? []).join(" ").toLowerCase();
    if (params.region === "scotland" && !locations.includes("scotland") && !/\bukm\b/.test(locations)) return false;
    if (params.region === "wales" && !locations.includes("wales") && !/\bukl\b/.test(locations)) return false;
    if (params.region === "northern-ireland" && !locations.includes("northern ireland") && !/\bukn\b/.test(locations)) {
      return false;
    }
  }
  if (params.deadlinePreset || params.deadlineTo) {
    if (!tender.deadline) return false;
    const latest = params.deadlineTo || isoDaysFromNow(Number(params.deadlinePreset || 90));
    if (new Date(tender.deadline).getTime() > new Date(latest).getTime()) return false;
  }
  return true;
}

async function fetchFeed(params: SearchParams): Promise<Tender[]> {
  const collected: Tender[] = [];
  const seen = new Set<string>();
  const stages = stageFor(params.status);
  const updatedFrom = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
  let url: string | undefined =
    `${baseUrl()}/api/1.0/ocdsReleasePackages?stages=${stages}&limit=50&updatedFrom=${encodeURIComponent(updatedFrom)}`;

  for (let page = 0; page < 3 && url; page += 1) {
    const payload: OcdsPackage = await fetchJson<OcdsPackage>(url, { source: "Find a Tender" });
    for (const release of payload.releases ?? []) {
      const tender = normalizeFindATenderRelease(release);
      if (!tender || seen.has(tender.id)) continue;
      seen.add(tender.id);
      collected.push(tender);
    }
    url = payload.links?.next;
  }

  return collected;
}

export const findATenderSource: ProcurementSource = {
  id: "find-a-tender",
  async search(params) {
    const key = `fat:feed:${stageFor(params.status)}`;
    const feed = await cached(key, FEED_CACHE_TTL_MS, () => fetchFeed(params));
    const results = feed.filter((tender) => matchesParams(tender, params));
    return {
      results,
      total: results.length,
      sourceStatus: {
        contractsFinder: { ok: true, label: "Contracts Finder" },
        findATender: { ok: true, label: "Find a Tender" },
        usingFixtures: false,
      },
    };
  },
  async getTender(id) {
    const key = `fat:record:${id}`;
    return cached(key, DETAIL_CACHE_TTL_MS, async () => {
      const payload = await fetchJson<unknown>(`${baseUrl()}/api/1.0/ocdsRecordPackages/${encodeURIComponent(id)}`, {
        source: "Find a Tender",
      });
      return normalizeFindATenderPackage(payload);
    });
  },
};
