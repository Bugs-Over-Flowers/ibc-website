"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Enums } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";
import type { ApplicationDecisionInput } from "@/lib/validation/application/application";
import { applicationDecisionSchema } from "@/lib/validation/application/application";
import { sendApplicationDecisionEmail } from "@/server/emails/mutations/sendApplicationDecisionEmail";

const ApproveApplicationResponseSchema = z.object({
  business_member_id: z.string().uuid(),
  message: z.string(),
});

type ApplicationType = Enums<"ApplicationType">;

const APPROVAL_RPC_BY_TYPE: Record<
  ApplicationType,
  | "approve_membership_application"
  | "approve_membership_renewal_application"
  | "approve_membership_update_application"
> = {
  newMember: "approve_membership_application",
  renewal: "approve_membership_renewal_application",
  updating: "approve_membership_update_application",
};

// Approve an application and create a BusinessMember record
export async function approveApplication(input: ApplicationDecisionInput) {
  const parsed = applicationDecisionSchema.parse(input);

  if (parsed.action !== "approve") {
    throw new Error("Invalid action for approval");
  }

  const supabase = await createActionClient();

  // Get application details
  const { data: application, error: fetchError } = await supabase
    .from("Application")
    .select(
      `
      *,
      ApplicationMember(firstName, lastName, emailAddress)
    `,
    )
    .eq("applicationId", parsed.applicationId)
    .single();

  if (fetchError || !application) {
    throw new Error(`Failed to fetch application: ${fetchError?.message}`);
  }

  const recipientEmail =
    application.emailAddress ||
    application.ApplicationMember?.[0]?.emailAddress;

  if (!recipientEmail) {
    throw new Error("Applicant email is missing for this application");
  }

  const applicationType = application.applicationType as ApplicationType;
  const approvalRpc = APPROVAL_RPC_BY_TYPE[applicationType];

  if (!approvalRpc) {
    throw new Error(
      `Unsupported application type: ${application.applicationType}`,
    );
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc(approvalRpc, {
    p_application_id: parsed.applicationId,
  });

  if (rpcError) {
    throw new Error(`Failed to approve application: ${rpcError.message}`);
  }

  const rpcRow = ApproveApplicationResponseSchema.parse(
    Array.isArray(rpcData) ? rpcData[0] : rpcData,
  );

  const [emailError] = await sendApplicationDecisionEmail({
    to: recipientEmail,
    companyName: application.companyName,
    decision: "approved",
    notes: parsed.notes,
  });

  if (emailError) {
    throw new Error(emailError);
  }

  updateTag(CACHE_TAGS.applications.all);
  updateTag(CACHE_TAGS.applications.admin);
  updateTag(CACHE_TAGS.members.all);
  updateTag(CACHE_TAGS.members.admin);
  updateTag(CACHE_TAGS.members.public);

  revalidatePath("/admin/application");
  revalidatePath("/admin/members");

  return {
    success: true as const,
    message: rpcRow.message || "Application approved successfully",
    businessMemberId: rpcRow.business_member_id,
  };
}
