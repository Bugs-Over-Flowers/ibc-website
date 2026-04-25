import type { useCreateEventForm } from "../../_hooks/createEventHook";

export type CreateEventAppForm = ReturnType<typeof useCreateEventForm>["form"];
