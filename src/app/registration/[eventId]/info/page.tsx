import type { Metadata } from "next";
import { Suspense } from "react";
import type { RegistrationInformationPageProps } from "@/lib/types/route";
import { RegistrationInfoPageContent } from "./_components/RegistrationInfoPageContent";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Registration Information",
  description: "Review and confirm your event registration details.",
};

export default function InfoPageWrapper({
  params,
  searchParams,
}: RegistrationInformationPageProps) {
  return (
    <main className="min-h-screen w-full bg-background pb-20">
      <Suspense fallback={<Loading />}>
        <RegistrationInfoPageContent
          params={params}
          searchParams={searchParams}
        />
      </Suspense>
    </main>
  );
}
