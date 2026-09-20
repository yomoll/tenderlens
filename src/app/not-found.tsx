import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-muted">That page is not part of TenderLens. Try search, or open Find a Tender directly.</p>
      <Link href="/search" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-cta px-4 font-semibold text-cta-ink">
        Search tenders
      </Link>
    </main>
  );
}
