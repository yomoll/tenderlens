"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { Tender } from "@/lib/procurement/types";
import { isTenderSaved, removeSavedTender, saveTender } from "@/lib/storage/saved";

export function SaveTenderButton({ tender, compact = false }: { tender: Tender; compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isTenderSaved(tender.id));
  }, [tender.id]);

  function toggle() {
    if (saved) {
      removeSavedTender(tender.id);
      setSaved(false);
      trackEvent("tender_unsaved", { id: tender.id });
    } else {
      saveTender(tender);
      setSaved(true);
      trackEvent("tender_saved", { id: tender.id });
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-navy-soft ${compact ? "min-w-11 justify-center px-0" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved tenders" : "Save tender"}
    >
      {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      {compact ? null : saved ? "Saved" : "Save"}
    </button>
  );
}
