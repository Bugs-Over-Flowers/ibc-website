"use server";

import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";
import {
  type MembershipApplicationInput,
  MembershipApplicationSchema,
} from "@/lib/validation/membership/application";
import { sendMembershipApplicationEmail } from "@/server/emails/actions/sendMembershipApplicationEmail";

type SubmitApplicationOutput = {
  applicationId: string;
  identifier: string;
  status: string;
  message: string;
};

export const submitMembershipApplication: ServerFunction<
  [MembershipApplicationInput],
  SubmitApplicationOutput
> = async (input) => {
  const parsed = MembershipApplicationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      data: null,
    };
  }

  const supabase = await createActionClient();

  console.log(
    "Submitting application with payment method:",
    parsed.data.paymentMethod,
  );

  const { data, error } = await supabase.rpc("submit_membership_application", {
    p_application_type: parsed.data.applicationType,
    p_company_details: {
      name: parsed.data.companyName,
      address: parsed.data.companyAddress,
      sectorId: parsed.data.sectorId,
      landline: parsed.data.landline,
      fax: parsed.data.faxNumber,
      mobile: parsed.data.mobileNumber,
      email: parsed.data.emailAddress,
      websiteURL: parsed.data.websiteURL,
      logoImageURL: parsed.data.logoImageURL,
      businessMemberId: parsed.data.businessMemberId ?? null,
    },
    p_representatives: parsed.data.representatives.map((rep) => ({
      memberType: rep.companyMemberType,
      firstName: rep.firstName,
      lastName: rep.lastName,
      mailingAddress: rep.mailingAddress,
      sex: rep.sex,
      nationality: rep.nationality,
      birthdate: rep.birthdate.toISOString(),
      position: rep.companyDesignation,
      landline: rep.landline,
      fax: rep.faxNumber,
      mobileNumber: rep.mobileNumber,
      email: rep.emailAddress,
    })),
    p_payment_method: parsed.data.paymentMethod === "BPI" ? "BPI" : "ONSITE",
    p_payment_proof_url: parsed.data.paymentProofUrl,
    p_application_member_type: parsed.data.applicationMemberType,
  });

  if (error) {
    console.error("Error submitting membership application:", error);
    return { success: false, error: error.message, data: null };
  }

  const result = data as SubmitApplicationOutput;

  // Send confirmation email to the applicant
  console.log(
    "Sending membership application email to:",
    parsed.data.emailAddress,
  );
  try {
    const [emailError, emailResult] = await sendMembershipApplicationEmail({
      toEmail: parsed.data.emailAddress,
      companyName: parsed.data.companyName,
      applicationType: parsed.data.applicationType,
      applicationIdentifier: result.identifier,
    });

    if (emailError) {
      console.error("Failed to send membership application email:", emailError);
    } else {
      console.log(
        "Membership application email sent successfully:",
        emailResult,
      );
    }
  } catch (emailError) {
    // Log the error but don't fail the submission
    console.error(
      "Exception sending membership application email:",
      emailError,
    );
  }

  return { success: true, data: result, error: null };
};
