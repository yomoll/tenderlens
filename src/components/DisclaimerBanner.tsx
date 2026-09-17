"use client";

import { Warning } from "@phosphor-icons/react";

export function DisclaimerBanner() {
  return (
    <div className="no-print border-b border-line bg-warn-bg text-warn-ink">
      <p className="mx-auto flex max-w-5xl items-start gap-3 px-4 py-2.5 text-base leading-snug">
        <span className="mt-0.5 inline-flex items-center gap-1 bg-brand px-2 py-0.5 text-sm font-bold text-on-accent">
          <Warning size={14} weight="fill" aria-hidden="true" />
          Independent
        </span>
        <span>
          Not affiliated with GOV.UK. Always check the linked official guidance.
        </span>
      </p>
    </div>
  );
}
