import type { Metadata } from "next";
import { Suspense } from "react";
import FeaturedMembersSection from "@/components/FeaturedMembersSection";
import { getPublicHeroSectionImages } from "@/server/website-content/queries/getPublicWebsiteContentSection";
import MembersBenefits from "./_components/MembersBenefits";
import MembersCTA from "./_components/MembersCTA";
import { MembersHero } from "./_components/MembersHero";
import MembersListSection from "./_components/MembersListSection";
import MembersLoading from "./loading";

export const metadata: Metadata = {
  title: "Members Directory",
  description: "Browse active IBC members by sector and status.",
};

export default async function Page() {
  const memberHeroImages = await getPublicHeroSectionImages("members");

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<MembersLoading />}>
        <MembersHero backgroundImages={memberHeroImages} />
        <FeaturedMembersSection />
        <MembersListSection />
        <MembersBenefits />
        <MembersCTA />
      </Suspense>
    </main>
  );
}
