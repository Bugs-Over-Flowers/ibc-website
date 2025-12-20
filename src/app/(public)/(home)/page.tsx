import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import FacebookCTASection from "./_components/FacebookRedirect";
import { FeaturedEventsHero } from "./_components/FeaturedEventsHero";
import FeaturedEventsSection from "./_components/FeaturedEventsSection";
import { MembershipCTA } from "./_components/MembershipCTA";

function HeroSkeleton() {
  return <Skeleton className="h-screen max-h-[950px] min-h-[700px] w-full" />;
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <FeaturedEventsHero />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedEventsSection />
      </Suspense>
      <FacebookCTASection />
      <MembershipCTA />
    </>
  );
}
