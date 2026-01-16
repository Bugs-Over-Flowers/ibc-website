import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationRouteProps } from "@/lib/types/route";
import { getAllMembers } from "@/server/members/queries/getAllMembers";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import RegistrationForm from "./forms/RegistrationForm";
import RegistrationInformation from "./RegistrationInfoHeader";

const RegistrationPage = async ({
  params,
}: {
  params: RegistrationRouteProps["params"];
}) => {
  const { eventId } = await params;
  const requestCookies = (await cookies()).getAll();
  const { error: registrationEventDetailsMessage, data: eventData } =
    await tryCatch(getRegistrationEventDetails(requestCookies, { eventId }));

  const { error: getAllMembersMessage, data: members } = await tryCatch(
    getAllMembers(requestCookies),
  );

  if (registrationEventDetailsMessage || getAllMembersMessage) {
    return <div>{registrationEventDetailsMessage}</div>;
  }

  if (!eventData || !members) {
    throw redirect("/");
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 md:flex-row">
      <RegistrationInformation {...eventData} />
      <div className="flex h-full w-full flex-col gap-4 p-5">
        <Link href={`/events/${eventId}`}>
          <Button variant={"ghost"}>
            <ChevronLeft />
            Back to Event
          </Button>
        </Link>
        <RegistrationForm members={members} />
      </div>
    </div>
  );
};

export default RegistrationPage;
