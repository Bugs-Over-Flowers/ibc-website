import { Suspense } from "react";
import { CreateEventFormSkeleton } from "./_components/forms/CreateEventFormSkeleton";
import { CreateEventForm } from "./_components/forms/createEventForm";

export default function CreateEventPage() {
  return (
    <Suspense fallback={<CreateEventFormSkeleton />}>
      <CreateEventForm />
    </Suspense>
  );
}
