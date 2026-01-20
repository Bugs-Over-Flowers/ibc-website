import { Suspense } from "react";
import type { RegistrationInformationPageProps } from "@/lib/types/route";
import RegistrationInfoPage from "./_components/RegistrationInfoPage";

export default function InfoPageWrapper({
  params,
}: RegistrationInformationPageProps) {
  return (
    <Suspense>
      <RegistrationInfoPage params={params} />
    </Suspense>
  );
}
