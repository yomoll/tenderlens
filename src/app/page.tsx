import { Suspense } from "react";
import { AskExperience } from "@/components/AskExperience";

export default function HomePage() {
  return (
    <main id="main">
      <Suspense fallback={<div className="mx-auto max-w-[40rem] px-4 py-12">Loading the question form…</div>}>
        <AskExperience />
      </Suspense>
    </main>
  );
}
