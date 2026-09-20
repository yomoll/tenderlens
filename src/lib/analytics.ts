export type AnalyticsEvent =
  | "search_performed"
  | "tender_opened"
  | "tender_saved"
  | "tender_unsaved"
  | "official_source_clicked"
  | "fit_checker_started"
  | "fit_checker_completed"
  | "share_clicked"
  | "checklist_updated";

export function trackEvent(event: AnalyticsEvent, detail?: Record<string, string | number | boolean | undefined>): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tenderlens:event", { detail: { event, ...detail, at: Date.now() } }));
}
