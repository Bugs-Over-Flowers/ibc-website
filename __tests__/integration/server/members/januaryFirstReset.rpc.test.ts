import { createClient } from "@supabase/supabase-js";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/lib/supabase/db.types";

type MembershipStatus = "paid" | "unpaid" | "cancelled";

type RpcErrorLike = { message: string } | null;
type JanuaryResetRpcResponse = { error: RpcErrorLike };
type RpcOptions = {
  head?: boolean;
  get?: boolean;
  count?: "exact" | "planned" | "estimated";
};
type JanuaryResetRpcClient = {
  rpc: {
    (
      fn: "january_first_reset",
      args?: never,
      options?: RpcOptions,
    ): PromiseLike<JanuaryResetRpcResponse>;
    (
      fn: "process_membership_statuses",
      args: { p_reference_time: string },
      options?: RpcOptions,
    ): PromiseLike<JanuaryResetRpcResponse>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

const hasDbEnv =
  !!supabaseUrl &&
  !!serviceRoleKey &&
  (supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost")) &&
  (serviceRoleKey.startsWith("eyJ") || serviceRoleKey.startsWith("sb_secret_"));

const describeIfDb = hasDbEnv ? describe : describe.skip;

type AdminClient = ReturnType<typeof createAdminClient>;

function createAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing local Supabase env vars for RPC integration tests",
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function runJanuaryFirstReset(client: JanuaryResetRpcClient) {
  const { error } = await client.rpc("january_first_reset");
  if (error) {
    throw new Error(`Failed to run january_first_reset: ${error.message}`);
  }
}

async function runMembershipStatusProcessing(
  client: JanuaryResetRpcClient,
  referenceTime: Date,
) {
  const { error } = await client.rpc("process_membership_statuses", {
    p_reference_time: referenceTime.toISOString(),
  });
  if (error) {
    throw new Error(
      `Failed to run process_membership_statuses: ${error.message}`,
    );
  }
}

describe("january_first_reset RPC - error flows", () => {
  it("should throw when RPC returns an error", async () => {
    const mockClient = {
      rpc: async () => ({ data: null, error: { message: "RPC failed" } }),
    };

    await expect(runJanuaryFirstReset(mockClient)).rejects.toThrow(
      "Failed to run january_first_reset: RPC failed",
    );

    await expect(
      runMembershipStatusProcessing(mockClient, new Date()),
    ).rejects.toThrow("Failed to run process_membership_statuses: RPC failed");
  });
});

describeIfDb("january_first_reset RPC - happy flows", () => {
  const createdMemberIds: string[] = [];

  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const twoYearsAgo = new Date(now);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const janFirst2027 = new Date("2027-01-01T00:00:00.000Z");
  const janSecond2027 = new Date("2027-01-02T00:00:00.000Z");
  const janFirst2028 = new Date("2028-01-01T00:00:00.000Z");

  beforeAll(() => {
    if (!hasDbEnv) {
      throw new Error(
        "Missing local Supabase env vars for RPC integration tests",
      );
    }
  });

  afterEach(async () => {
    if (createdMemberIds.length === 0) {
      return;
    }

    const supabase = await createAdminClient();
    await supabase
      .from("BusinessMember")
      .delete()
      .in("businessMemberId", [...createdMemberIds]);

    createdMemberIds.length = 0;
  });

  async function createMember(input: {
    joinDate: Date;
    membershipStatus: MembershipStatus;
    membershipExpiryDate?: Date | null;
    lastPaymentDate?: Date | null;
  }) {
    const supabase = await createAdminClient();

    const id = crypto.randomUUID();
    const suffix = id.slice(0, 8);

    const { data, error } = await supabase
      .from("BusinessMember")
      .insert({
        businessMemberId: id,
        businessName: `RPC Test ${suffix}`,
        identifier: `ibc-mem-${suffix}`,
        joinDate: input.joinDate.toISOString(),
        membershipStatus: input.membershipStatus,
        membershipExpiryDate: input.membershipExpiryDate
          ? input.membershipExpiryDate.toISOString()
          : null,
        lastPaymentDate: input.lastPaymentDate
          ? input.lastPaymentDate.toISOString()
          : null,
        websiteURL: "https://example.com",
        sectorId: 1,
      })
      .select("businessMemberId, membershipStatus")
      .single();

    if (error) {
      throw new Error(`Failed to create test member: ${error.message}`);
    }

    createdMemberIds.push(data.businessMemberId);
    return data.businessMemberId;
  }

  async function getStatus(businessMemberId: string) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("BusinessMember")
      .select("membershipStatus")
      .eq("businessMemberId", businessMemberId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch member status: ${error.message}`);
    }

    return data.membershipStatus;
  }

  it("moves expired paid members to unpaid with next Jan 1 expiry", async () => {
    const memberId = await createMember({
      joinDate: sixMonthsAgo,
      membershipStatus: "paid",
      membershipExpiryDate: new Date("2027-01-01T00:00:00.000Z"),
    });

    const supabase = await createAdminClient();
    await runMembershipStatusProcessing(supabase, janSecond2027);

    const { data, error } = await supabase
      .from("BusinessMember")
      .select("membershipStatus, membershipExpiryDate")
      .eq("businessMemberId", memberId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch member: ${error.message}`);
    }

    expect(data.membershipStatus).toBe("unpaid");
    expect(data.membershipExpiryDate).toBe("2028-01-01T00:00:00+00:00");
  });

  it("keeps paid members unchanged when expiry is exactly at reference time", async () => {
    const memberId = await createMember({
      joinDate: sixMonthsAgo,
      membershipStatus: "paid",
      membershipExpiryDate: janFirst2027,
    });

    const supabase = await createAdminClient();
    await runMembershipStatusProcessing(supabase, janFirst2027);

    const status = await getStatus(memberId);
    expect(status).toBe("paid");
  });

  it("cancels unpaid members when expiry has already passed", async () => {
    const memberId = await createMember({
      joinDate: twoYearsAgo,
      membershipStatus: "unpaid",
      membershipExpiryDate: janFirst2027,
    });

    const supabase = await createAdminClient();
    await runMembershipStatusProcessing(supabase, janSecond2027);

    const status = await getStatus(memberId);
    expect(status).toBe("cancelled");
  });

  it("supports annual Jan 1 simulation regardless of current clock", async () => {
    const memberId = await createMember({
      joinDate: twoYearsAgo,
      membershipStatus: "paid",
      membershipExpiryDate: janFirst2027,
      lastPaymentDate: janFirst2028,
    });

    const supabase = await createAdminClient();

    const { error: forcedExpiryError } = await supabase
      .from("BusinessMember")
      .update({ membershipExpiryDate: janFirst2027.toISOString() })
      .eq("businessMemberId", memberId);

    if (forcedExpiryError) {
      throw new Error(
        `Failed to force test expiry date: ${forcedExpiryError.message}`,
      );
    }

    await runMembershipStatusProcessing(supabase, janSecond2027);

    const status = await getStatus(memberId);
    expect(status).toBe("unpaid");
  });

  it("keeps january_first_reset wrapper operational", async () => {
    const memberId = await createMember({
      joinDate: twoYearsAgo,
      membershipStatus: "paid",
      membershipExpiryDate: new Date("2025-01-01T00:00:00.000Z"),
    });

    const supabase = await createAdminClient();
    await runJanuaryFirstReset(supabase);

    const status = await getStatus(memberId);
    expect(status).toBe("unpaid");
  });
});
