import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { MembershipApplicationPageContent } from "./_components/MembershipApplicationPageContent";

export default function MembershipApplicationPage() {
  return (
    <main className="min-h-screen w-full bg-slate-50/50 pb-20">
      <Suspense fallback={<Spinner />}>
        <MembershipApplicationPageContent />
      </Suspense>
    </main>
  );
}
