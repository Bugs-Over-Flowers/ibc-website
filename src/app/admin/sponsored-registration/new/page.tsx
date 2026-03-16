import { getEventsForSelect } from "@/server/sponsored-registrations/queries/getEventsForSelect";
import { BackButton } from "./_components/BackButton";
import { CreateSRForm } from "./_components/CreateSRForm";

export const metadata = {
  title: "Create Sponsored Registration | Admin",
  description: "Create a new sponsored registration",
};

export default async function NewSponsoredRegistrationPage() {
  const allEvents = await getEventsForSelect();
  const events = allEvents
    .filter((event) => event.eventTitle !== null)
    .map((event) => ({
      ...event,
      eventTitle: event.eventTitle as string,
    }));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <div>
        <BackButton />
      </div>

      <div className="space-y-1">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Sponsored Registrations
        </p>
        <h1 className="font-bold text-3xl text-foreground">
          Create Sponsored Registration
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a new sponsored registration link for an event
        </p>
      </div>

      <CreateSRForm events={events} />
    </div>
  );
}
