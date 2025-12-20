"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import type { ScheduleMeetingInput } from "@/lib/validation/application";
import { scheduleMeetingSchema } from "@/lib/validation/application";
import { sendMeetingEmail } from "@/server/emails/mutations/sendMeetingEmail";

/**
 * Schedule a meeting for selected applications
 * Note: This requires creating an 'Interview' table with columns:
 * - interviewId (uuid, primary key)
 * - applicationId (uuid, foreign key to Application)
 * - interviewDate (timestamp)
 * - interviewVenue (text)
 * - createdAt (timestamp)
 */
export async function scheduleMeeting(input: ScheduleMeetingInput) {
  const parsed = scheduleMeetingSchema.parse(input);

  const supabase = await createActionClient();

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
    interviewDate: parsed.interviewDate.toISOString(),
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
  const emailPromises = applications.map((app) =>
    sendMeetingEmail({
      to: app.emailAddress,
      companyName: app.companyName,
      interviewDate: parsed.interviewDate.toISOString(),
      interviewVenue: parsed.interviewVenue,
    }),
  );

  await Promise.all(emailPromises);

  revalidatePath("/admin/application");

  return {
    success: true,
    message: `Meeting scheduled for ${applications.length} application(s)`,
  };
}
