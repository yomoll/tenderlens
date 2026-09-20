export const SITE_NAME = "TenderLens";
export const PARENT_BRAND = "CivicAI Labs";
export const TAGLINE = "Find public contracts. Understand them. Decide faster.";
export const SUPPORTING_LINE = "UK public-sector opportunities explained for smaller organisations.";

export const DEFAULT_PRODUCTION_HOST = "tenderlens.civicailabs.co.uk";
export const DEFAULT_PRODUCTION_URL = `https://${DEFAULT_PRODUCTION_HOST}`;

export const FIND_A_TENDER_URL = "https://www.find-tender.service.gov.uk/";
export const CONTRACTS_FINDER_URL = "https://www.contractsfinder.service.gov.uk/";
export const CIVICAI_LABS_URL = "https://civicailabs.co.uk";

export const INDEPENDENCE_DISCLAIMER =
  "TenderLens is an independent CivicAI Labs service and is not affiliated with the UK Government. Always review the original procurement notice before making commercial decisions.";

export const FOOTER_DISCLAIMER =
  "TenderLens is an independent CivicAI Labs project. It is not affiliated with or endorsed by the UK Government. Procurement information should always be verified against the original government notice.";

export const OGL_ATTRIBUTION =
  "Contains public sector information licensed under the Open Government Licence v3.0.";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production") return DEFAULT_PRODUCTION_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getMetadataBase(): URL {
  try {
    return new URL(getSiteUrl());
  } catch {
    return new URL(DEFAULT_PRODUCTION_URL);
  }
}

export function isProductionRuntime(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

export function fixturesAllowed(): boolean {
  if (process.env.USE_TENDER_FIXTURES !== "true") return false;
  if (process.env.VERCEL_ENV === "production") return false;
  return true;
}

export const USER_AGENT = `TenderLens/1.0 (+${DEFAULT_PRODUCTION_URL}; CivicAI Labs public-interest service)`;
