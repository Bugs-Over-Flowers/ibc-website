import { z } from "zod";

export function getManilaDateKey(): string {
  const parts = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export const FeatureMemberSchema = z.object({
  memberId: z.uuid(),
  featuredExpirationDate: z
    .string()
    .date()
    .refine(
      (date) => date >= getManilaDateKey(),
      "Feature expiration date cannot be earlier than today.",
    ),
});

export type FeatureMemberInput = z.infer<typeof FeatureMemberSchema>;

export const RemoveFeaturedMemberSchema = z.object({
  memberId: z.uuid(),
});

export type RemoveFeaturedMemberInput = z.infer<
  typeof RemoveFeaturedMemberSchema
>;
