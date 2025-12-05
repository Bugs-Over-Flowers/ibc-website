// to be removed soon

import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import tryCatch from "@/lib/server/tryCatch";
import { getAllEvents } from "@/server/events/queries";

const MockPage = async () => {
  const requestCookies = (await cookies()).getAll();
  const [error, events] = await tryCatch(getAllEvents(requestCookies));

  if (error) {
    throw error;
  }

  return (
    <div>
      {events?.map((event) => (
        <div key={event.eventId}>
          <h2>{event.eventTitle}</h2>
          <p>{event.description}</p>
          <Link href={`/registration/${event.eventId}`}>
            <Button>Go To {event.eventTitle}</Button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default MockPage;
