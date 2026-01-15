import { z } from "zod";

export const scheduleMeetingSchema = z.object({
  applicationIds: z
    .array(z.string().uuid())
    .min(1, "Select at least one application"),
  interviewDate: z.date({ message: "Interview date is required" }),
  interviewVenue: z.string().min(3, "Interview venue is required"),
  customMessage: z.string().optional(),
});

export const approveRejectSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

export const memberFilterSchema = z.object({
  status: z
    .enum(["active", "unpaid", "overdue", "revoked", "all"])
    .default("all")
    .optional(),
  sectorName: z.string().optional(),
  search: z.string().optional(),
});

export type ScheduleMeetingInput = z.infer<typeof scheduleMeetingSchema>;
export type ApproveRejectInput = z.infer<typeof approveRejectSchema>;
export type MemberFilterInput = z.infer<typeof memberFilterSchema>;
