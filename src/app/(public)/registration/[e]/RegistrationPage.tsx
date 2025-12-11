import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import RegistrationForm from "@/forms/registration/RegistrationForm";
import tryCatch from "@/lib/server/tryCatch";
import { getAllMembers } from "@/server/members/queries";
import { getRegistrationEventDetails } from "@/server/registration/queries";
import RegistrationInformation from "./RegistrationInformation";

interface RegistrationPageProps {
  params: Promise<{ e: string }>;
}

const RegistrationPage = async ({ params }: RegistrationPageProps) => {
  const { e } = await params;
  const requestCookies = (await cookies()).getAll();
  const [registrationEventDetailsMessage, eventData] = await tryCatch(
    getRegistrationEventDetails(requestCookies, { eventId: e }),
  );

  const [getAllMembersMessage, members] = await tryCatch(
    getAllMembers(requestCookies),
  );

  if (registrationEventDetailsMessage || getAllMembersMessage) {
    return <div>{registrationEventDetailsMessage}</div>;
  }

  if (!eventData || !members) {
    throw redirect("/");
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full h-full">
      <RegistrationInformation {...eventData} />
      <div className="flex flex-col gap-4 w-full h-full p-5">
        <Link href={"/events"}>
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
