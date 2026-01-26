import { Suspense } from "react";
import MembersBenefits from "./_components/MembersBenefits";
import MembersCTA from "./_components/MembersCTA";
import { MembersHero } from "./_components/MembersHero";
import MembersListSection from "./_components/MembersListSection";
import MembersLoading from "./loading";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<MembersLoading />}>
        <MembersHero />
        <MembersListSection />
        <MembersBenefits />
        <MembersCTA />
      </Suspense>
    </main>
  );
}
