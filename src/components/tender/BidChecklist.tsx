"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { buildChecklist } from "@/lib/checklist";
import type { Tender } from "@/lib/procurement/types";
import { loadChecklistState, saveChecklistState } from "@/lib/storage/saved";

export function BidChecklist({ tender }: { tender: Tender }) {
  const items = buildChecklist(tender);
  const [state, setState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setState(loadChecklistState(tender.id));
  }, [tender.id]);

  function toggle(id: string) {
    const next = { ...state, [id]: !state[id] };
    setState(next);
    saveChecklistState(tender.id, next);
    trackEvent("checklist_updated", { id: tender.id });
  }

  return (
    <section className="card p-6">
      <h2 className="text-xl font-semibold">Bid preparation checklist</h2>
      <p className="mt-2 text-sm text-muted">
        Items marked as a tender requirement come from the published notice. Suggested steps are preparation help, not mandatory
        requirements.
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-md border border-line p-3">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={Boolean(state[item.id])}
                onChange={() => toggle(item.id)}
              />
              <span>
                <span className="block font-medium">{item.label}</span>
                <span className="mt-1 inline-flex rounded bg-navy-soft px-2 py-0.5 text-xs font-semibold">
                  {item.kind === "requirement" ? "Tender requirement" : "Suggested preparation step"}
                </span>
                {item.source ? <span className="mt-1 block text-xs text-muted">{item.source}</span> : null}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
