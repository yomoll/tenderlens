"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatValueRange } from "@/lib/format/currency";
import { formatExactDateTime } from "@/lib/format/deadline";
import { tenderPath } from "@/lib/procurement/ids";
import { loadCompareIds, loadSavedTenders, type SavedTender } from "@/lib/storage/saved";

const FIELDS: Array<{ key: string; label: string; value: (item: SavedTender) => string }> = [
  { key: "buyer", label: "Buyer", value: (item) => item.buyerName },
  { key: "value", label: "Value", value: (item) => formatValueRange(item.value) || "Not specified" },
  { key: "location", label: "Location", value: (item) => item.locations?.join(", ") || "Not specified" },
  { key: "deadline", label: "Deadline", value: (item) => formatExactDateTime(item.deadline) || "Not specified" },
  { key: "sme", label: "SME suitability", value: (item) => flag(item.suitableForSME) },
  { key: "vcse", label: "VCSE suitability", value: (item) => flag(item.suitableForVCSE) },
  { key: "sector", label: "Sector", value: (item) => item.category || "Not specified" },
  { key: "stage", label: "Procurement stage", value: (item) => item.status },
  { key: "source", label: "Source", value: (item) => item.sourceLabel },
];

function flag(value?: boolean) {
  if (value === true) return "Yes, according to the notice";
  if (value === false) return "Not marked as suitable";
  return "Not specified";
}

export function CompareExperience() {
  const [items, setItems] = useState<SavedTender[]>([]);

  useEffect(() => {
    const ids = loadCompareIds();
    const saved = loadSavedTenders();
    setItems(saved.filter((item) => ids.includes(item.id)).slice(0, 3));
  }, []);

  if (!items.length) {
    return (
      <p className="text-muted">
        Select up to 3 saved tenders to compare facts. TenderLens does not rank a tender as objectively best.{" "}
        <Link href="/saved" className="font-semibold text-accent">
          Go to saved
        </Link>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="hidden min-w-full border-collapse text-sm md:table">
        <thead>
          <tr>
            <th className="border-b border-line p-3 text-left">Field</th>
            {items.map((item) => (
              <th key={item.id} className="border-b border-line p-3 text-left">
                <Link href={tenderPath(item.id)} className="font-semibold hover:text-accent">
                  {item.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FIELDS.map((field) => (
            <tr key={field.key}>
              <th className="border-b border-line p-3 text-left font-medium text-muted">{field.label}</th>
              {items.map((item) => (
                <td key={item.id} className="border-b border-line p-3">
                  {field.value(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid gap-4 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="card p-5">
            <h2 className="font-semibold">
              <Link href={tenderPath(item.id)}>{item.title}</Link>
            </h2>
            <dl className="mt-3 space-y-2">
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <dt className="text-xs uppercase tracking-wide text-muted">{field.label}</dt>
                  <dd className="text-sm">{field.value(item)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
