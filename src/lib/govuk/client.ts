export const GOVUK_ORIGIN = "https://www.gov.uk";
export const USER_AGENT =
  "GovGuideAI/1.0 (independent educational tool; not affiliated with GOV.UK)";

export function toAbsoluteGovUkUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${GOVUK_ORIGIN}${path}`;
}

export function toContentPath(pathOrUrl: string): string | null {
  try {
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      const url = new URL(pathOrUrl);
      if (!url.hostname.endsWith("gov.uk")) return null;
      return url.pathname;
    }
  } catch {
    return null;
  }
  if (!pathOrUrl.startsWith("/")) return `/${pathOrUrl}`;
  return pathOrUrl;
}

export async function govukFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

const cache = new Map<string, { expires: number; value: unknown }>();

export function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    return Promise.resolve(hit.value as T);
  }
  return loader().then((value) => {
    cache.set(key, { value, expires: Date.now() + ttlMs });
    return value;
  });
}
