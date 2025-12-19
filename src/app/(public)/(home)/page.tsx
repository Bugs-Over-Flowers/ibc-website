import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedEventsHero } from "./_components/FeaturedEventsHero";

function HeroSkeleton() {
  return <Skeleton className="h-screen max-h-[950px] min-h-[700px] w-full" />;
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
