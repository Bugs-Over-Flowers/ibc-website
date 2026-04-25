import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateEventForm } from "./_components/forms/CreateEventForm";
import { CreateEventFormSkeleton } from "./_components/forms/CreateEventFormSkeleton";

export const metadata: Metadata = {
  title: "Create Event | Admin",
  description: "Create and configure a new event.",
};

export default function CreateEventPage() {
  return (
    <Suspense fallback={<CreateEventFormSkeleton />}>
      <CreateEventForm />
    </Suspense>
  );
}
