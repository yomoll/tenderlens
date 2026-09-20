"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { formatValueRange } from "@/lib/format/currency";
import { formatExactDate } from "@/lib/format/deadline";
import { getSiteUrl } from "@/lib/site";
import type { Tender } from "@/lib/procurement/types";
import { tenderPath } from "@/lib/procurement/ids";

export function shareTextFor(tender: Tender): string {
  const value = formatValueRange(tender.value);
  const closes = formatExactDate(tender.deadline);
  const bits = [tender.title, value, closes ? `closes ${closes}` : undefined, "TenderLens"].filter(Boolean);
  return bits.join(" - ");
}

export function ShareButton({ tender, compact = false }: { tender: Tender; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${typeof window !== "undefined" ? window.location.origin : getSiteUrl()}${tenderPath(tender.id)}`;
    const text = shareTextFor(tender);
    trackEvent("share_clicked", { id: tender.id });
    if (navigator.share) {
      try {
        await navigator.share({ title: tender.title, text, url });
        return;
      } catch {
        // User cancelled or share failed; fall through to copy.
      }
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-navy-soft ${compact ? "min-w-11 justify-center px-0" : ""}`}
      aria-label="Share tender"
    >
      <Share2 size={18} />
      {compact ? null : copied ? "Link copied" : "Share"}
    </button>
  );
}
