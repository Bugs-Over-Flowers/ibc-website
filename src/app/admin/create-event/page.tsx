import { Suspense } from "react";
import { CreateEventForm } from "./_components/forms/createEventForm";

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateEventForm />
    </Suspense>
  );
}
