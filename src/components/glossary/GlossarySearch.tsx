"use client";

import { useMemo, useState } from "react";
import { GLOSSARY } from "@/lib/glossary";

export function GlossarySearch() {
  const [query, setQuery] = useState("");
  const terms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return GLOSSARY;
    return GLOSSARY.filter((item) => `${item.term} ${item.definition}`.toLowerCase().includes(needle));
  }, [query]);

  return (
    <div>
      <label htmlFor="glossary-search" className="text-sm font-semibold">
        Search the glossary
      </label>
      <input
        id="glossary-search"
        className="mt-2 h-12 w-full max-w-lg rounded-md border border-line bg-surface px-3"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try CPV, SME, framework…"
      />
      <div className="mt-8 grid gap-6">
        {terms.map((item) => (
          <article key={item.id} id={item.id} className="border-b border-line pb-6">
            <h2 className="text-xl font-semibold">{item.term}</h2>
            <p className="mt-2 max-w-3xl text-muted">{item.definition}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
