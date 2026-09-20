import { formatValueRange } from "../format/currency";
import { formatExactDateTime } from "../format/deadline";
import { MISSING_NOTICE_TEXT, type Tender } from "../procurement/types";
import type { FitProfile, FitResult, TenderExplanation } from "./schema";

export function fallbackExplanation(tender: Tender): TenderExplanation {
  const missing: string[] = [];
  if (!tender.description) missing.push("A detailed specification is not included in this notice summary.");
  if (!tender.value) missing.push("Contract value is not specified in the published notice.");
  if (!tender.deadline && tender.status !== "awarded") missing.push("A closing date is not specified in the published notice.");
  if (!tender.locations?.length) missing.push("Delivery location is not specified in the published notice.");
  if (tender.suitableForSME === undefined) missing.push("SME suitability is not specified in the published notice.");
  if (tender.suitableForVCSE === undefined) missing.push("VCSE suitability is not specified in the published notice.");

  const requirements: string[] = [];
  if (tender.selectionCriteria?.length) requirements.push(...tender.selectionCriteria);
  if (tender.procedureType) requirements.push(`Procedure type stated: ${tender.procedureType}.`);
  if (tender.lots?.length) requirements.push(`Lots described in the notice: ${tender.lots.slice(0, 4).join("; ")}.`);
  if (tender.suitableForSME === true) requirements.push("The notice states this opportunity is suitable for SMEs.");
  if (tender.suitableForVCSE === true) requirements.push("The notice states this opportunity is suitable for VCSEs.");
  if (tender.documents?.length) {
    requirements.push(`The notice references ${tender.documents.length} supporting document or link${tender.documents.length === 1 ? "" : "s"}.`);
  }
  if (!requirements.length) requirements.push(MISSING_NOTICE_TEXT);

  const keyDates: string[] = [];
  if (tender.publishedAt) keyDates.push(`Published: ${formatExactDateTime(tender.publishedAt)}.`);
  if (tender.updatedAt && tender.updatedAt !== tender.publishedAt) {
    keyDates.push(`Updated: ${formatExactDateTime(tender.updatedAt)}.`);
  }
  if (tender.deadline) keyDates.push(`Closing date: ${formatExactDateTime(tender.deadline)}.`);
  if (tender.contractStart) keyDates.push(`Contract start: ${formatExactDateTime(tender.contractStart)}.`);
  if (tender.contractEnd) keyDates.push(`Contract end: ${formatExactDateTime(tender.contractEnd)}.`);
  if (!keyDates.length) keyDates.push(MISSING_NOTICE_TEXT);

  const suitableBits: string[] = [];
  if (tender.suitableForSME === true) suitableBits.push("organisations the buyer has marked as SME-suitable");
  if (tender.suitableForVCSE === true) suitableBits.push("voluntary, community or social enterprises where that flag is present");
  if (tender.category) suitableBits.push(`suppliers working in ${tender.category.toLowerCase()}`);
  if (tender.locations?.length) suitableBits.push(`organisations able to deliver in ${tender.locations.join(", ")}`);

  return {
    overview: tender.description
      ? `${tender.buyer.name} is seeking "${tender.title}". The published notice describes the requirement in the official description below. This explanation only restates fields present in that notice.`
      : `${tender.buyer.name} published "${tender.title}". A longer description is not included in this notice summary.`,
    suitableFor: suitableBits.length
      ? `Based only on stated fields, this may be relevant to ${suitableBits.join("; ")}. This is not an eligibility decision.`
      : "The notice does not give enough supplier-profile information to describe who it may suit beyond reading the official documents.",
    requirements,
    nextSteps: [
      "Read the official notice.",
      "Confirm your organisation meets the stated requirements.",
      "Review the procurement documents.",
      "Note any clarification-question deadline if one is stated.",
      "Prepare the required submission material.",
    ],
    risks: [
      "TenderLens has not read unpublished documents. Mandatory requirements may sit in attachments.",
      "Do not treat this summary as legal, commercial or eligibility advice.",
    ],
    missingInformation: missing.length ? missing : ["No obvious summary fields are missing, but full requirements may still sit in attachments."],
    keyDates,
    valueExplanation: formatValueRange(tender.value) || MISSING_NOTICE_TEXT,
    locationExplanation: tender.locations?.length ? tender.locations.join(", ") : MISSING_NOTICE_TEXT,
  };
}

export function fallbackFit(tender: Tender, profile: FitProfile): FitResult {
  const alignment: string[] = [];
  const checks: string[] = [];
  const questions: string[] = [];
  const outside = false;

  if (profile.serviceArea && tender.category) {
    const area = profile.serviceArea.toLowerCase();
    const category = tender.category.toLowerCase();
    if (category.includes(area) || area.includes(category.split(" ")[0] || "")) {
      alignment.push(`Your service area (${profile.serviceArea}) overlaps the notice category (${tender.category}).`);
    } else {
      checks.push(`The notice category is ${tender.category}. Check that this matches ${profile.serviceArea}.`);
    }
  }

  if (tender.suitableForSME === true && (profile.organisationType === "sme" || profile.organisationType === "sole-trader")) {
    alignment.push("The notice states the opportunity is suitable for SMEs.");
  }
  if (tender.suitableForVCSE === true && (profile.organisationType === "charity" || profile.organisationType === "cic")) {
    alignment.push("The notice states the opportunity is suitable for VCSEs.");
  }
  if (profile.organisationType === "large" && tender.suitableForSME === true && tender.suitableForVCSE !== true) {
    checks.push("The notice is marked suitable for SMEs. That does not automatically exclude larger suppliers, but you should confirm in the official documents.");
  }

  if (profile.location && tender.locations?.length) {
    const loc = profile.location.toLowerCase();
    const match = tender.locations.some((item) => item.toLowerCase().includes(loc) || loc.includes(item.toLowerCase()));
    if (match) alignment.push(`Your location (${profile.location}) appears compatible with ${tender.locations.join(", ")}.`);
    else checks.push(`Delivery location in the notice: ${tender.locations.join(", ")}. Confirm you can deliver there.`);
  }

  if (!tender.value) checks.push("Contract value is not specified in the published notice.");
  if (!tender.deadline) checks.push("A closing date is not specified in this notice summary.");
  if (tender.selectionCriteria?.length) {
    checks.push("Selection criteria are stated in the notice and should be checked line by line.");
  }

  questions.push("Do you meet any stated turnover, insurance or accreditation requirements in the official documents?");
  questions.push("Can you deliver in the specified location?");
  questions.push("Can you submit by the stated deadline?");
  if (profile.turnover && tender.value?.min && /under|below|less/.test(profile.turnover) && tender.value.min > 500000) {
    checks.push("The stated contract value is high relative to the turnover range you entered. Check any official financial thresholds.");
  }

  const hasConflict = outside;
  const thin = alignment.length === 0 && !tender.description;
  const verdict: FitResult["verdict"] = hasConflict
    ? "likely-outside"
    : thin
      ? "insufficient-data"
      : checks.length > alignment.length
        ? "review-carefully"
        : "worth-exploring";

  const labels: Record<FitResult["verdict"], string> = {
    "worth-exploring": "Worth exploring",
    "review-carefully": "Review carefully",
    "likely-outside": "Likely outside your current profile",
    "insufficient-data": "Not enough official data to judge fit",
  };

  return {
    verdict,
    verdictLabel: labels[verdict],
    alignment: alignment.length ? alignment : ["No strong field-level matches could be made from the published summary alone."],
    checks: checks.length ? checks : ["Read the official documents for mandatory requirements that are not in this summary."],
    questions,
    suggestedNextStep: "Open the official notice, then decide whether to download the full procurement documents.",
    disclaimer:
      "This is an informational comparison, not a determination of procurement eligibility. Always review the official tender documents.",
  };
}
