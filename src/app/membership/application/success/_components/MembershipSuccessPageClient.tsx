"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MembershipApplicationSuccessLoading from "../loading";
import { ApplicationIdSection } from "./ApplicationIdSection";
import { ConfirmationSection } from "./ConfirmationSection";
import { ImportantInfoSection } from "./ImportantInfoSection";
import ResetMembershipApplicationWrapper from "./ResetMembershipApplicationWrapper";
import { SuccessFooterActions } from "./SuccessFooterActions";
import { WhatsNextSection } from "./WhatsNextSection";

function SuccessContent() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("id") ?? "";

  return (
    <main className="mt-10 min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-7">
        <div className="flex items-start gap-6 sm:gap-8">
          <div className="relative mt-1 shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg" />
            <div className="relative rounded-full bg-linear-to-br from-primary/20 to-primary/30 p-3.5 ring-2 ring-primary/30">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="font-bold text-3xl text-foreground tracking-tight sm:text-4xl">
              Application Submitted!
            </h1>
            <p className="max-w-lg text-base text-muted-foreground leading-relaxed">
              Your membership application has been received and is under review.
              See the details below.
            </p>
          </div>
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

        <div className="space-y-6">
          {identifier && <ApplicationIdSection identifier={identifier} />}

          <WhatsNextSection />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ImportantInfoSection />
            <ConfirmationSection />
          </div>
        </div>

        <SuccessFooterActions />
      </div>
    </main>
  );
}

export default function MembershipSuccessPageClient() {
  return (
    <ResetMembershipApplicationWrapper>
      <Suspense fallback={<MembershipApplicationSuccessLoading />}>
        <SuccessContent />
      </Suspense>
    </ResetMembershipApplicationWrapper>
  );
}
