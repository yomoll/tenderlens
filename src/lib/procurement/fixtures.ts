import { encodeTenderId } from "./ids";
import type { Tender, TenderSearchResult } from "./types";

const FUTURE = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
const RECENT = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

export const FIXTURE_TENDERS: Tender[] = [
  {
    id: encodeTenderId("contracts-finder", "11111111-2222-4333-8444-555555555555"),
    source: "contracts-finder",
    sourceUrl: "https://www.contractsfinder.service.gov.uk/",
    sourceLabel: "Contracts Finder",
    title: "[Sample] Digital accessibility support for a public body",
    description:
      "Sample fixture only. A contracting authority is seeking digital accessibility support, including audits, remediation advice and staff training. This record is mock data for local development.",
    buyer: { name: "Sample Contracting Authority" },
    status: "open",
    publishedAt: RECENT,
    deadline: FUTURE,
    value: { min: 80000, max: 120000, currency: "GBP" },
    locations: ["London"],
    cpvCodes: [{ code: "72000000", description: "IT services: consulting, software development, Internet and support" }],
    category: "Technology",
    suitableForSME: true,
    suitableForVCSE: true,
    procurementStage: "Open",
    noticeType: "Contract",
    reference: "SAMPLE-ACCESS-001",
    isFixture: true,
  },
  {
    id: encodeTenderId("find-a-tender", "ocds-h6vhtk-sample1"),
    source: "find-a-tender",
    sourceUrl: "https://www.find-tender.service.gov.uk/",
    sourceLabel: "Find a Tender",
    title: "[Sample] Supported living services in a local area",
    description:
      "Sample fixture only. A local authority is seeking supported living services. This record is mock data for local development and must not be treated as a live opportunity.",
    buyer: { name: "Sample Local Authority" },
    status: "open",
    publishedAt: RECENT,
    deadline: FUTURE,
    value: { min: 250000, max: 400000, currency: "GBP" },
    locations: ["North West"],
    cpvCodes: [{ code: "85300000", description: "Social work and related services" }],
    category: "Social Care",
    suitableForSME: true,
    suitableForVCSE: true,
    procurementStage: "tender",
    isFixture: true,
  },
  {
    id: encodeTenderId("contracts-finder", "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"),
    source: "contracts-finder",
    sourceUrl: "https://www.contractsfinder.service.gov.uk/",
    sourceLabel: "Contracts Finder",
    title: "[Sample] Website development and content design",
    description: "Sample fixture only. Website rebuild, content design and training. Mock data for development.",
    buyer: { name: "Sample Combined Authority" },
    status: "open",
    publishedAt: RECENT,
    deadline: FUTURE,
    value: { min: 40000, max: 75000, currency: "GBP" },
    locations: ["Yorkshire and The Humber"],
    cpvCodes: [{ code: "72413000", description: "World wide web WWW site design services" }],
    category: "Technology",
    suitableForSME: true,
    procurementStage: "Open",
    isFixture: true,
  },
];

export function fixtureSearch(query?: string): TenderSearchResult {
  const needle = query?.toLowerCase().trim();
  const results = FIXTURE_TENDERS.filter((item) => {
    if (!needle) return true;
    return `${item.title} ${item.description ?? ""} ${item.buyer.name}`.toLowerCase().includes(needle);
  });
  return {
    results,
    total: results.length,
    sourceStatus: {
      contractsFinder: { ok: true, label: "Contracts Finder" },
      findATender: { ok: true, label: "Find a Tender" },
      usingFixtures: true,
    },
  };
}

export function fixtureById(id: string): Tender | null {
  return FIXTURE_TENDERS.find((item) => item.id === id) ?? null;
}
