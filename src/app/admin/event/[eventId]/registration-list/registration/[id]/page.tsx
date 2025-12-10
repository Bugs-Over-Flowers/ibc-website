import { cookies } from "next/headers";
import { Suspense } from "react";
import { getRegistrationData } from "@/server/registration/queries";
import RegistrationDetails from "./_components/RegistrationDetails";

type RegistrationPageParams =
  PageProps<"/admin/event/[eventId]/registration-list/registration/[id]">["params"];
export default function RegistrationDetailsPageWrapper({
  params,
}: {
  params: RegistrationPageParams;
}) {
  return (
    <Suspense>
      <RegistrationDetailsPage params={params} />
    </Suspense>
  );
}

async function RegistrationDetailsPage({
  params,
}: {
  params: RegistrationPageParams;
}) {
  const { id } = await params;
  const cookieStore = await cookies();

  const registration = await getRegistrationData(cookieStore.getAll(), {
    registrationId: id,
  });

  return <RegistrationDetails {...registration} />;
}
