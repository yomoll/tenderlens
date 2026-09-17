import { fetchContent } from "../govuk/content";
import { searchGovUk } from "../govuk/search";
import { toContentPath } from "../govuk/client";
import type { Interpretation, SearchHit, SourceDocument } from "../types";

const PREFERRED_TYPES = new Set([
  "guide",
  "answer",
  "transaction",
  "step_by_step_nav",
  "detailed_guide",
  "publication",
  "place",
  "local_transaction",
  "simple_smart_answer",
]);

const REJECT_TYPES = new Set([
  "news_story",
  "press_release",
  "speech",
  "fatality_notice",
  "authored_article",
  "world_news_story",
  "correspondence",
  "consultation",
  "research",
  "statistical_data_set",
  "foi_release",
  "html_publication",
]);

const WEAK_TYPES = new Set([
  "mainstream_browse_page",
  "topic",
  "topical_event",
  "taxon",
  "finder",
  "search",
  "organisation",
]);

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function overlap(a: string, b: string): number {
  const left = new Set(tokens(a));
  if (left.size === 0) return 0;
  const right = tokens(b);
  let hits = 0;
  for (const word of right) {
    if (left.has(word)) hits += 1;
  }
  return hits / Math.max(left.size, 1);
}

function isWeakPath(path: string): boolean {
  return path.startsWith("/browse/") || path.startsWith("/government/organisations/");
}

export function isOffTopic(hit: Pick<SearchHit, "title" | "link">, interpretation: Interpretation): boolean {
  const haystack = `${hit.title} ${hit.link}`;
  if (interpretation.topic !== "limited-company" && /companies house/i.test(haystack)) return true;
  if (interpretation.topic === "self-employment") {
    return /visa|visitor|childcare|immigration/i.test(haystack);
  }
  if (interpretation.topic === "self-assessment") {
    return /visa|childcare|child benefit|immigration|estimate.your.income.tax/i.test(haystack);
  }
  if (interpretation.topic === "national-insurance" && /apply/i.test(interpretation.question)) {
    return /voluntary|abroad|pdu1|periods abroad|estimate.your.income.tax/i.test(haystack);
  }
  if (interpretation.topic === "driving") {
    if (/hmrc|visa|childcare|personal independence/i.test(haystack)) return true;
    if (/address|move|moved/i.test(interpretation.question)) {
      return /sold-bought-vehicle|sold, transferred or bought|make-a-sorn|sorn|provisional driving licence|check if a vehicle is taxed|get vehicle information/i.test(
        haystack,
      );
    }
  }
  if (interpretation.topic !== "visa" && /visa|immigration/i.test(hit.title) && overlap(interpretation.question, hit.title) < 0.2) {
    return true;
  }
  return false;
}

export function scoreHit(hit: SearchHit, interpretation: Interpretation, preferred: Set<string>): number {
  let score = hit.score;
  if (preferred.has(hit.link)) score += 20;
  if (PREFERRED_TYPES.has(hit.documentType)) score += 5;
  if (REJECT_TYPES.has(hit.documentType)) score -= 12;
  if (WEAK_TYPES.has(hit.documentType) || isWeakPath(hit.link)) score -= 10;
  score += overlap(interpretation.question, `${hit.title} ${hit.description}`) * 8;
  if (isOffTopic(hit, interpretation)) score -= 18;
  return score;
}

function scoreDocument(doc: SourceDocument, interpretation: Interpretation): number {
  const preferred = new Set(interpretation.preferredPaths);
  let score = overlap(interpretation.question, `${doc.title} ${doc.excerpt}`) * 10;
  if (preferred.has(doc.basePath)) score += 16;
  if (PREFERRED_TYPES.has(doc.documentType)) score += 5;
  if (WEAK_TYPES.has(doc.documentType) || isWeakPath(doc.basePath)) score -= 12;
  if (isOffTopic({ title: doc.title, link: doc.basePath }, interpretation)) score -= 18;
  return score;
}

export async function retrieveSources(
  interpretation: Interpretation,
  onProgress?: (info: { queries: string[]; hitCount: number }) => void,
): Promise<SourceDocument[]> {
  const preferred = new Set(interpretation.preferredPaths.filter((path) => !isWeakPath(path)));
  const searchResults = await Promise.allSettled(
    interpretation.queries.map((query) => searchGovUk(query, 8)),
  );

  const merged = new Map<string, SearchHit>();
  let hitCount = 0;
  for (const result of searchResults) {
    if (result.status !== "fulfilled") continue;
    hitCount += result.value.hits.length;
    for (const hit of result.value.hits) {
      const existing = merged.get(hit.link);
      if (!existing || hit.score > existing.score) merged.set(hit.link, hit);
    }
  }

  for (const path of preferred) {
    if (merged.has(path)) continue;
    merged.set(path, {
      title: path,
      link: path,
      description: "",
      documentType: "guide",
      organisation: null,
      updatedAt: null,
      score: 1,
    });
  }

  onProgress?.({ queries: interpretation.queries, hitCount });

  const ranked = Array.from(merged.values())
    .map((hit) => ({ hit, rank: scoreHit(hit, interpretation, preferred) }))
    .sort((a, b) => b.rank - a.rank)
    .map((item) => item.hit)
    .filter((hit) => !REJECT_TYPES.has(hit.documentType) && !isOffTopic(hit, interpretation));

  const candidatePaths = uniquePaths(ranked.map((hit) => hit.link)).slice(0, 8);

  const documents = (
    await Promise.all(
      candidatePaths.map(async (path) => {
        try {
          return await fetchContent(path);
        } catch {
          return null;
        }
      }),
    )
  ).filter((doc): doc is SourceDocument => Boolean(doc) && !doc?.withdrawn);

  const extraPaths: string[] = [];
  for (const doc of documents) {
    if (doc.documentType !== "step_by_step_nav") continue;
    for (const step of doc.steps) {
      for (const link of step.links) {
        const path = toContentPath(link.href);
        if (path) extraPaths.push(path);
      }
    }
  }

  const extras = (
    await Promise.all(
      uniquePaths(extraPaths)
        .filter((path) => !documents.some((doc) => doc.basePath === path))
        .slice(0, 4)
        .map(async (path) => {
          try {
            return await fetchContent(path);
          } catch {
            return null;
          }
        }),
    )
  ).filter((doc): doc is SourceDocument => Boolean(doc) && !doc?.withdrawn);

  return uniqueByPath([...documents, ...extras])
    .map((doc) => ({ doc, rank: scoreDocument(doc, interpretation) }))
    .sort((a, b) => b.rank - a.rank)
    .map((item) => item.doc)
    .filter((doc) => !isOffTopic({ title: doc.title, link: doc.basePath }, interpretation))
    .slice(0, 5);
}

function uniquePaths(paths: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const path of paths) {
    if (!path || seen.has(path)) continue;
    seen.add(path);
    result.push(path);
  }
  return result;
}

function uniqueByPath(docs: SourceDocument[]): SourceDocument[] {
  const seen = new Set<string>();
  const result: SourceDocument[] = [];
  for (const doc of docs) {
    if (seen.has(doc.basePath)) continue;
    seen.add(doc.basePath);
    result.push(doc);
  }
  return result;
}
