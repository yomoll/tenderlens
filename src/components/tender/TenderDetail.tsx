import { ExternalLink } from "lucide-react";
import { formatExactDateTime } from "@/lib/format/deadline";
import { INDEPENDENCE_DISCLAIMER } from "@/lib/site";
import type { TenderExplanation } from "@/lib/ai/schema";
import type { Tender } from "@/lib/procurement/types";
import { DeadlineDisplay } from "@/components/tenders/DeadlineDisplay";
import { SaveTenderButton } from "@/components/tenders/SaveTenderButton";
import { ShareButton } from "@/components/tenders/ShareButton";
import { SourceBadge } from "@/components/tenders/SourceBadge";
import { SuitabilityBadge } from "@/components/tenders/SuitabilityBadge";
import { TenderStatusBadge } from "@/components/tenders/TenderStatusBadge";
import { ValueDisplay } from "@/components/tenders/ValueDisplay";
import { AISummary } from "./AISummary";
import { BidChecklist } from "./BidChecklist";
import { FitChecker } from "./FitChecker";

export function TenderDetail({
  tender,
  explanation,
  mode,
}: {
  tender: Tender;
  explanation: TenderExplanation;
  mode: "ai" | "fallback";
}) {
  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TenderStatusBadge status={tender.status} />
            {tender.suitableForSME ? <SuitabilityBadge kind="sme" /> : null}
            {tender.suitableForVCSE ? <SuitabilityBadge kind="vcse" /> : null}
            {tender.isFixture ? (
              <span className="rounded bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">Sample data</span>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{tender.title}</h1>
          <p className="mt-2 text-muted">{tender.buyer.name}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={tender.sourceUrl}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-cta px-4 font-semibold text-cta-ink hover:bg-accent-hover"
              rel="noreferrer"
            >
              View official tender
              <ExternalLink size={16} />
            </a>
            <SaveTenderButton tender={tender} />
            <ShareButton tender={tender} />
          </div>
          <dl className="mt-6 grid gap-4 rounded-[12px] border border-line bg-surface p-5 sm:grid-cols-2">
            <Item label="Official source" value={<SourceBadge label={tender.sourceLabel} />} />
            <Item label="Published" value={formatExactDateTime(tender.publishedAt) || "Not specified in the published notice."} />
            <Item label="Updated" value={formatExactDateTime(tender.updatedAt) || "Not specified in the published notice."} />
            <Item label="Deadline" value={<DeadlineDisplay value={tender.deadline} />} />
            <Item label="Value" value={<ValueDisplay value={tender.value} />} />
            <Item label="Location" value={tender.locations?.join(", ") || "Not specified in the published notice."} />
            <Item label="Reference / OCID" value={tender.ocid || tender.reference || "Not specified in the published notice."} />
            <Item label="Category" value={tender.category || tender.cpvCodes?.[0]?.description || "Not specified in the published notice."} />
          </dl>
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Official tender information</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
              {tender.description || "Not specified in the published notice."}
            </p>
            {tender.additionalText?.length ? (
              <div className="mt-4 space-y-2 text-sm">
                {tender.additionalText.map((text) => (
                  <p key={text.slice(0, 40)}>{text}</p>
                ))}
              </div>
            ) : null}
            {tender.cpvCodes?.length ? (
              <p className="mt-4 text-sm text-muted">
                CPV: {tender.cpvCodes.map((item) => `${item.code}${item.description ? ` ${item.description}` : ""}`).join("; ")}
              </p>
            ) : null}
          </section>
          <div className="mt-8">
            <AISummary explanation={explanation} mode={mode} />
          </div>
          <div className="mt-8">
            <BidChecklist tender={tender} />
          </div>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <FitChecker tender={tender} />
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">Original notice</h2>
            <p className="mt-2 text-sm text-muted">Always verify against the government source before making commercial decisions.</p>
            <a href={tender.sourceUrl} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent" rel="noreferrer">
              View original notice
            </a>
          </div>
          <p className="text-xs text-muted">{INDEPENDENCE_DISCLAIMER}</p>
        </aside>
      </div>
    </article>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
