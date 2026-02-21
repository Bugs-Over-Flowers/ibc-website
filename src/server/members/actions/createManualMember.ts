"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Database } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";
import {
  type ManualMemberInput,
  ManualMemberSchema,
} from "@/lib/validation/membership/manualMember";

const SubmitMembershipResponseSchema = z.object({
  applicationId: z.string().uuid(),
});

const ApproveMembershipResponseSchema = z.object({
  business_member_id: z.string().uuid(),
});

type MembershipStatus = Database["public"]["Enums"]["MembershipStatus"];

type CreateManualMemberResponse = {
  success: boolean;
  businessMemberId: string;
  applicationId: string;
  message: string;
};

export async function createManualMember(
  input: ManualMemberInput,
): Promise<CreateManualMemberResponse> {
  const parsed = ManualMemberSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form data");
  }

  const supabase = await createActionClient();
  const sectorId = Number.parseInt(parsed.data.sectorId, 10);

  if (Number.isNaN(sectorId) || sectorId <= 0) {
    throw new Error("Industry/Sector is required");
  }

  const { data: submitData, error: submitError } = await supabase.rpc(
    "submit_membership_application",
    {
      p_application_type: "newMember",
      p_company_details: {
        name: parsed.data.companyName,
        address: parsed.data.companyAddress,
        sectorId,
        landline: parsed.data.landline,
        fax: parsed.data.faxNumber,
        mobile: parsed.data.mobileNumber,
        email: parsed.data.emailAddress,
        websiteURL: parsed.data.websiteURL,
        logoImageURL: parsed.data.logoImageURL,
      },
      p_representatives: [
        {
          memberType: parsed.data.companyMemberType,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          mailingAddress: parsed.data.mailingAddress,
          sex: parsed.data.sex,
          nationality: parsed.data.nationality,
          birthdate: parsed.data.birthdate.toISOString(),
          position: parsed.data.companyDesignation,
          landline: parsed.data.representativeLandline,
          fax: parsed.data.representativeFaxNumber,
          mobileNumber: parsed.data.representativeMobileNumber,
          email: parsed.data.representativeEmailAddress,
        },
      ],
      p_payment_method: "ONSITE",
      p_application_member_type: parsed.data.applicationMemberType,
    },
  );

  if (submitError) {
    throw new Error(`Failed to create application: ${submitError.message}`);
  }

  const submitResult = SubmitMembershipResponseSchema.safeParse(submitData);

  if (!submitResult.success) {
    throw new Error("Failed to parse membership application response");
  }

  const { data: approveData, error: approveError } = await supabase.rpc(
    "approve_membership_application",
    {
      p_application_id: submitResult.data.applicationId,
    },
  );

  if (approveError) {
    throw new Error(`Failed to approve application: ${approveError.message}`);
  }

  const approvePayload = Array.isArray(approveData)
    ? approveData[0]
    : approveData;
  const approveResult =
    ApproveMembershipResponseSchema.safeParse(approvePayload);

  if (!approveResult.success) {
    throw new Error("Failed to parse approved member response");
  }

  if (parsed.data.membershipStatus !== "paid") {
    const { error: updateError } = await supabase
      .from("BusinessMember")
      .update({
        membershipStatus: parsed.data.membershipStatus as MembershipStatus,
      })
      .eq("businessMemberId", approveResult.data.business_member_id);

    if (updateError) {
      throw new Error(
        `Failed to update membership status: ${updateError.message}`,
      );
    }
  }

  revalidatePath("/admin/application");
  revalidatePath("/admin/members");

  return {
    success: true,
    businessMemberId: approveResult.data.business_member_id,
    applicationId: submitResult.data.applicationId,
    message: "Member created successfully",
  };
}
