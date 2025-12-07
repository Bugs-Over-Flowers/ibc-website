import { Suspense } from "react";
import { FeaturedEventsHero } from "./components/FeaturedEventsHero";

function HeroSkeleton() {
  return (
    <div className="h-screen min-h-[700px] max-h-[950px] w-full animate-pulse bg-muted" />
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<HeroSkeleton />}>
        <FeaturedEventsHero />
      </Suspense>
    </main>
  );
}
