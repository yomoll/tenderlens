import type { TenderStatus } from "@/lib/procurement/types";

const LABELS: Record<TenderStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-positive-soft text-positive" },
  planning: { label: "Planning", className: "bg-navy-soft text-navy" },
  awarded: { label: "Awarded", className: "bg-warning-soft text-warning" },
  closed: { label: "Closed", className: "bg-danger-soft text-danger" },
  unknown: { label: "Status not stated", className: "bg-navy-soft text-muted" },
};

export function TenderStatusBadge({ status }: { status: TenderStatus }) {
  const item = LABELS[status] ?? LABELS.unknown;
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${item.className}`}>{item.label}</span>
  );
}
