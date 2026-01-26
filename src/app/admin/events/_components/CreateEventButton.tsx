"use client";

import { useRouter } from "next/navigation";

export default function CreateEventButton() {
  const router = useRouter();

  const handleCreateEvent = () => {
    router.push("/admin/create-event");
  };

  return (
    <button
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      onClick={handleCreateEvent}
      type="button"
    >
      Create Event
    </button>
  );
}
