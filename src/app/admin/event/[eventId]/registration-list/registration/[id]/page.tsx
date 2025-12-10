import { cookies } from "next/headers";
import { Suspense } from "react";
import { getRegistrationData } from "@/server/registration/queries";
import RegistrationDetails from "./_components/RegistrationDetails";

type params =
  PageProps<"/admin/event/[eventId]/registration-list/registration/[id]">["params"];
export default function RegistrationDetailsPageWrapper({
  params,
}: {
  params: params;
}) {
  return (
    <Suspense>
      <RegistrationDetailsPage params={params} />
    </Suspense>
  );
}

async function RegistrationDetailsPage({ params }: { params: params }) {
  const { id } = await params;
  const cookieStore = await cookies();

  const registration = await getRegistrationData(cookieStore.getAll(), {
    registrationId: id,
  });

  return <RegistrationDetails {...registration} />;
}
