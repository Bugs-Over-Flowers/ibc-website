"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { sendMembershipStatusNotifications } from "@/server/members/mutations/sendMembershipStatusNotifications";
import type {
  MemberStatusTransition,
  MembershipStatus,
} from "@/server/members/types";

type MemberSnapshot = {
  businessMemberId: string;
  businessName: string;
  membershipStatus: MembershipStatus | null;
};

async function processAndNotify(referenceTime: Date) {
  const supabase = await createAdminClient();

  const { data: beforeRows, error: beforeError } = await supabase
    .from("BusinessMember")
    .select("businessMemberId,businessName,membershipStatus")
    .not("membershipExpiryDate", "is", null)
    .lt("membershipExpiryDate", referenceTime.toISOString())
    .in("membershipStatus", ["paid", "unpaid"]);

  if (beforeError) {
    throw new Error(
      `Failed to load members before transition: ${beforeError.message}`,
    );
  }

  const { error: transitionError } = await supabase.rpc(
    "process_membership_statuses",
    {
      p_reference_time: referenceTime.toISOString(),
    },
  );

  if (transitionError) {
    throw new Error(
      `Failed to process membership statuses: ${transitionError.message}`,
    );
  }

  const targetIds = (beforeRows ?? []).map((row) => row.businessMemberId);
  if (targetIds.length === 0) {
    return {
      updatedCount: 0,
      emailSummary: {
        transitionedCount: 0,
        attemptedEmails: 0,
        sentEmails: 0,
        failedEmails: 0,
      },
    };
  }

  const { data: afterRows, error: afterError } = await supabase
    .from("BusinessMember")
    .select("businessMemberId,businessName,membershipStatus")
    .in("businessMemberId", targetIds);

  if (afterError) {
    throw new Error(
      `Failed to load members after transition: ${afterError.message}`,
    );
  }

  const beforeMap = new Map(
    (beforeRows ?? []).map((row) => [row.businessMemberId, row]),
  );

  const transitions: MemberStatusTransition[] = (afterRows ?? [])
    .map((row: MemberSnapshot) => {
      const before = beforeMap.get(row.businessMemberId);
      if (!before?.membershipStatus || !row.membershipStatus) {
        return null;
      }

      if (before.membershipStatus === row.membershipStatus) {
        return null;
      }

      return {
        businessMemberId: row.businessMemberId,
        businessName: row.businessName,
        previousStatus: before.membershipStatus,
        currentStatus: row.membershipStatus,
      } satisfies MemberStatusTransition;
    })
    .filter((row): row is MemberStatusTransition => row !== null);

  const emailSummary = await sendMembershipStatusNotifications(
    supabase,
    transitions,
  );

  return {
    updatedCount: transitions.length,
    emailSummary,
  };
}

/**
 * Reset member statuses on January 1st.
 * Intended for scheduled execution.
 */
export async function resetMemberStatuses() {
  const currentYear = Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
    }).format(new Date()),
  );
  const referenceTime = new Date(`${currentYear}-01-01T00:00:00+08:00`);

  const result = await processAndNotify(referenceTime);

  return {
    success: true,
    message: `Member statuses reset for ${currentYear}`,
    updatedCount: result.updatedCount,
    emailSummary: result.emailSummary,
    details:
      "Membership transitions were processed and notifications were sent directly from ApplicationMember emails.",
  };
}

/**
 * Process membership transitions up to a deadline.
 */
export async function updateCancelledMembers(deadlineDate: Date) {
  const deadlineDateString = deadlineDate.toISOString().split("T")[0];

  const result = await processAndNotify(deadlineDate);

  return {
    success: true,
    message: "Cancelled members updated successfully",
    deadline: deadlineDateString,
    updatedCount: result.updatedCount,
    emailSummary: result.emailSummary,
    details: `Membership transitions were processed and notifications were sent up to reference time ${deadlineDate.toISOString()}.`,
  };
}
