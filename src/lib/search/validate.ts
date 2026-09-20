import { sanitizeSearchText } from "../format/text";
import type { SearchCategory, SearchDeadlinePreset, SearchParams, SearchRegion, SearchSort, SearchStatusFilter } from "../procurement/types";

const STATUSES = new Set<SearchStatusFilter>(["open", "planning", "awarded"]);
const REGIONS = new Set<SearchRegion>(["uk", "england", "scotland", "wales", "northern-ireland"]);
const CATEGORIES = new Set<SearchCategory>([
  "technology",
  "healthcare",
  "social-care",
  "construction",
  "professional-services",
  "marketing",
  "education",
  "transport",
  "facilities",
  "environment",
  "other",
]);
const DEADLINES = new Set<SearchDeadlinePreset>(["7", "30", "90", "custom"]);
const SORTS = new Set<SearchSort>(["best-match", "deadline-soonest", "newly-published", "highest-value", "lowest-value"]);

function asEnum<T extends string>(value: unknown, allowed: Set<T>): T | undefined {
  if (typeof value !== "string") return undefined;
  return allowed.has(value as T) ? (value as T) : undefined;
}

function asPositiveNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000_000_000) return undefined;
  return Math.round(parsed);
}

function asFlag(value: unknown): boolean | undefined {
  if (value === true || value === "true" || value === "1" || value === "on") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
}

export type SearchValidation = {
  params: SearchParams;
  errors: string[];
};

export function parseSearchInput(input: Record<string, unknown> | URLSearchParams): SearchValidation {
  const read = (key: string): unknown => {
    if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
    return input[key];
  };

  const errors: string[] = [];
  const q = sanitizeSearchText(String(read("q") ?? ""), 180) || undefined;
  const buyer = sanitizeSearchText(String(read("buyer") ?? ""), 120) || undefined;
  const minValue = asPositiveNumber(read("minValue"));
  const maxValue = asPositiveNumber(read("maxValue"));
  if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
    errors.push("Minimum value cannot be higher than maximum value.");
  }

  const cursorRaw = String(read("cursor") ?? "");
  const cursor = /^\d{1,6}$/.test(cursorRaw) ? cursorRaw : undefined;

  const params: SearchParams = {
    q,
    status: asEnum(read("status"), STATUSES) ?? "open",
    region: asEnum(read("region"), REGIONS),
    minValue,
    maxValue,
    sme: asFlag(read("sme")),
    vcse: asFlag(read("vcse")),
    category: asEnum(read("category"), CATEGORIES),
    deadlinePreset: asEnum(read("deadline"), DEADLINES) ?? asEnum(read("deadlinePreset"), DEADLINES),
    deadlineFrom: sanitizeSearchText(String(read("deadlineFrom") ?? ""), 40) || undefined,
    deadlineTo: sanitizeSearchText(String(read("deadlineTo") ?? ""), 40) || undefined,
    buyer,
    sort: asEnum(read("sort"), SORTS) ?? "best-match",
    cursor,
    pageSize: asPositiveNumber(read("pageSize")) ?? asPositiveNumber(read("limit")),
  };

  return { params, errors };
}

export function searchQueryString(params: SearchParams): string {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "open") query.set("status", params.status);
  if (params.region && params.region !== "uk") query.set("region", params.region);
  if (params.minValue !== undefined) query.set("minValue", String(params.minValue));
  if (params.maxValue !== undefined) query.set("maxValue", String(params.maxValue));
  if (params.sme) query.set("sme", "true");
  if (params.vcse) query.set("vcse", "true");
  if (params.category) query.set("category", params.category);
  if (params.deadlinePreset) query.set("deadline", params.deadlinePreset);
  if (params.buyer) query.set("buyer", params.buyer);
  if (params.sort && params.sort !== "best-match") query.set("sort", params.sort);
  return query.toString();
}
