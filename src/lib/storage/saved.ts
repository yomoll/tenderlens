import type { Tender } from "../procurement/types";

export const SAVED_KEY = "tenderlens.saved.v1";
export const CHECKLIST_KEY = "tenderlens.checklist.v1";
export const COMPARE_KEY = "tenderlens.compare.v1";

export type SavedTender = Pick<
  Tender,
  | "id"
  | "title"
  | "source"
  | "sourceUrl"
  | "sourceLabel"
  | "status"
  | "deadline"
  | "publishedAt"
  | "value"
  | "locations"
  | "category"
  | "suitableForSME"
  | "suitableForVCSE"
> & {
  buyerName: string;
  savedAt: string;
};

export function toSavedTender(tender: Tender, savedAt = new Date().toISOString()): SavedTender {
  return {
    id: tender.id,
    title: tender.title,
    source: tender.source,
    sourceUrl: tender.sourceUrl,
    sourceLabel: tender.sourceLabel,
    status: tender.status,
    deadline: tender.deadline,
    publishedAt: tender.publishedAt,
    value: tender.value,
    locations: tender.locations,
    category: tender.category,
    suitableForSME: tender.suitableForSME,
    suitableForVCSE: tender.suitableForVCSE,
    buyerName: tender.buyer.name,
    savedAt,
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadSavedTenders(): SavedTender[] {
  const parsed = readJson<SavedTender[]>(SAVED_KEY, []);
  return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === "string") : [];
}

export function isTenderSaved(id: string): boolean {
  return loadSavedTenders().some((item) => item.id === id);
}

export function saveTender(tender: Tender): SavedTender[] {
  const next = [toSavedTender(tender), ...loadSavedTenders().filter((item) => item.id !== tender.id)].slice(0, 50);
  writeJson(SAVED_KEY, next);
  return next;
}

export function removeSavedTender(id: string): SavedTender[] {
  const next = loadSavedTenders().filter((item) => item.id !== id);
  writeJson(SAVED_KEY, next);
  return next;
}

export function loadChecklistState(tenderId: string): Record<string, boolean> {
  const all = readJson<Record<string, Record<string, boolean>>>(CHECKLIST_KEY, {});
  return all[tenderId] ?? {};
}

export function saveChecklistState(tenderId: string, state: Record<string, boolean>) {
  const all = readJson<Record<string, Record<string, boolean>>>(CHECKLIST_KEY, {});
  all[tenderId] = state;
  writeJson(CHECKLIST_KEY, all);
}

export function loadCompareIds(): string[] {
  const parsed = readJson<string[]>(COMPARE_KEY, []);
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string").slice(0, 3) : [];
}

export function toggleCompareId(id: string): string[] {
  const current = loadCompareIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 3);
  writeJson(COMPARE_KEY, next);
  return next;
}

export function setCompareIds(ids: string[]): string[] {
  const next = ids.slice(0, 3);
  writeJson(COMPARE_KEY, next);
  return next;
}
