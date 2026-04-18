import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * ============================================================================
 * INTEGRATION TESTS: updateMembershipStatus Server Action
 * ============================================================================
 *
 * Tests the server action that updates membership status for selected members.
 * Mocks Supabase, Next.js server modules, and email notification service.
 * Validates transition detection and email summary behavior.
 */

// --- Module Mocks ---

let selectCallCount = 0;
const mockUpdate = vi.fn().mockReturnThis();
const mockIn = vi.fn().mockReturnThis();

interface MockResponse {
  data: Array<{
    businessMemberId: string;
    businessName: string;
    membershipStatus: string;
  }> | null;
  error: { message: string } | null;
}

const mockSelect = vi.fn(async (): Promise<MockResponse> => {
  selectCallCount++;

  // First .select().in() call: pre-fetch beforeRows
  if (selectCallCount === 1) {
    return {
      data: [
        {
          businessMemberId: "bm-001",
          businessName: "Business 1",
          membershipStatus: "unpaid",
        },
        {
          businessMemberId: "bm-002",
          businessName: "Business 2",
          membershipStatus: "unpaid",
        },
      ],
      error: null,
    };
  }

  // Second .update().in().select() call: post-update data
  if (selectCallCount === 2) {
    return {
      data: [
        {
          businessMemberId: "bm-001",
          businessName: "Business 1",
          membershipStatus: "paid",
        },
        {
          businessMemberId: "bm-002",
          businessName: "Business 2",
          membershipStatus: "paid",
        },
      ],
      error: null,
    };
  }

  return {
    data: null,
    error: null,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createActionClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      update: mockUpdate,
      in: (...args: unknown[]) => {
        mockIn(...args);
        return { select: mockSelect };
      },
      select: mockSelect,
    })),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

vi.mock("@/server/members/mutations/sendMembershipStatusNotifications", () => ({
  sendMembershipStatusNotifications: vi.fn(async () => ({
    transitionedCount: 2,
    attemptedEmails: 2,
    sentEmails: 2,
    failedEmails: 0,
  })),
}));

// Must use dynamic import so mocks are resolved first
const { updateMembershipStatus } = await import(
  "@/server/members/mutations/manualUpdateMembershipStatus"
);

describe("updateMembershipStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectCallCount = 0;
  });

  // ✅ HAPPY FLOW: Successfully update members and send notifications
  it("should update multiple members and return emailSummary with correct shape", async () => {
    const result = await updateMembershipStatus({
      memberIds: ["bm-001", "bm-002"],
      status: "paid",
    });

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(2);
    expect(result.message).toContain("2 member(s)");
    expect(result.message).toContain("paid");

    // Verify emailSummary shape
    expect(result.emailSummary).toBeDefined();
    expect(result.emailSummary).toEqual(
      expect.objectContaining({
        transitionedCount: 2,
        attemptedEmails: 2,
        sentEmails: 2,
        failedEmails: 0,
      }),
    );
  });

  // ✅ HAPPY FLOW: Detect actual status transitions (before !== after)
  it("should only notify on actual status changes", async () => {
    const { sendMembershipStatusNotifications } = await import(
      "@/server/members/mutations/sendMembershipStatusNotifications"
    );

    await updateMembershipStatus({
      memberIds: ["bm-001", "bm-002"],
      status: "paid",
    });

    // Verify transitions were passed to sendMembershipStatusNotifications
    expect(sendMembershipStatusNotifications).toHaveBeenCalled();
    const callArgs = vi.mocked(sendMembershipStatusNotifications).mock
      .calls[0][1];

    // Should have 2 transitions (unpaid -> paid for both members)
    expect(Array.isArray(callArgs)).toBe(true);
    expect(callArgs.length).toBe(2);
    expect(callArgs[0]).toMatchObject({
      businessMemberId: "bm-001",
      businessName: "Business 1",
      previousStatus: "unpaid",
      currentStatus: "paid",
    });
  });

  // ✅ HAPPY FLOW: Update single member status to "paid"
  it("should update a single member status to paid", async () => {
    const result = await updateMembershipStatus({
      memberIds: ["bm-001"],
      status: "paid",
    });

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBeGreaterThan(0);
    expect(mockUpdate).toHaveBeenCalledWith({ membershipStatus: "paid" });
  });

  // ✅ HAPPY FLOW: Update status to "cancelled"
  it("should update member status to cancelled", async () => {
    const result = await updateMembershipStatus({
      memberIds: ["bm-001"],
      status: "cancelled",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("cancelled");
  });

  // ❌ ERROR FLOW: Empty member IDs array
  it("should throw error when memberIds array is empty", async () => {
    await expect(
      updateMembershipStatus({
        memberIds: [],
        status: "paid",
      }),
    ).rejects.toThrow("No members selected");
  });

  // ❌ ERROR FLOW: Missing status
  it("should throw error when status is missing", async () => {
    await expect(
      updateMembershipStatus({
        memberIds: ["bm-001"],
        status: undefined as never,
      }),
    ).rejects.toThrow("Status is required");
  });

  // ❌ ERROR FLOW: Supabase pre-fetch fails
  it("should throw error when loading current member statuses fails", async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: "Database connection failed" },
    } as MockResponse);

    await expect(
      updateMembershipStatus({
        memberIds: ["bm-001"],
        status: "paid",
      }),
    ).rejects.toThrow("Failed to load current member statuses");
  });

  // ❌ ERROR FLOW: Supabase update fails
  it("should throw error when Supabase update fails", async () => {
    // First call succeeds (beforeRows fetch)
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          businessMemberId: "bm-001",
          businessName: "Business 1",
          membershipStatus: "unpaid",
        },
      ],
      error: null,
    } as MockResponse);

    // Second call fails (update)
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: "Update failed" },
    } as MockResponse);

    await expect(
      updateMembershipStatus({
        memberIds: ["bm-001"],
        status: "paid",
      }),
    ).rejects.toThrow("Failed to update membership status");
  });

  // ✅ HAPPY FLOW: Revalidates cache after successful update
  it("should revalidate cache tags and paths after successful update", async () => {
    const { revalidatePath, updateTag } = await import("next/cache");

    await updateMembershipStatus({
      memberIds: ["bm-001", "bm-002"],
      status: "paid",
    });

    expect(updateTag).toHaveBeenCalledWith("members:all");
    expect(updateTag).toHaveBeenCalledWith("members:admin");
    expect(updateTag).toHaveBeenCalledWith("members:public");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/members");
  });
});
