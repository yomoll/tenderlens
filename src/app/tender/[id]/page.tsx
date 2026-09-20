import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateTenderExplanation } from "@/lib/ai/provider";
import { parseTenderId } from "@/lib/procurement/ids";
import { getTender } from "@/lib/procurement/source";
import { TenderDetail } from "@/components/tender/TenderDetail";
import { ErrorState } from "@/components/ui/EmptyState";
import { userSafeUpstreamMessage } from "@/lib/http";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tender = parseTenderId(id) ? await getTender(id).catch(() => null) : null;
  if (!tender) {
    return { title: "Tender not found", robots: { index: false, follow: false } };
  }
  return {
    title: tender.title,
    description: `${tender.buyer.name}. Official ${tender.sourceLabel} notice explained by TenderLens.`,
    alternates: { canonical: `/tender/${encodeURIComponent(tender.id)}` },
    openGraph: {
      title: tender.title,
      description: `${tender.buyer.name} | TenderLens`,
      url: `${getSiteUrl()}/tender/${encodeURIComponent(tender.id)}`,
    },
  };
}

export default async function TenderPage({ params }: Props) {
  const { id } = await params;
  if (!parseTenderId(id)) notFound();

  try {
    const tender = await getTender(id);
    if (!tender) notFound();
    const { explanation, mode } = await generateTenderExplanation(tender);
    return (
      <main id="main">
        <TenderDetail tender={tender} explanation={explanation} mode={mode} />
      </main>
    );
  } catch (error) {
    return (
      <main id="main" className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={userSafeUpstreamMessage(error)} />
      </main>
    );
  }
}
