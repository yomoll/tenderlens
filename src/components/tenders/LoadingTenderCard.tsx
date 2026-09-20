export function LoadingTenderCard() {
  return (
    <div className="card animate-pulse p-5" aria-hidden="true">
      <div className="h-4 w-20 rounded bg-navy-soft" />
      <div className="mt-3 h-6 w-4/5 rounded bg-navy-soft" />
      <div className="mt-2 h-4 w-1/3 rounded bg-navy-soft" />
      <div className="mt-4 h-16 rounded bg-navy-soft" />
      <div className="mt-4 flex gap-3">
        <div className="h-4 w-24 rounded bg-navy-soft" />
        <div className="h-4 w-24 rounded bg-navy-soft" />
      </div>
    </div>
  );
}
