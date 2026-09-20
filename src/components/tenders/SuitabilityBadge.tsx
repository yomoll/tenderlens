export function SuitabilityBadge({ kind }: { kind: "sme" | "vcse" }) {
  return (
    <span className="inline-flex rounded px-2 py-0.5 text-xs font-semibold bg-navy-soft text-navy">
      {kind === "sme" ? "SME suitable" : "VCSE suitable"}
    </span>
  );
}
