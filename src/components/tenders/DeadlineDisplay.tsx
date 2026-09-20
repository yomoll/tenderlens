"use client";

import { describeDeadline, formatExactDateTime } from "@/lib/format/deadline";

export function DeadlineDisplay({ value, compact = false }: { value?: string; compact?: boolean }) {
  const info = describeDeadline(value);
  if (!info) return <span className="text-muted">Deadline not specified</span>;

  const colour =
    info.urgency === "closed"
      ? "text-danger"
      : info.urgency === "today" || info.urgency === "tomorrow" || info.urgency === "soon"
        ? "text-warning"
        : "text-ink";

  if (compact) {
    return (
      <span className={colour} title={info.exact}>
        {info.remainingLabel}
      </span>
    );
  }

  return (
    <span className="block">
      <span className={`font-medium ${colour}`}>{info.label}</span>
      <span className="block text-sm text-muted">Official close: {formatExactDateTime(value)}</span>
    </span>
  );
}
