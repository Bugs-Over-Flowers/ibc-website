import type { Database } from "@/lib/supabase/db.types";
import type { useEditEventForm } from "../../_hooks/useEditEventForm";

export type EditEventFormInstance = ReturnType<typeof useEditEventForm>["form"];
export type EventRow = Database["public"]["Tables"]["Event"]["Row"];
