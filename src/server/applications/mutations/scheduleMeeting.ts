"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";
import type { ScheduleMeetingInput } from "@/lib/validation/application/application";
import { scheduleMeetingSchema } from "@/lib/validation/application/application";
import { sendMeetingEmail } from "@/server/emails/mutations/sendMeetingEmail";

export async function scheduleMeeting(input: ScheduleMeetingInput) {
  const parsed = scheduleMeetingSchema.parse(input);

  const supabase = await createActionClient();

  // Use a deterministic org-default timezone for communications.
  const DEFAULT_TZ = "Asia/Manila";

  const interviewDate = parsed.interviewDate as Date;

  if (Number.isNaN(interviewDate.getTime())) {
    throw new Error("Invalid interview date");
  }

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

  // Send emails to all applicants first; only update DB when notifications succeed
  const emailPromises = applications.map(async (app) => {
    const [emailError] = await sendMeetingEmail({
      to: app.emailAddress,
      companyName: app.companyName,
      // Send a timezone-aware, human-readable datetime to applicants
      interviewDate: formattedInterviewDateLocal,
      interviewVenue: parsed.interviewVenue,
      customMessage: parsed.customMessage,
    });

    if (emailError) {
      throw new Error(emailError);
    }
  });

  await Promise.all(emailPromises);

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

  const { data: insertedInterviews, error: insertError } = await supabase
    .from("Interview")
    .insert(interviewInserts)
    .select("interviewId, applicationId");

  if (insertError) {
    throw new Error(`Failed to create interviews: ${insertError.message}`);
  }

  if (!insertedInterviews || insertedInterviews.length === 0) {
    throw new Error("No interviews were created");
  }

  // Use RPC to atomically insert interviews and link them to applications
  // This ensures all-or-nothing semantics and prevents partial updates
  const interviewDataJson = insertedInterviews.map((interview) => ({
    applicationId: interview.applicationId,
    interviewDate: interviewDateUtcIso,
    interviewVenue: parsed.interviewVenue,
  }));

  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "schedule_interviews_batch",
    {
      p_interview_data: interviewDataJson,
    },
  );

  if (rpcError) {
    throw new Error(`Failed to link interviews: ${rpcError.message}`);
  }

  if (!rpcResult || !rpcResult[0]?.success) {
    throw new Error(
      `Interview linking failed: ${rpcResult?.[0]?.message || "Unknown error"}`,
    );
  }
  // updateTag(CACHE_TAGS.applications.all);
  // updateTag(CACHE_TAGS.applications.admin);

  revalidatePath("/admin/application");

  return {
    success: true as const,
    message: `Meeting scheduled for ${applications.length} application(s) — ${formattedInterviewDateLocal} (${DEFAULT_TZ})`,
  };
}
