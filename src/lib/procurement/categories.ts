import type { SearchCategory } from "./types";

export const CATEGORIES: { id: SearchCategory; label: string; keywords: string[] }[] = [
  { id: "technology", label: "Technology", keywords: ["digital", "software", "IT", "web", "data"] },
  { id: "healthcare", label: "Healthcare", keywords: ["healthcare", "NHS", "clinical"] },
  { id: "social-care", label: "Social Care", keywords: ["social care", "supported living"] },
  { id: "construction", label: "Construction", keywords: ["construction", "building", "works"] },
  { id: "professional-services", label: "Professional Services", keywords: ["consultancy", "advisory"] },
  { id: "marketing", label: "Marketing & Communications", keywords: ["marketing", "communications", "brand"] },
  { id: "education", label: "Education", keywords: ["education", "training", "school"] },
  { id: "transport", label: "Transport", keywords: ["transport", "highways", "fleet"] },
  { id: "facilities", label: "Facilities", keywords: ["facilities", "cleaning", "maintenance"] },
  { id: "environment", label: "Environment", keywords: ["environment", "waste", "net zero"] },
  { id: "other", label: "Other", keywords: [] },
];

export const POPULAR_SEARCHES = [
  { label: "Digital", query: "digital" },
  { label: "Healthcare", query: "healthcare" },
  { label: "Construction", query: "construction" },
  { label: "Consultancy", query: "consultancy" },
  { label: "Marketing", query: "digital marketing" },
  { label: "Social Care", query: "social care" },
] as const;

const CPV_BY_CATEGORY: Record<Exclude<SearchCategory, "other">, string[]> = {
  technology: ["48000000", "72000000", "30200000", "32000000", "50300000", "64200000"],
  healthcare: ["33000000", "33100000", "85100000", "33600000"],
  "social-care": ["85300000", "85000000", "98000000", "85310000"],
  construction: ["45000000", "44000000", "45200000", "45300000", "45400000"],
  "professional-services": ["79000000", "79400000", "73200000", "71300000", "79200000"],
  marketing: ["79340000", "79341000", "79410000", "22462000", "79342000"],
  education: ["80000000", "80400000", "80500000", "80300000"],
  transport: ["60000000", "34000000", "63000000", "60100000", "34920000"],
  facilities: ["50000000", "90910000", "55500000", "70330000", "50800000"],
  environment: ["90700000", "90500000", "90000000", "90710000", "45222100"],
};

export function cpvCodesForCategory(category?: SearchCategory): string[] | undefined {
  if (!category || category === "other") return undefined;
  return CPV_BY_CATEGORY[category];
}

export function categoryFromCpv(codes: { code: string; description?: string }[] | undefined): string | undefined {
  if (!codes?.length) return undefined;
  const joined = codes.map((item) => `${item.code} ${item.description ?? ""}`.toLowerCase()).join(" ");
  const prefixes = codes.map((item) => item.code.replace(/\D/g, "").slice(0, 2));

  const has = (starts: string[]) => prefixes.some((prefix) => starts.includes(prefix));

  if (has(["48", "72", "30", "32", "64"])) return "Technology";
  if (has(["33", "85"]) && /health|medical|hospital|nhs|pharma/.test(joined)) return "Healthcare";
  if (has(["85", "98"]) && /social|care|welfare|community/.test(joined)) return "Social Care";
  if (has(["33"])) return "Healthcare";
  if (has(["85", "98"])) return "Social Care";
  if (has(["45", "44"])) return "Construction";
  if (has(["79", "73"]) && /advert|market|communicat|public relation/.test(joined)) return "Marketing & Communications";
  if (has(["79", "73", "71"])) return "Professional Services";
  if (has(["80"])) return "Education";
  if (has(["60", "34", "63"])) return "Transport";
  if (has(["50", "55"])) return "Facilities";
  if (has(["90"])) return "Environment";
  return codes[0]?.description;
}

export function categoryLabel(id?: SearchCategory): string | undefined {
  return CATEGORIES.find((item) => item.id === id)?.label;
}
