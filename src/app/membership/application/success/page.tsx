"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ResetMembershipApplicationWrapper from "@/app/membership/application/success/_components/ResetMembershipApplicationWrapper";
import { ApplicationIdSection } from "./_components/ApplicationIdSection";
import { ConfirmationSection } from "./_components/ConfirmationSection";
import { ImportantInfoSection } from "./_components/ImportantInfoSection";
import { SuccessFooterActions } from "./_components/SuccessFooterActions";
import { WhatsNextSection } from "./_components/WhatsNextSection";
import MembershipApplicationSuccessLoading from "./loading";

function SuccessContent() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("id") ?? "";

  return (
    <main className="mt-10 min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-7">
        {/* ── Header ── */}
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

        {/* ── Divider ── */}
        <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

        {/* ── Content Sections ── */}
        <div className="space-y-6">
          {identifier && <ApplicationIdSection identifier={identifier} />}

          <WhatsNextSection />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ImportantInfoSection />
            <ConfirmationSection />
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <SuccessFooterActions />
      </div>
    </main>
  );
}

export default function MembershipSuccessPage() {
  return (
    <ResetMembershipApplicationWrapper>
      <Suspense fallback={<MembershipApplicationSuccessLoading />}>
        <SuccessContent />
      </Suspense>
    </ResetMembershipApplicationWrapper>
  );
}
