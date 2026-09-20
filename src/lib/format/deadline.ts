export type DeadlineUrgency = "closed" | "today" | "tomorrow" | "soon" | "open" | "unknown";

export type DeadlineInfo = {
  label: string;
  exact: string;
  remainingLabel?: string;
  urgency: DeadlineUrgency;
  closed: boolean;
  daysRemaining?: number;
};

function validDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatExactDateTime(value?: string, timeZone?: string): string | undefined {
  const date = validDate(value);
  if (!date) return undefined;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatExactDate(value?: string, timeZone?: string): string | undefined {
  const date = validDate(value);
  if (!date) return undefined;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(date);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function describeDeadline(value?: string, now = new Date()): DeadlineInfo | null {
  const date = validDate(value);
  if (!date) return null;

  const exact = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

  const ms = date.getTime() - now.getTime();
  const closed = ms < 0;
  const dayMs = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil(ms / dayMs);

  if (closed) {
    const daysAgo = Math.max(1, Math.ceil(Math.abs(ms) / dayMs));
    return {
      label: daysAgo === 1 ? "Closed yesterday" : `Closed ${daysAgo} days ago`,
      exact,
      remainingLabel: "Closed",
      urgency: "closed",
      closed: true,
      daysRemaining: -daysAgo,
    };
  }

  const hours = ms / (60 * 60 * 1000);
  if (hours <= 24 && startOfDay(date).getTime() === startOfDay(now).getTime()) {
    return {
      label: "Closes today",
      exact,
      remainingLabel: "Closes today",
      urgency: "today",
      closed: false,
      daysRemaining: 0,
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (startOfDay(date).getTime() === startOfDay(tomorrow).getTime()) {
    return {
      label: "Closes tomorrow",
      exact,
      remainingLabel: "Closes tomorrow",
      urgency: "tomorrow",
      closed: false,
      daysRemaining: 1,
    };
  }

  const urgency: DeadlineUrgency = daysRemaining <= 7 ? "soon" : "open";
  const remainingLabel = daysRemaining === 1 ? "1 day left" : `${daysRemaining} days left`;

  return {
    label: daysRemaining === 1 ? "1 day remaining" : `${daysRemaining} days remaining`,
    exact,
    remainingLabel,
    urgency,
    closed: false,
    daysRemaining,
  };
}

export function isoDaysFromNow(days: number, now = new Date()): string {
  const date = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}
