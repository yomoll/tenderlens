"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatValueRange } from "@/lib/format/currency";
import { tenderPath } from "@/lib/procurement/ids";
import { loadCompareIds, loadSavedTenders, removeSavedTender, toggleCompareId, type SavedTender } from "@/lib/storage/saved";
import { DeadlineDisplay } from "@/components/tenders/DeadlineDisplay";
import { EmptyState } from "@/components/ui/EmptyState";

export function SavedExperience() {
  const [items, setItems] = useState<SavedTender[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadSavedTenders());
    setCompare(loadCompareIds());
    setReady(true);
  }, []);

  if (!ready) {
    return <p className="text-muted">Loading saved opportunities…</p>;
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No saved opportunities yet."
        body="Save a tender from search or a notice page. Saved tenders stay on this device."
      />
    );
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Saved on this device. Account syncing is coming later.
      </p>
      {compare.length ? (
        <Link href="/compare" className="mt-3 inline-flex min-h-11 items-center font-semibold text-accent">
          Compare {compare.length} selected
        </Link>
      ) : null}
      <ul className="mt-6 grid gap-4">
        {items.map((item) => (
          <li key={item.id} className="card p-5">
            <h2 className="text-lg font-semibold">
              <Link href={tenderPath(item.id)}>{item.title}</Link>
            </h2>
            <p className="text-sm text-muted">{item.buyerName}</p>
            <p className="mt-2 text-sm">{formatValueRange(item.value) || "Value not specified"}</p>
            <p className="text-sm">
              <DeadlineDisplay value={item.deadline} compact />
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={tenderPath(item.id)} className="font-semibold text-accent">
                Open
              </Link>
              <a href={item.sourceUrl} className="font-semibold text-accent" rel="noreferrer">
                Official source
              </a>
              <button
                type="button"
                className="font-semibold"
                onClick={() => setCompare(toggleCompareId(item.id))}
              >
                {compare.includes(item.id) ? "Remove from compare" : "Add to compare"}
              </button>
              <button
                type="button"
                className="font-semibold text-danger"
                onClick={() => setItems(removeSavedTender(item.id))}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
