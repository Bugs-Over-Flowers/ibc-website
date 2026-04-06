import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * ============================================================================
 * INTEGRATION TESTS: updateMembershipStatus Server Action
 * ============================================================================
 *
 * Tests the server action that updates membership status for selected members.
 * Mocks Supabase and Next.js server modules to isolate business logic.
 */

// --- Module Mocks ---

const mockUpdate = vi.fn().mockReturnThis();
const mockIn = vi.fn().mockReturnThis();
const mockSelect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createActionClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      update: mockUpdate,
      in: (...args: unknown[]) => {
        mockIn(...args);
        return { select: mockSelect };
      },
    })),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Must use dynamic import so mocks are resolved first
const { updateMembershipStatus } = await import(
  "@/server/members/mutations/manualUpdateMembershipStatus"
);

describe("updateMembershipStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ HAPPY FLOW: Successfully update single member status to "paid"
  it("should update a single member status to paid", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [{ businessMemberId: "bm-001" }],
      error: null,
    });

    const result = await updateMembershipStatus({
      memberIds: ["bm-001"],
      status: "paid",
    });

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(1);
    expect(result.message).toContain("1 member(s)");
    expect(result.message).toContain("paid");
    expect(mockUpdate).toHaveBeenCalledWith({ membershipStatus: "paid" });
  });

  // ✅ HAPPY FLOW: Successfully update multiple members
  it("should update multiple members status to unpaid", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        { businessMemberId: "bm-001" },
        { businessMemberId: "bm-002" },
        { businessMemberId: "bm-003" },
      ],
      error: null,
    });

    const result = await updateMembershipStatus({
      memberIds: ["bm-001", "bm-002", "bm-003"],
      status: "unpaid",
    });

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(3);
    expect(result.message).toContain("3 member(s)");
  });

  // ✅ HAPPY FLOW: Update status to "cancelled"
  it("should update member status to cancelled", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [{ businessMemberId: "bm-001" }],
      error: null,
    });

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

  // ❌ ERROR FLOW: Supabase returns error
  it("should throw error when Supabase update fails", async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: "Database connection failed" },
    });

    await expect(
      updateMembershipStatus({
        memberIds: ["bm-001"],
        status: "paid",
      }),
    ).rejects.toThrow("Failed to update membership status");
  });

  // ✅ HAPPY FLOW: Revalidates admin members path after update
  it("should revalidate /admin/members path after successful update", async () => {
    const { revalidatePath } = await import("next/cache");

    mockSelect.mockResolvedValueOnce({
      data: [{ businessMemberId: "bm-001" }],
      error: null,
    });

    await updateMembershipStatus({
      memberIds: ["bm-001"],
      status: "paid",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/admin/members");
  });
});
