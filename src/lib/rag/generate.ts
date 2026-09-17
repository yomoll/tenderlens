import type { LanguageOption } from "../languages";
import type { AskAnswer, Interpretation, SourceDocument } from "../types";
import { sourcesForPrompt, summariseExtractive } from "./summarise";

type ModelPayload = {
  interpretation?: string;
  paragraphs?: string[];
  checklist?: Array<{ title?: string; detail?: string; sourceIds?: string[] }>;
  caveats?: string[];
};

function openaiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

function looksGlued(text: string): boolean {
  return /[a-z] (You|If|To|Check|Apply|Register|Who|Your) [a-z]/.test(text) && !/[.!?] You /.test(text);
}

function usableParagraphs(paragraphs: string[] | undefined, fallback: string[]): string[] {
  const cleaned = (paragraphs ?? [])
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length > 40 && paragraph.length < 600 && !looksGlued(paragraph));
  return cleaned.length >= 2 ? cleaned.slice(0, 5) : fallback;
}

function usableChecklist(
  checklist: ModelPayload["checklist"],
  fallback: AskAnswer["checklist"],
): AskAnswer["checklist"] {
  const items = (checklist ?? [])
    .map((item, index) => ({
      id: `c${index + 1}`,
      title: item.title?.replace(/\s+/g, " ").trim() || "",
      detail: item.detail?.replace(/\s+/g, " ").trim() || "",
      sourceIds: item.sourceIds?.length ? item.sourceIds : fallback[index]?.sourceIds ?? ["S1"],
    }))
    .filter((item) => item.title.length >= 8 && !/^(who |what |when |your |information )/i.test(item.title));
  return items.length >= 2 ? items.slice(0, 6) : fallback;
}

export async function summariseAnswer(
  interpretation: Interpretation,
  docs: SourceDocument[],
): Promise<AskAnswer> {
  const fallback = summariseExtractive(interpretation, docs);
  if (!openaiConfigured() || docs.length === 0) return fallback;

  try {
    const generated = await generateWithOpenAI(interpretation, docs);
    if (!generated) return fallback;
    const paragraphs = usableParagraphs(generated.paragraphs, fallback.paragraphs);
    const checklist = usableChecklist(generated.checklist, fallback.checklist);
    return {
      ...fallback,
      interpretation: generated.interpretation?.trim() || fallback.interpretation,
      paragraphs,
      summary: paragraphs.join("\n\n"),
      checklist,
      caveats: generated.caveats?.length ? generated.caveats : fallback.caveats,
      mode: "generative",
    };
  } catch {
    return fallback;
  }
}

async function generateWithOpenAI(
  interpretation: Interpretation,
  docs: SourceDocument[],
): Promise<ModelPayload | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

  const body = {
    model,
    temperature: 0.15,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You explain UK government information in plain English for the public.
Use only the provided GOV.UK excerpts. Do not invent rates, deadlines, thresholds, forms, or eligibility.
If a detail is missing, tell the reader to check the cited page.
UK spelling. Short complete sentences. No em dashes. Never glue a heading onto the next sentence.
Checklist items must be actions a person may need to take, such as "Apply online for a National Insurance number". Do not use section titles such as "Who can apply" or "Your National Insurance number".
Return JSON with:
interpretation (one sentence),
paragraphs (array of 3 to 5 short paragraphs),
checklist (array of {title, detail, sourceIds} where sourceIds are like "S1"),
caveats (array of short warnings).
Every checklist item must cite at least one source id that exists.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          question: interpretation.question,
          interpretedAs: interpretation.interpretation,
          sources: sourcesForPrompt(docs),
        }),
      },
    ],
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(content) as ModelPayload;
}

export async function translateAnswer(answer: AskAnswer, language: LanguageOption): Promise<AskAnswer> {
  if (language.code === "en") return { ...answer, language: "en" };
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("Translation needs an OpenAI API key on the server.");
  }
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Translate the JSON fields interpretation, paragraphs, checklist titles/details, and caveats into ${language.name}.
Keep source titles, URLs, and sourceIds unchanged.
Keep numbers, dates, and official names accurate.
Return the same JSON shape. No em dashes.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            targetLanguage: language.name,
            interpretation: answer.interpretation,
            paragraphs: answer.paragraphs,
            checklist: answer.checklist,
            caveats: answer.caveats,
          }),
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Translation failed (${response.status})`);
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as Partial<AskAnswer> & {
    paragraphs?: string[];
    checklist?: AskAnswer["checklist"];
    caveats?: string[];
    interpretation?: string;
  };

  return {
    ...answer,
    interpretation: parsed.interpretation || answer.interpretation,
    paragraphs: parsed.paragraphs?.length ? parsed.paragraphs : answer.paragraphs,
    summary: (parsed.paragraphs ?? answer.paragraphs).join("\n\n"),
    checklist: parsed.checklist?.length ? parsed.checklist : answer.checklist,
    caveats: parsed.caveats?.length ? parsed.caveats : answer.caveats,
    language: language.code,
  };
}
