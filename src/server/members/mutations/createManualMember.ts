"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { Database } from "@/lib/supabase/db.types";
import { createActionClient } from "@/lib/supabase/server";
import {
  type ManualMemberInput,
  ManualMemberSchema,
} from "@/lib/validation/membership/manualMember";

const SubmitMembershipResponseSchema = z.object({
  applicationId: z.uuid(),
});

const ApproveMembershipResponseSchema = z.object({
  business_member_id: z.uuid(),
});

type MembershipStatus = Database["public"]["Enums"]["MembershipStatus"];
type PaymentProofStatus = Database["public"]["Enums"]["PaymentProofStatus"];

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
        mobile: parsed.data.mobileNumber,
        email: parsed.data.emailAddress,
        websiteURL: parsed.data.websiteURL,
        logoImageURL: parsed.data.logoImageURL,
      },
      p_representatives: parsed.data.representatives.map((representative) => ({
        memberType: representative.companyMemberType,
        firstName: representative.firstName,
        lastName: representative.lastName,
        mailingAddress: representative.mailingAddress,
        sex: representative.sex,
        nationality: representative.nationality,
        birthdate: representative.birthdate.toISOString(),
        position: representative.companyDesignation,
        landline: representative.landline,
        mobileNumber: representative.mobileNumber,
        email: representative.emailAddress,
      })),
      p_payment_method: "ONSITE",
      p_application_member_type: parsed.data.applicationMemberType,
      p_company_profile_type: parsed.data.companyProfileType,
    },
  );

  if (submitError) {
    throw new Error(`Failed to create application: ${submitError.message}`);
  }

  const submitResult = SubmitMembershipResponseSchema.safeParse(submitData);

  if (!submitResult.success) {
    throw new Error("Failed to parse membership application response");
  }

  const manualPaymentProofStatus: PaymentProofStatus = "accepted";
  const { error: paymentProofUpdateError } = await supabase
    .from("Application")
    .update({ paymentProofStatus: manualPaymentProofStatus })
    .eq("applicationId", submitResult.data.applicationId);

  if (paymentProofUpdateError) {
    throw new Error(
      `Failed to set payment proof status: ${paymentProofUpdateError.message}`,
    );
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

  updateTag(CACHE_TAGS.applications.all);
  updateTag(CACHE_TAGS.applications.admin);
  updateTag(CACHE_TAGS.members.all);
  updateTag(CACHE_TAGS.members.admin);
  updateTag(CACHE_TAGS.members.public);

  revalidatePath("/admin/application");
  revalidatePath("/admin/members");

  return {
    success: true,
    businessMemberId: approveResult.data.business_member_id,
    applicationId: submitResult.data.applicationId,
    message: "Member created successfully",
  };
}
