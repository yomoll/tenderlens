import type { Tender } from "./procurement/types";

export type ChecklistItem = {
  id: string;
  label: string;
  kind: "requirement" | "suggestion";
  source?: string;
};

export function buildChecklist(tender: Tender): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: "read-notice",
      label: "Read the official notice in full",
      kind: "requirement",
      source: "Always required before acting on a TenderLens summary.",
    },
  ];

  if (tender.documents?.length) {
    items.push({
      id: "download-docs",
      label: "Download and review the procurement documents linked from the notice",
      kind: "requirement",
      source: "The published notice references supporting documents or links.",
    });
  } else {
    items.push({
      id: "find-docs",
      label: "Check the official notice for procurement documents",
      kind: "suggestion",
    });
  }

  if (tender.selectionCriteria?.length) {
    items.push({
      id: "selection",
      label: "Work through the stated selection criteria",
      kind: "requirement",
      source: "Taken from selection criteria in the published notice.",
    });
  } else {
    items.push({
      id: "eligibility",
      label: "Confirm eligibility against the official documents",
      kind: "suggestion",
    });
  }

  if (tender.deadline) {
    items.push({
      id: "deadline",
      label: "Note the submission deadline and work backwards from it",
      kind: "requirement",
      source: "Closing date stated in the published notice.",
    });
  }

  if (tender.clarificationDeadline) {
    items.push({
      id: "clarification",
      label: "Note the clarification-question deadline",
      kind: "requirement",
      source: "Clarification date stated in the published notice.",
    });
  } else {
    items.push({
      id: "clarification-check",
      label: "Check whether a clarification-question deadline is stated in the documents",
      kind: "suggestion",
    });
  }

  items.push(
    { id: "policies", label: "Identify required policies if the documents ask for them", kind: "suggestion" },
    { id: "certs", label: "Identify certifications if the documents ask for them", kind: "suggestion" },
    { id: "case-studies", label: "Prepare relevant case studies or evidence", kind: "suggestion" },
    { id: "insurance", label: "Review insurance requirements in the official documents", kind: "suggestion" },
    { id: "pricing", label: "Confirm the pricing format in the official documents", kind: "suggestion" },
  );

  if (tender.lots?.length) {
    items.push({
      id: "lots",
      label: "Decide which lot or lots, if any, you would bid for",
      kind: "requirement",
      source: "Lots are described in the published notice.",
    });
  }

  return items;
}
