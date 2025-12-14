import { Suspense } from "react";
import { Footer } from "@/components/navbar/Footer";
import { Header } from "@/components/navbar/Header";
import MembersBenefits from "./_components/MembersBenefits";
import MembersCTA from "./_components/MembersCTA";
import { MembersHero } from "./_components/MembersHero";
import MembersListSection from "./_components/MembersListSection";
import MembersLoading from "./loading";

export default function Page() {
  return (
    <div>
      <Header />
      <MembersHero />
      <Suspense fallback={<MembersLoading />}>
        <MembersListSection />
      </Suspense>
      <MembersBenefits />
      <MembersCTA />
      <Footer />
    </div>
  );
}
