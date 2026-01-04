"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import type { ScheduleMeetingInput } from "@/lib/validation/application";
import { scheduleMeetingSchema } from "@/lib/validation/application";
import { sendMeetingEmail } from "@/server/emails/mutations/sendMeetingEmail";

export async function scheduleMeeting(input: ScheduleMeetingInput) {
  const parsed = scheduleMeetingSchema.parse(input);

  const supabase = await createActionClient();

  // Use a deterministic org-default timezone for communications.
  const DEFAULT_TZ = "Asia/Manila";

  const interviewDate =
    parsed.interviewDate instanceof Date
      ? parsed.interviewDate
      : new Date(parsed.interviewDate as unknown as string);

  // Store in UTC for DB consistency; prefer a timestamptz column in DB
  const interviewDateUtcIso = interviewDate.toISOString();

  // Format a human-readable, timezone-aware string for email notifications
  const formattedInterviewDateLocal = new Intl.DateTimeFormat("en-PH", {
    timeZone: DEFAULT_TZ,
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(interviewDate);

  // First, get application details to send emails
  const { data: applications, error: fetchError } = await supabase
    .from("Application")
    .select(
      `
      applicationId,
      companyName,
      emailAddress,
      ApplicationMember(firstName, lastName, emailAddress)
    `,
    )
    .in("applicationId", parsed.applicationIds);

  if (fetchError) {
    throw new Error(`Failed to fetch applications: ${fetchError.message}`);
  }

  if (!applications || applications.length === 0) {
    throw new Error("No applications found");
  }

  // Update application status to "pending" (interview scheduled)
  const { error: updateError } = await supabase
    .from("Application")
    .update({ applicationStatus: "pending" })
    .in("applicationId", parsed.applicationIds);

  if (updateError) {
    throw new Error(
      `Failed to update application status: ${updateError.message}`,
    );
  }

  // Insert interview records
  const interviewInserts = parsed.applicationIds.map((appId) => ({
    applicationId: appId,
    // Store UTC ISO string; DB column should be timestamptz for correctness
    interviewDate: interviewDateUtcIso,
    interviewVenue: parsed.interviewVenue,
    status: "scheduled" as const,
  }));

  const { error: insertError } = await supabase
    .from("Interview")
    .insert(interviewInserts);

  if (insertError) {
    throw new Error(`Failed to create interviews: ${insertError.message}`);
  }

  // Send emails to all applicants
  const emailPromises = applications.map(async (app) => {
    const [emailError] = await sendMeetingEmail({
      to: app.emailAddress,
      companyName: app.companyName,
      // Send a timezone-aware, human-readable datetime to applicants
      interviewDate: formattedInterviewDateLocal,
      interviewVenue: parsed.interviewVenue,
    });

    if (emailError) {
      throw new Error(emailError);
    }
  });

  await Promise.all(emailPromises);

  revalidatePath("/admin/application");

  return {
    success: true as const,
    message: `Meeting scheduled for ${applications.length} application(s) — ${formattedInterviewDateLocal} (${DEFAULT_TZ})`,
  };
}

// Tuple-style server action wrapper to comply with [error, data] pattern
// without breaking existing call sites using tryCatch(object-union).
export async function scheduleMeetingAction(
  input: ScheduleMeetingInput,
): Promise<
  [
    error: string | null,
    data: {
      success: true;
      message: string;
    } | null,
  ]
> {
  try {
    const result = await scheduleMeeting(input);
    return [null, result];
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return [message, null];
  }
}
