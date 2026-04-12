import type { Enums } from "@/lib/supabase/db.types";

export type ApplicationType = Enums<"ApplicationType">;

export const APPLICATION_TYPE_ORDER: ApplicationType[] = [
  "newMember",
  "updating",
  "renewal",
];

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  newMember: "New Member",
  updating: "Update Info",
  renewal: "Renewal",
};

export function getApplicationTypeLabel(type: string): string {
  if (type in APPLICATION_TYPE_LABELS) {
    return APPLICATION_TYPE_LABELS[type as ApplicationType];
  }

  return type;
}
