"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/db.types";
import { sendMembershipStatusChangedEmail } from "@/server/emails/mutations/sendMembershipStatusChangedEmail";

type MembershipStatus = Database["public"]["Enums"]["MembershipStatus"];

type MemberStatusTransition = {
  businessMemberId: string;
  businessName: string;
  previousStatus: MembershipStatus;
  currentStatus: MembershipStatus;
};

type NotificationSummary = {
  transitionedCount: number;
  attemptedEmails: number;
  sentEmails: number;
  failedEmails: number;
};

type ApplicationMemberEmail = {
  applicationId: string;
  emailAddress: string;
};

async function getEmailMapByApplicationId(
  supabase: SupabaseClient<Database>,
  applicationIds: string[],
): Promise<Map<string, string[]>> {
  if (applicationIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("ApplicationMember")
    .select("applicationId,emailAddress")
    .in("applicationId", applicationIds)
    .not("emailAddress", "is", null);

  if (error) {
    throw new Error(
      `Failed to fetch ApplicationMember emails: ${error.message}`,
    );
  }

  const emailMap = new Map<string, string[]>();
  for (const row of (data ?? []) as ApplicationMemberEmail[]) {
    const email = row.emailAddress.trim();
    if (!email) {
      continue;
    }

    const existing = emailMap.get(row.applicationId) ?? [];
    if (!existing.includes(email)) {
      existing.push(email);
      emailMap.set(row.applicationId, existing);
    }
  }

  return emailMap;
}

export async function sendMembershipStatusNotifications(
  supabase: SupabaseClient<Database>,
  transitions: MemberStatusTransition[],
): Promise<NotificationSummary> {
  if (transitions.length === 0) {
    return {
      transitionedCount: 0,
      attemptedEmails: 0,
      sentEmails: 0,
      failedEmails: 0,
    };
  }

  const memberIds = transitions.map(
    (transition) => transition.businessMemberId,
  );

  const { data: members, error: memberError } = await supabase
    .from("BusinessMember")
    .select("businessMemberId,primaryApplicationId")
    .in("businessMemberId", memberIds);

  if (memberError) {
    throw new Error(
      `Failed to fetch members for email notifications: ${memberError.message}`,
    );
  }

  const appIds = Array.from(
    new Set(
      (members ?? [])
        .map((member) => member.primaryApplicationId)
        .filter((applicationId): applicationId is string =>
          Boolean(applicationId),
        ),
    ),
  );

  const emailsByApplicationId = await getEmailMapByApplicationId(
    supabase,
    appIds,
  );

  const jobs: Array<{
    to: string;
    businessName: string;
    previousStatus: MembershipStatus;
    currentStatus: MembershipStatus;
  }> = [];

  for (const transition of transitions) {
    const member = (members ?? []).find(
      (row) => row.businessMemberId === transition.businessMemberId,
    );

    if (!member?.primaryApplicationId) {
      continue;
    }

    const emails = emailsByApplicationId.get(member.primaryApplicationId) ?? [];
    for (const email of emails) {
      jobs.push({
        to: email,
        businessName: transition.businessName,
        previousStatus: transition.previousStatus,
        currentStatus: transition.currentStatus,
      });
    }
  }

  let sentEmails = 0;
  let failedEmails = 0;

  const results = await Promise.allSettled(
    jobs.map((job) => sendMembershipStatusChangedEmail(job)),
  );

  for (const result of results) {
    if (result.status === "fulfilled" && !result.value[0]) {
      sentEmails += 1;
    } else {
      failedEmails += 1;
    }
  }

  return {
    transitionedCount: transitions.length,
    attemptedEmails: jobs.length,
    sentEmails,
    failedEmails,
  };
}
