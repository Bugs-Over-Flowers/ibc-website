import { Suspense } from "react";
import { CreateEventForm } from "./_components/forms/CreateEventForm";
import { CreateEventFormSkeleton } from "./_components/forms/CreateEventFormSkeleton";

export default function CreateEventPage() {
  return (
    <Suspense fallback={<CreateEventFormSkeleton />}>
      <CreateEventForm />
    </Suspense>
  );
}
