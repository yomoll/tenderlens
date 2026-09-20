"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useId, useState } from "react";

export function SearchBar({
  initialQuery = "",
  sticky = false,
  autoFocus = false,
}: {
  initialQuery?: string;
  sticky?: boolean;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const inputId = useId();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const nextQuery = params.toString();
    router.push(`/search${nextQuery ? `?${nextQuery}` : ""}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex gap-2 rounded-[12px] border border-line bg-surface p-1.5 shadow-[var(--shadow)] ${sticky ? "sticky top-[4.5rem] z-30" : ""}`}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        Search tenders
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus={autoFocus}
          placeholder='Try "digital marketing", "supported living", "web development"…'
          className="h-12 w-full rounded-md bg-transparent pl-10 pr-3 text-base outline-none"
        />
      </div>
      <button type="submit" className="min-h-12 shrink-0 rounded-md bg-cta px-4 text-sm font-semibold text-cta-ink hover:bg-accent-hover">
        Search tenders
      </button>
    </form>
  );
}
