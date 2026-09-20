const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number, currency = "GBP"): string {
  if (!Number.isFinite(amount)) return "";
  if (currency === "GBP") return GBP.format(amount);
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-GB")} ${currency}`;
  }
}

export function formatValueRange(value?: { min?: number; max?: number; currency?: string }): string | undefined {
  if (!value) return undefined;
  const currency = value.currency || "GBP";
  const min = typeof value.min === "number" && value.min > 0 ? value.min : undefined;
  const max = typeof value.max === "number" && value.max > 0 ? value.max : undefined;
  if (min === undefined && max === undefined) return undefined;
  if (min !== undefined && max !== undefined) {
    if (min === max) return formatMoney(min, currency);
    return `${formatMoney(min, currency)}-${formatMoney(max, currency)}`;
  }
  if (min !== undefined) return `From ${formatMoney(min, currency)}`;
  return `Up to ${formatMoney(max!, currency)}`;
}

export function numericSortValue(value?: { min?: number; max?: number }): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  if (typeof value.max === "number" && value.max > 0) return value.max;
  if (typeof value.min === "number" && value.min > 0) return value.min;
  return Number.NEGATIVE_INFINITY;
}

export const VALUE_PRESETS = [
  { id: "under-25k", label: "Under £25k", min: undefined, max: 25000 },
  { id: "25k-100k", label: "£25k-£100k", min: 25000, max: 100000 },
  { id: "100k-500k", label: "£100k-£500k", min: 100000, max: 500000 },
  { id: "500k-1m", label: "£500k-£1m", min: 500000, max: 1000000 },
  { id: "1m-plus", label: "£1m+", min: 1000000, max: undefined },
] as const;
