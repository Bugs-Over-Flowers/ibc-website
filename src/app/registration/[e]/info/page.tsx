import { Suspense } from "react";
import InfoPage from "./_components/InfoPage";

type InformationPageProps = PageProps<"/registration/[e]/info">;
export default function InfoPageWrapper({ params }: InformationPageProps) {
  return (
    <Suspense>
      <InfoPage params={params} />
    </Suspense>
  );
}
