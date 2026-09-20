"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/procurement/categories";
import { VALUE_PRESETS } from "@/lib/format/currency";
import type { SearchParams } from "@/lib/procurement/types";

type Props = {
  value: SearchParams;
  onChange: (next: SearchParams) => void;
  idPrefix?: string;
};

export function SearchFilters({ value, onChange, idPrefix = "filter" }: Props) {
  const [buyerDraft, setBuyerDraft] = useState(value.buyer ?? "");
  const [minDraft, setMinDraft] = useState(value.minValue?.toString() ?? "");
  const [maxDraft, setMaxDraft] = useState(value.maxValue?.toString() ?? "");

  useEffect(() => {
    setBuyerDraft(value.buyer ?? "");
  }, [value.buyer]);

  useEffect(() => {
    setMinDraft(value.minValue?.toString() ?? "");
    setMaxDraft(value.maxValue?.toString() ?? "");
  }, [value.minValue, value.maxValue]);

  function set<K extends keyof SearchParams>(key: K, next: SearchParams[K]) {
    onChange({ ...value, [key]: next, cursor: undefined });
  }

  function commitValues() {
    const minValue = minDraft ? Number(minDraft.replace(/,/g, "")) : undefined;
    const maxValue = maxDraft ? Number(maxDraft.replace(/,/g, "")) : undefined;
    const nextMin = Number.isFinite(minValue) ? minValue : undefined;
    const nextMax = Number.isFinite(maxValue) ? maxValue : undefined;
    if (nextMin === value.minValue && nextMax === value.maxValue) return;
    onChange({ ...value, minValue: nextMin, maxValue: nextMax, cursor: undefined });
  }

  function commitBuyer() {
    const nextBuyer = buyerDraft.trim() || undefined;
    if (nextBuyer === (value.buyer || undefined)) return;
    onChange({ ...value, buyer: nextBuyer, cursor: undefined });
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold">Opportunity status</legend>
        <div className="mt-2 grid gap-2">
          {[
            { id: "open", label: "Open" },
            { id: "planning", label: "Upcoming / planning" },
            { id: "awarded", label: "Awarded" },
          ].map((option) => (
            <label key={option.id} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${idPrefix}-status`}
                checked={(value.status ?? "open") === option.id}
                onChange={() => set("status", option.id as SearchParams["status"])}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Contract value</legend>
        <div className="mt-2 grid gap-2">
          {VALUE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`min-h-10 rounded-md border px-3 text-left text-sm ${
                value.minValue === preset.min && value.maxValue === preset.max
                  ? "border-accent bg-navy-soft"
                  : "border-line hover:bg-navy-soft"
              }`}
              onClick={() => onChange({ ...value, minValue: preset.min, maxValue: preset.max, cursor: undefined })}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted" htmlFor={`${idPrefix}-min`}>
              Minimum
            </label>
            <input
              id={`${idPrefix}-min`}
              inputMode="numeric"
              className="mt-1 h-11 w-full rounded-md border border-line bg-surface px-3"
              value={minDraft}
              onChange={(event) => setMinDraft(event.target.value)}
              onBlur={commitValues}
            />
          </div>
          <div>
            <label className="text-xs text-muted" htmlFor={`${idPrefix}-max`}>
              Maximum
            </label>
            <input
              id={`${idPrefix}-max`}
              inputMode="numeric"
              className="mt-1 h-11 w-full rounded-md border border-line bg-surface px-3"
              value={maxDraft}
              onChange={(event) => setMaxDraft(event.target.value)}
              onBlur={commitValues}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Location</legend>
        <div className="mt-2 grid gap-2">
          {[
            ["uk", "UK wide"],
            ["england", "England"],
            ["scotland", "Scotland"],
            ["wales", "Wales"],
            ["northern-ireland", "Northern Ireland"],
          ].map(([id, label]) => (
            <label key={id} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${idPrefix}-region`}
                checked={(value.region ?? "uk") === id}
                onChange={() => set("region", id as SearchParams["region"])}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Organisation suitability</legend>
        <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(value.sme)} onChange={(event) => set("sme", event.target.checked || undefined)} />
          Suitable for SMEs
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(value.vcse)} onChange={(event) => set("vcse", event.target.checked || undefined)} />
          Suitable for VCSEs
        </label>
      </fieldset>

      <div>
        <label className="text-sm font-semibold" htmlFor={`${idPrefix}-category`}>
          Procurement category
        </label>
        <select
          id={`${idPrefix}-category`}
          className="mt-2 h-11 w-full rounded-md border border-line bg-surface px-3"
          value={value.category ?? ""}
          onChange={(event) => set("category", (event.target.value || undefined) as SearchParams["category"])}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Deadline</legend>
        <div className="mt-2 grid gap-2">
          {[
            ["7", "Next 7 days"],
            ["30", "Next 30 days"],
            ["90", "Next 90 days"],
          ].map(([id, label]) => (
            <label key={id} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${idPrefix}-deadline`}
                checked={value.deadlinePreset === id}
                onChange={() => set("deadlinePreset", id as SearchParams["deadlinePreset"])}
              />
              {label}
            </label>
          ))}
          <button type="button" className="text-left text-sm text-accent" onClick={() => set("deadlinePreset", undefined)}>
            Any deadline
          </button>
        </div>
      </fieldset>

      <div>
        <label className="text-sm font-semibold" htmlFor={`${idPrefix}-buyer`}>
          Buyer
        </label>
        <input
          id={`${idPrefix}-buyer`}
          className="mt-2 h-11 w-full rounded-md border border-line bg-surface px-3"
          value={buyerDraft}
          onChange={(event) => setBuyerDraft(event.target.value)}
          onBlur={commitBuyer}
          placeholder="Buyer name"
        />
      </div>
    </div>
  );
}
