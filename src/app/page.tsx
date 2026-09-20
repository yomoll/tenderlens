import { Suspense } from "react";
import { HomeHero, HomeRest } from "@/components/home/HomeHero";
import { LatestOpportunities, LatestOpportunitiesFallback } from "@/components/home/LatestOpportunities";
import { INDEPENDENCE_DISCLAIMER } from "@/lib/site";

export const revalidate = 600;

export default function HomePage() {
  return (
    <main id="main">
      <HomeHero />
      <Suspense fallback={<LatestOpportunitiesFallback />}>
        <LatestOpportunities />
      </Suspense>
      <HomeRest />
      <p className="sr-only">{INDEPENDENCE_DISCLAIMER}</p>
    </main>
  );
}

