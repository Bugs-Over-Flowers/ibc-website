import type { Metadata } from "next";
import { Suspense } from "react";
import NetworksBenefits from "./_components/NetworksBenefits";
import NetworksCTA from "./_components/NetworksCTA";
import { NetworksHero } from "./_components/NetworksHero";
import NetworksListSection from "./_components/NetworksListSection";
import NetworksLoading from "./loading";

export const metadata: Metadata = {
  title: "Networks",
  description:
    "Join the IBC network of business leaders and organizations driving progress in Western Visayas.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<NetworksLoading />}>
        <NetworksHero />
        <NetworksListSection />
        <NetworksBenefits />
        <NetworksCTA />
      </Suspense>
    </main>
  );
}
