import type { TenderExplanation } from "@/lib/ai/schema";

export function AISummary({
  explanation,
  mode,
}: {
  explanation: TenderExplanation;
  mode: "ai" | "fallback";
}) {
  return (
    <section className="rounded-[12px] border border-accent/30 bg-navy-soft/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">TenderLens Summary</h2>
        <span className="rounded bg-surface px-2 py-1 text-xs font-semibold text-navy">AI-assisted explanation</span>
      </div>
      <p className="mt-2 text-sm text-muted">
        {mode === "ai"
          ? "This explanation is generated from the official notice fields only. It is not legal or procurement advice."
          : "No AI provider is configured, so this explanation is built directly from official notice fields. It is not legal or procurement advice."}
      </p>
      <div className="mt-6 space-y-5">
        <Block title="What they need">{explanation.overview}</Block>
        <Block title="Who this may suit">{explanation.suitableFor}</Block>
        <List title="Key requirements" items={explanation.requirements} />
        <List title="Important dates" items={explanation.keyDates} />
        <Block title="Contract value">{explanation.valueExplanation}</Block>
        <Block title="Location">{explanation.locationExplanation}</Block>
        <List title="What to do next" items={explanation.nextSteps} ordered />
        <List title="Things the notice does not make clear" items={explanation.missingInformation} />
        <List title="Risks to keep in mind" items={explanation.risks} />
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function List({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <div>
      <h3 className="text-base font-semibold">{title}</h3>
      <ListTag className={`mt-1 space-y-1 text-sm ${ordered ? "list-decimal pl-5" : "list-disc pl-5"}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    </div>
  );
}
