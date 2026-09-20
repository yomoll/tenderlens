export class UpstreamError extends Error {
  readonly statusCode: number;
  readonly retryAfterSeconds?: number;
  readonly source: string;

  constructor(source: string, statusCode: number, message: string, retryAfterSeconds?: number) {
    super(message);
    this.name = "UpstreamError";
    this.source = source;
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function userSafeUpstreamMessage(error: unknown): string {
  if (error instanceof UpstreamError) {
    if (error.statusCode === 429) {
      return "The official procurement service is temporarily limiting requests. Please wait a moment and try again, or search on Find a Tender.";
    }
    if (error.statusCode === 403) {
      return "The official procurement service declined this request. Try again shortly, or open Find a Tender directly.";
    }
    if (error.statusCode >= 500) {
      return "The official procurement service is currently unavailable. Please try again shortly or search directly on Find a Tender.";
    }
  }
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "The official procurement service took too long to respond. Please try again shortly or search directly on Find a Tender.";
  }
  return "Tender data is temporarily unavailable. Please try again shortly or search directly on Find a Tender.";
}

function retryAfter(response: Response): number | undefined {
  const raw = response.headers.get("retry-after");
  if (!raw) return undefined;
  const seconds = Number(raw);
  return Number.isFinite(seconds) ? seconds : undefined;
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number; source?: string } = {},
): Promise<T> {
  const { timeoutMs = 12000, source = "upstream", ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      signal: rest.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "TenderLens/1.0 (CivicAI Labs; public-interest)",
        ...(rest.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new UpstreamError(
        source,
        response.status,
        `${source} returned ${response.status}`,
        retryAfter(response),
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof UpstreamError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new UpstreamError(source, 504, `${source} timed out`);
    }
    throw new UpstreamError(source, 503, error instanceof Error ? error.message : "Network error");
  } finally {
    clearTimeout(timer);
  }
}
