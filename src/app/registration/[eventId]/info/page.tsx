import { Suspense } from "react";
import type { RegistrationInformationPageProps } from "@/lib/types/route";
import InfoPage from "./_components/InfoPage";

export default function InfoPageWrapper({
  params,
}: RegistrationInformationPageProps) {
  return (
    <Suspense>
      <InfoPage params={params} />
    </Suspense>
  );
}
