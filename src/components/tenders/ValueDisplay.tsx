import { formatValueRange } from "@/lib/format/currency";
import type { TenderValue } from "@/lib/procurement/types";

export function ValueDisplay({ value, className = "" }: { value?: TenderValue; className?: string }) {
  const label = formatValueRange(value);
  return <span className={className}>{label || "Value not specified"}</span>;
}
