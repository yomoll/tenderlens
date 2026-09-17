export function htmlToPlain(html: string): string {
  if (!html) return "";
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<\/h[1-6]>/gi, ".\n");
  text = text.replace(/<\/(p|div|li|tr|section|article|blockquote)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "• ");
  text = text.replace(/<h[1-6][^>]*>/gi, "\n");
  text = text.replace(/<[^>]+>/g, " ");
  text = decodeEntities(text);
  text = text.replace(/\u00a0/g, " ");
  text = text.replace(/([.!?])\.\s*/g, "$1 ");
  text = flattenBulletClauses(text);
  text = text.replace(/[ \t]+\n/g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.replace(/[ \t]{2,}/g, " ");
  return text.trim();
}

export function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export function flattenBulletClauses(text: string): string {
  return text.replace(/([^\n:]{8,}):\s*((?:•\s*[^\n•]+)(?:\s*•\s*[^\n•]+)+)/g, (_all, intro: string, list: string) => {
    const items = [...list.matchAll(/•\s*([^\n•]+)/g)].map((match) =>
      match[1].trim().replace(/[.;]+$/, ""),
    );
    if (items.length < 2) return `${intro}: ${list.replace(/\s+/g, " ").trim()}`;
    const last = items.pop() as string;
    return `${intro} ${items.join(", ")} and ${last}`;
  });
}

function ensureSentence(part: string): string {
  const clean = part.replace(/\s+/g, " ").trim().replace(/^•\s*/, "");
  if (!clean) return "";
  if (/[.!?]$/.test(clean)) return clean;
  if (!/\b(you|your|to |if |apply|register|check|must|need|can |should|have |has |is |are |will |may )\b/i.test(clean)) {
    return "";
  }
  return `${clean}.`;
}

export function splitSentences(text: string): string[] {
  const flattened = flattenBulletClauses(text);
  const parts = flattened.split(/(?<=[.!?])\s+|\n+/);
  const sentences: string[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const sentence = ensureSentence(part);
    if (sentence.length < 40 || sentence.length > 420) continue;
    if (/this guide is also available|cookies on gov\.uk|print this page|related content|skip to main/i.test(sentence)) {
      continue;
    }
    const key = sentence.toLowerCase().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    sentences.push(sentence);
  }

  return sentences;
}

export function excerptFrom(text: string, max = 240): string {
  const clean = flattenBulletClauses(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sliced = clean.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 80 ? lastSpace : max)}…`;
}
