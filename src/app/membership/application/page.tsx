import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipApplicationPageContent } from "./_components/MembershipApplicationPageContent";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Membership Application",
  description: "Apply for IBC membership.",
};

export default function MembershipApplicationPage() {
  return (
    <main className="min-h-screen w-full bg-linear-to-b from-background via-background to-muted/30 pb-20">
      <Suspense fallback={<Loading />}>
        <MembershipApplicationPageContent />
      </Suspense>
    </main>
  );
}
