import { cached, GOVUK_ORIGIN, govukFetch, toAbsoluteGovUkUrl, toContentPath } from "./client";
import { excerptFrom, htmlToPlain } from "./text";
import type { SourceDocument } from "../types";

type ContentItem = {
  title?: string;
  base_path?: string;
  schema_name?: string;
  document_type?: string;
  public_updated_at?: string;
  description?: string;
  withdrawn_notice?: { explanation?: string; withdrawn_at?: string } | null;
  details?: Record<string, unknown>;
  links?: {
    organisations?: Array<{ title?: string }>;
  };
};

type StepNav = {
  introduction?: string;
  steps?: Array<{
    title?: string;
    contents?: Array<{
      type?: string;
      text?: string;
      contents?: Array<{ href?: string; text?: string }>;
    }>;
  }>;
};

type GuidePart = {
  title?: string;
  slug?: string;
  body?: string;
};

function organisationFrom(item: ContentItem): string | null {
  return item.links?.organisations?.[0]?.title ?? null;
}

function collectHtml(details: Record<string, unknown> | undefined): string {
  if (!details) return "";
  const chunks: string[] = [];
  const body = details.body;
  if (typeof body === "string") chunks.push(body);
  if (typeof details.introduction === "string") chunks.push(details.introduction);
  if (typeof details.introductory_paragraph === "string") chunks.push(details.introductory_paragraph);
  if (typeof details.more_information === "string") chunks.push(details.more_information);
  if (typeof details.need_to_know === "string") chunks.push(details.need_to_know);
  if (Array.isArray(details.parts)) {
    for (const part of details.parts as GuidePart[]) {
      if (part.title) chunks.push(`<h2>${part.title}</h2>`);
      if (part.body) chunks.push(part.body);
    }
  }
  const nav = details.step_by_step_nav as StepNav | undefined;
  if (nav?.introduction) chunks.push(`<p>${nav.introduction}</p>`);
  return chunks.join("\n");
}

function extractSteps(details: Record<string, unknown> | undefined) {
  const nav = details?.step_by_step_nav as StepNav | undefined;
  if (!nav?.steps?.length) return [];
  return nav.steps.map((step) => {
    const texts: string[] = [];
    const links: Array<{ href: string; text: string }> = [];
    for (const block of step.contents ?? []) {
      if (block.text) texts.push(block.text);
      for (const link of block.contents ?? []) {
        if (link.href && link.text) {
          links.push({ href: link.href, text: link.text });
          texts.push(link.text);
        }
      }
    }
    return {
      title: step.title ?? "Step",
      text: texts.join(" ").trim(),
      links,
    };
  });
}

function extractHeadings(html: string) {
  const headings: Array<{ title: string; text: string }> = [];
  const regex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  const parts = html.split(regex);
  if (parts.length < 3) return headings;
  for (let i = 1; i < parts.length; i += 2) {
    const title = htmlToPlain(parts[i] ?? "").trim();
    const text = htmlToPlain(parts[i + 1] ?? "").trim();
    if (title) headings.push({ title, text });
  }
  return headings;
}

export async function fetchContent(pathOrUrl: string): Promise<SourceDocument | null> {
  const initialPath = toContentPath(pathOrUrl);
  if (!initialPath) return null;

  return cached(`content:${initialPath}`, 60 * 60 * 1000, async () => {
    let path = initialPath;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await govukFetch(`${GOVUK_ORIGIN}/api/content${path}`, {
        redirect: "manual",
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) return null;
        const nextPath = toContentPath(location);
        if (!nextPath) return null;
        path = nextPath;
        continue;
      }

      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`GOV.UK content failed (${response.status}) for ${path}`);

      const item = (await response.json()) as ContentItem;
      if (item.schema_name === "redirect") {
        const redirects = item.details?.redirects as Array<{ destination?: string }> | undefined;
        const destination = redirects?.[0]?.destination;
        if (!destination) return null;
        const nextPath = toContentPath(destination);
        if (!nextPath) return null;
        path = nextPath;
        continue;
      }

      const html = collectHtml(item.details);
      const textFromHtml = htmlToPlain(html);
      const description = item.description ?? "";
      const text = [description, textFromHtml].filter(Boolean).join("\n\n").trim();
      if (!text) return null;

      const withdrawn = Boolean(item.withdrawn_notice?.withdrawn_at);
      const basePath = item.base_path ?? path;
      const steps = extractSteps(item.details);
      const headings = extractHeadings(html);

      return {
        id: basePath,
        title: item.title ?? "GOV.UK page",
        url: toAbsoluteGovUkUrl(basePath),
        basePath,
        organisation: organisationFrom(item),
        documentType: item.document_type ?? item.schema_name ?? "unknown",
        schemaName: item.schema_name ?? "unknown",
        updatedAt: item.public_updated_at ?? null,
        excerpt: excerptFrom(text),
        text: text.slice(0, 12_000),
        headings,
        steps,
        withdrawn,
      } satisfies SourceDocument;
    }
    return null;
  });
}
