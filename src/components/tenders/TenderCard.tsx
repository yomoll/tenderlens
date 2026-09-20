import Link from "next/link";
import { excerpt } from "@/lib/format/text";
import { formatExactDate } from "@/lib/format/deadline";
import { tenderPath } from "@/lib/procurement/ids";
import type { Tender } from "@/lib/procurement/types";
import { DeadlineDisplay } from "./DeadlineDisplay";
import { SaveTenderButton } from "./SaveTenderButton";
import { ShareButton } from "./ShareButton";
import { SourceBadge } from "./SourceBadge";
import { SuitabilityBadge } from "./SuitabilityBadge";
import { TenderStatusBadge } from "./TenderStatusBadge";
import { ValueDisplay } from "./ValueDisplay";

export function TenderCard({ tender, compact = false }: { tender: Tender; compact?: boolean }) {
  return (
    <article className="card flex flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <TenderStatusBadge status={tender.status} />
        {tender.suitableForSME ? <SuitabilityBadge kind="sme" /> : null}
        {tender.suitableForVCSE ? <SuitabilityBadge kind="vcse" /> : null}
        {tender.isFixture ? (
          <span className="rounded bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">Sample data</span>
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">
        <Link href={tenderPath(tender.id)} className="hover:text-accent">
          {tender.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">{tender.buyer.name}</p>
      {compact ? null : <p className="mt-3 text-sm text-muted">{excerpt(tender.description, 180)}</p>}
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Value</dt>
          <dd>
            <ValueDisplay value={tender.value} className="font-medium" />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Deadline</dt>
          <dd>
            <DeadlineDisplay value={tender.deadline} compact />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Location</dt>
          <dd>{tender.locations?.join(", ") || "Not specified"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Published</dt>
          <dd>{formatExactDate(tender.publishedAt) || "Not specified"}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {tender.category ? <span>{tender.category}</span> : null}
          <SourceBadge label={tender.sourceLabel} />
        </div>
        <div className="flex items-center gap-1">
          <SaveTenderButton tender={tender} compact />
          <ShareButton tender={tender} compact />
          <Link
            href={tenderPath(tender.id)}
            className="inline-flex min-h-11 items-center rounded-md bg-cta px-3 text-sm font-semibold text-cta-ink hover:bg-accent-hover"
          >
            View tender
          </Link>
        </div>
      </div>
    </article>
  );
}
