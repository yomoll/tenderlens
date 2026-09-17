"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadSavedAnswers, removeSavedAnswer } from "@/lib/storage";
import type { AskAnswer } from "@/lib/types";

export function SavedList() {
  const [items, setItems] = useState<AskAnswer[]>([]);

  useEffect(() => {
    setItems(loadSavedAnswers());
  }, []);

  if (items.length === 0) {
    return (
      <p className="mt-8 max-w-[50ch] text-muted">
        You have not saved an answer yet. Ask a question, then choose Save.
      </p>
    );
  }

  return (
    <ul className="mt-8 divide-y divide-line border border-line bg-surface">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium">{item.question}</p>
            <p className="mt-1 text-sm text-muted">{item.interpretation}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/?q=${encodeURIComponent(item.question)}`}
              className="bg-cta px-3 py-2 text-sm font-bold text-on-cta hover:bg-cta-hover"
            >
              Open
            </Link>
            <button
              type="button"
              className="border border-ink px-3 py-2 text-sm"
              onClick={() => setItems(removeSavedAnswer(item.id))}
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
