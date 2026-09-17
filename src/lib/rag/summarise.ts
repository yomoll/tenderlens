import type { AskAnswer, ChecklistItem, Interpretation, SourceDocument } from "../types";
import { splitSentences } from "../govuk/text";

const OBLIGATION =
  /\b(you must|you need to|you should|you may need to|register for|tell hmrc|keep records|send a tax return|apply (for|online)|file (your |a )?tax return|log in)\b/i;

const ACTION_START =
  /^(apply|register|check|tell|keep|send|file|log in|sign in|report|pay|claim|update|contact|use |find |get |download|complete|submit|name your|set up)/i;

const NOT_ACTION =
  /^(who |what |when |where |why |your |information |overview|related |if you('ve| have) never|if you did not|this guide|print )/i;

function sourceId(index: number): string {
  return `S${index + 1}`;
}

function scoreSentence(sentence: string, question: string): number {
  const qWords = new Set(question.toLowerCase().split(/\W+/).filter((word) => word.length > 3));
  const words = sentence.toLowerCase().split(/\W+/);
  let score = 0;
  for (const word of words) {
    if (qWords.has(word)) score += 1;
  }
  if (OBLIGATION.test(sentence)) score += 4;
  if (/^(you |if you |to |check |apply |register )/i.test(sentence)) score += 2;
  if (/^(you can apply|to get a .* apply online|you must tell hmrc|register for self assessment)/i.test(sentence)) {
    score += 5;
  }
  if (/^if you('re| are) aged/i.test(sentence) && !/\b(16|19|age)\b/i.test(question)) score -= 4;
  if (/\b(self assessment|vat|national insurance|register|deadline|5 october|31 january|apply online)\b/i.test(sentence)) {
    score += 3;
  }
  if (/this guide is also available/i.test(sentence)) score -= 6;
  if (/[a-z] [A-Z][a-z]+ [A-Z]/.test(sentence) && !/[.!?]/.test(sentence.slice(0, 40))) score -= 5;
  return score;
}

function toChecklistTitle(text: string): string {
  let shortened = text
    .replace(/^(you must|you need to|you should|you may need to)\s+/i, "")
    .replace(/\.$/, "")
    .replace(/\s+/g, " ")
    .trim();
  const firstClause = shortened.split(/,(?= you | if | and you )/i)[0]?.trim() ?? shortened;
  if (firstClause.length >= 12 && firstClause.length <= 100) {
    shortened = firstClause;
  } else if (shortened.length > 80) {
    const comma = shortened.indexOf(",");
    if (comma > 24 && comma <= 90) shortened = shortened.slice(0, comma);
    else {
      const cut = shortened.lastIndexOf(" ", 80);
      shortened = shortened.slice(0, cut > 40 ? cut : 80);
    }
  }
  return shortened.replace(/^\w/, (letter) => letter.toUpperCase());
}

function isActionTitle(title: string): boolean {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length < 8 || clean.length > 110) return false;
  if (NOT_ACTION.test(clean)) return false;
  if (/ - /.test(clean) && !ACTION_START.test(clean)) return false;
  if (ACTION_START.test(clean)) return true;
  return OBLIGATION.test(clean);
}

function firstDetailSentence(text: string): string {
  return splitSentences(text)[0] ?? text.replace(/\s+/g, " ").trim().slice(0, 280);
}

function extractiveChecklist(docs: SourceDocument[]): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const seen = new Set<string>();

  const push = (title: string, detail: string, sourceIds: string[]) => {
    const cleanTitle = toChecklistTitle(title);
    if (!isActionTitle(cleanTitle)) return;
    const key = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) return;
    seen.add(key);
    const cleanDetail = firstDetailSentence(detail);
    items.push({
      id: `c${items.length + 1}`,
      title: cleanTitle,
      detail: (cleanDetail || `See the official page for this step.`).slice(0, 280),
      sourceIds,
    });
  };

  docs.forEach((doc, index) => {
    const sid = sourceId(index);
    for (const step of doc.steps) {
      push(step.title, step.text || `See ${doc.title} for this step.`, [sid]);
    }
  });

  if (items.length < 4) {
    docs.forEach((doc, index) => {
      const sid = sourceId(index);
      if (doc.documentType === "step_by_step_nav") return;
      for (const sentence of splitSentences(doc.text)) {
        if (!OBLIGATION.test(sentence)) continue;
        push(sentence, `From ${doc.title}.`, [sid]);
      }
    });
  }

  if (items.length === 0) {
    docs.forEach((doc, index) => {
      const sid = sourceId(index);
      for (const heading of doc.headings.slice(0, 8)) {
        push(heading.title, heading.text || `Read ${doc.title} on GOV.UK.`, [sid]);
      }
    });
  }

  return items.slice(0, 6);
}

function sentencesFrom(doc: SourceDocument): string[] {
  const fromHeadings = doc.headings.flatMap((heading) => splitSentences(heading.text));
  const fromBody = splitSentences(doc.text);
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const sentence of [...fromHeadings, ...fromBody]) {
    const key = sentence.toLowerCase().slice(0, 70);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(sentence);
  }
  return merged;
}

function extractiveParagraphs(interpretation: Interpretation, docs: SourceDocument[]): string[] {
  const picked: string[] = [];
  const used = new Set<string>();
  const narrativeDocs = docs.filter((doc) => doc.documentType !== "step_by_step_nav");
  const pool = (narrativeDocs.length ? narrativeDocs : docs).flatMap(sentencesFrom);

  const consider = (sentence: string) => {
    const clean = sentence.replace(/\s+/g, " ").trim();
    if (clean.length < 50 || clean.length > 380) return;
    if (/this guide is also available|find out what you need to do to set up a business/i.test(clean)) return;
    if (/•/.test(clean)) return;
    const key = clean.toLowerCase().slice(0, 70);
    if (used.has(key)) return;
    used.add(key);
    picked.push(clean);
  };

  const ranked = pool
    .map((sentence) => ({ sentence, score: scoreSentence(sentence, interpretation.question) }))
    .sort((a, b) => b.score - a.score);

  for (const item of ranked) {
    if (item.score >= 2) consider(item.sentence);
    if (picked.length >= 3) break;
  }

  if (picked.length < 2) {
    for (const sentence of pool) {
      consider(sentence);
      if (picked.length >= 3) break;
    }
  }

  consider(
    "This is a plain-English summary of official GOV.UK pages. Check the linked guidance before you act, because details can depend on your situation.",
  );
  return picked.slice(0, 4);
}

export function summariseExtractive(interpretation: Interpretation, docs: SourceDocument[]): AskAnswer {
  const paragraphs = extractiveParagraphs(interpretation, docs);
  const checklist = extractiveChecklist(docs);
  const sources = docs.map((doc, index) => ({
    id: sourceId(index),
    title: doc.title,
    url: doc.url,
    basePath: doc.basePath,
    organisation: doc.organisation,
    documentType: doc.documentType.replace(/_/g, " "),
    updatedAt: doc.updatedAt,
    excerpt: doc.excerpt,
  }));

  return {
    id: crypto.randomUUID(),
    question: interpretation.question,
    interpretation: interpretation.interpretation,
    topic: interpretation.topic,
    intent: interpretation.intent,
    summary: paragraphs.join("\n\n"),
    paragraphs,
    checklist,
    caveats: [
      "Independent tool. Not affiliated with GOV.UK.",
      "Always check the linked official guidance before you act.",
      "This summary can go out of date. Use the GOV.UK pages for the current rules.",
    ],
    sources,
    queries: interpretation.queries,
    mode: "extractive",
    generatedAt: new Date().toISOString(),
    language: "en",
  };
}

export function sourcesForPrompt(docs: SourceDocument[]) {
  return docs.map((doc, index) => ({
    id: sourceId(index),
    title: doc.title,
    url: doc.url,
    organisation: doc.organisation,
    updatedAt: doc.updatedAt,
    text: doc.text.slice(0, 5000),
    steps: doc.steps,
  }));
}
