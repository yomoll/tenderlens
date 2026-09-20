import type { TenderSource } from "./types";

const CF_GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FAT_OCID = /^ocds-h6vhtk-[a-z0-9-]+$/i;

export type ParsedTenderId = {
  source: TenderSource;
  nativeId: string;
};

export function encodeTenderId(source: TenderSource, nativeId: string): string {
  return `${source === "contracts-finder" ? "cf" : "fat"}:${nativeId}`;
}

export function parseTenderId(id: string): ParsedTenderId | null {
  const value = decodeURIComponent(id).trim();
  const match = /^(cf|fat):(.+)$/i.exec(value);
  if (!match) return null;

  const prefix = match[1].toLowerCase();
  const nativeId = match[2].trim();

  if (prefix === "cf") {
    if (!CF_GUID.test(nativeId)) return null;
    return { source: "contracts-finder", nativeId: nativeId.toLowerCase() };
  }

  if (!FAT_OCID.test(nativeId)) return null;
  return { source: "find-a-tender", nativeId: nativeId.toLowerCase() };
}

export function tenderPath(id: string): string {
  return `/tender/${encodeURIComponent(id)}`;
}
