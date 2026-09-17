import type { AskAnswer } from "./types";

export const SAVED_KEY = "govguide.saved.v1";

export function loadSavedAnswers(): AskAnswer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AskAnswer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAnswer(answer: AskAnswer): AskAnswer[] {
  const existing = loadSavedAnswers().filter((item) => item.question !== answer.question);
  const next = [answer, ...existing].slice(0, 30);
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}

export function removeSavedAnswer(id: string): AskAnswer[] {
  const next = loadSavedAnswers().filter((item) => item.id !== id);
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}

export function isSaved(question: string): boolean {
  return loadSavedAnswers().some((item) => item.question === question);
}

export function shareUrlFor(question: string): string {
  const url = new URL(window.location.origin);
  url.searchParams.set("q", question);
  return url.toString();
}

export function answerAsPlainText(answer: AskAnswer): string {
  const lines = [
    `Question: ${answer.question}`,
    "",
    `What this is asking: ${answer.interpretation}`,
    "",
    "Summary",
    ...answer.paragraphs,
    "",
    "What you may need to do",
    ...answer.checklist.map((item, index) => `${index + 1}. ${item.title}${item.detail ? ` - ${item.detail}` : ""}`),
    "",
    "Official sources",
    ...answer.sources.map((source) => `- ${source.title}: ${source.url}`),
    "",
    "Independent tool. Not affiliated with GOV.UK. Always check the linked official guidance.",
  ];
  return lines.join("\n");
}
