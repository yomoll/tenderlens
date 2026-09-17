import { cached, GOVUK_ORIGIN, govukFetch } from "./client";
import type { SearchHit } from "../types";

type RawOrganisation = {
  title?: string;
  acronym?: string;
};

type RawResult = {
  title?: string;
  link?: string;
  description?: string;
  content_store_document_type?: string;
  organisations?: RawOrganisation[];
  public_timestamp?: string;
  es_score?: number;
};

type SearchResponse = {
  results?: RawResult[];
  total?: number;
};

export async function searchGovUk(query: string, count = 8): Promise<{ hits: SearchHit[]; total: number }> {
  const key = `search:${query}:${count}`;
  return cached(key, 30 * 60 * 1000, async () => {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("count", String(count));
    for (const field of [
      "title",
      "link",
      "description",
      "content_store_document_type",
      "organisations",
      "public_timestamp",
    ]) {
      params.append("fields", field);
    }

    const response = await govukFetch(`${GOVUK_ORIGIN}/api/search.json?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`GOV.UK search failed (${response.status})`);
    }
    const data = (await response.json()) as SearchResponse;
    const hits: SearchHit[] = (data.results ?? [])
      .map((item) => {
        const link = item.link ?? "";
        if (!link.startsWith("/")) return null;
        return {
          title: item.title ?? "Untitled GOV.UK page",
          link,
          description: item.description ?? "",
          documentType: item.content_store_document_type ?? "unknown",
          organisation: item.organisations?.[0]?.title ?? item.organisations?.[0]?.acronym ?? null,
          updatedAt: item.public_timestamp ?? null,
          score: item.es_score ?? 0,
        } satisfies SearchHit;
      })
      .filter((item): item is SearchHit => item !== null);

    return { hits, total: data.total ?? hits.length };
  });
}
