import { LoadingTenderCard } from "@/components/tenders/LoadingTenderCard";

export default function SearchLoading() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm text-muted">Searching official procurement notices…</p>
      <div className="mt-6 grid gap-4">
        <LoadingTenderCard />
        <LoadingTenderCard />
        <LoadingTenderCard />
      </div>
    </main>
  );
}
