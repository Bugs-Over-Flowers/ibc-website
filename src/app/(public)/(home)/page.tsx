import type { Metadata } from "next";
import { Suspense } from "react";
import FeaturedMembersSection from "@/components/FeaturedMembersSection";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicWebsiteContentSection } from "@/server/website-content/queries/getPublicWebsiteContentSection";
import FacebookCTASection from "./_components/FacebookRedirect";
import { FeaturedEventsHero } from "./_components/FeaturedEventsHero";
import FeaturedEventsSection from "./_components/FeaturedEventsSection";
import { FeaturesSection } from "./_components/FeaturesSection";
import { MembershipCTA } from "./_components/MembershipCTA";

export const metadata: Metadata = {
  title: "Iloilo Business Club, Inc.",
  description: "Discover IBC, featured events, and membership opportunities.",
};

function HeroSkeleton() {
  return <Skeleton className="h-screen max-h-[950px] min-h-[700px] w-full" />;
}

export default async function Page() {
  const landingBenefitsSection = await getPublicWebsiteContentSection(
    "landing_page_benefits",
  );

  const featuresData = landingBenefitsSection.hasRows
    ? landingBenefitsSection.cards.map((card) => ({
        icon: card.icon,
        title: card.title,
        description: card.paragraph,
      }))
    : undefined;

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <FeaturedEventsHero />
      </Suspense>
      <FeaturesSection featuresData={featuresData} />
      <Suspense>
        <FeaturedEventsSection />
      </Suspense>
      <Suspense>
        <FeaturedMembersSection />
      </Suspense>
      <FacebookCTASection />
      <MembershipCTA />
    </>
  );
}
