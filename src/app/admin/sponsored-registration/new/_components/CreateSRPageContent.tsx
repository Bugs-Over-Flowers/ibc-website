import BackButton from "@/app/admin/_components/BackButton";
import { getEventsForSelect } from "@/server/sponsored-registrations/queries/getEventsForSelect";
import { CreateSRForm } from "./CreateSRForm";
import type { CreateSREventOption } from "./types";

export async function CreateSRPageContent() {
  const allEvents = await getEventsForSelect();
  const now = new Date();
  const events: CreateSREventOption[] = allEvents
    .filter((event) => {
      if (!event.eventTitle) return false;
      if (event.eventEndDate) {
        const end = new Date(event.eventEndDate);
        if (end < now) return false;
      }
      return true;
    })
    .map((event) => ({
      ...event,
      eventTitle: event.eventTitle as string,
    }));

  return (
    <div className="pb-8">
      <div className="px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <BackButton
              href="/admin/sponsored-registration"
              label="Back to Sponsored Registrations"
            />
          </div>

          <h1 className="mb-4 font-extrabold text-4xl text-foreground tracking-tight md:text-5xl">
            Create Sponsored Registration
          </h1>
          <p className="max-w-2xl font-medium text-foreground/90 text-lg leading-relaxed">
            Generate a unique sponsored registration link, assign fee deduction,
            and control guest limits for the selected event.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <CreateSRForm events={events} />
      </div>
    </div>
  );
}
