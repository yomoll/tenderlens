import { asRecord, asString, asStringArray } from "../format/text";

export type TenderExplanation = {
  overview: string;
  suitableFor: string;
  requirements: string[];
  nextSteps: string[];
  risks: string[];
  missingInformation: string[];
  keyDates: string[];
  valueExplanation: string;
  locationExplanation: string;
};

const STRING_LISTS: Array<keyof TenderExplanation> = [
  "requirements",
  "nextSteps",
  "risks",
  "missingInformation",
  "keyDates",
];

function cleanList(values: unknown, max = 8): string[] {
  return asStringArray(values)
    .map((item) => item.slice(0, 400))
    .filter(Boolean)
    .slice(0, max);
}

export function validateExplanation(input: unknown): TenderExplanation | null {
  const record = asRecord(input);
  if (!record) return null;
  const overview = asString(record.overview);
  const suitableFor = asString(record.suitableFor);
  if (!overview || !suitableFor) return null;

  const result: TenderExplanation = {
    overview: overview.slice(0, 1200),
    suitableFor: suitableFor.slice(0, 800),
    requirements: cleanList(record.requirements),
    nextSteps: cleanList(record.nextSteps),
    risks: cleanList(record.risks),
    missingInformation: cleanList(record.missingInformation),
    keyDates: cleanList(record.keyDates),
    valueExplanation: (asString(record.valueExplanation) || "Not specified in the published notice.").slice(0, 400),
    locationExplanation: (asString(record.locationExplanation) || "Not specified in the published notice.").slice(0, 400),
  };

  for (const key of STRING_LISTS) {
    if (!Array.isArray(result[key])) return null;
  }
  return result;
}

export type FitProfile = {
  organisationType: "sme" | "sole-trader" | "charity" | "cic" | "large" | "other";
  serviceArea: string;
  location: string;
  size?: string;
  experience?: string;
  turnover?: string;
  description?: string;
};

export type FitResult = {
  verdict: "worth-exploring" | "review-carefully" | "likely-outside" | "insufficient-data";
  verdictLabel: string;
  alignment: string[];
  checks: string[];
  questions: string[];
  suggestedNextStep: string;
  disclaimer: string;
};

export function validateFitResult(input: unknown): FitResult | null {
  const record = asRecord(input);
  if (!record) return null;
  const verdictRaw = asString(record.verdict);
  const allowed = new Set(["worth-exploring", "review-carefully", "likely-outside", "insufficient-data"]);
  if (!verdictRaw || !allowed.has(verdictRaw)) return null;
  const verdict = verdictRaw as FitResult["verdict"];
  const labels: Record<FitResult["verdict"], string> = {
    "worth-exploring": "Worth exploring",
    "review-carefully": "Review carefully",
    "likely-outside": "Likely outside your current profile",
    "insufficient-data": "Not enough official data to judge fit",
  };
  return {
    verdict,
    verdictLabel: labels[verdict],
    alignment: cleanList(record.alignment, 6),
    checks: cleanList(record.checks, 6),
    questions: cleanList(record.questions, 6),
    suggestedNextStep: (asString(record.suggestedNextStep) || "Read the official notice before deciding whether to proceed.").slice(0, 400),
    disclaimer:
      "This is an informational comparison, not a determination of procurement eligibility. Always review the official tender documents.",
  };
}
