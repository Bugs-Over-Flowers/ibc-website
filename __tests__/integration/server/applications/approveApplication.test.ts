import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * ============================================================================
 * INTEGRATION TESTS: approveApplication Server Action
 * ============================================================================
 *
 * Tests the server action that approves a membership application,
 * creates a BusinessMember record via RPC, and sends a decision email.
 */

// --- Module Mocks ---

const mockSingle = vi.fn();
const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createActionClient: vi.fn(async () => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

const mockSendEmail = vi.fn();
vi.mock("@/server/emails/mutations/sendApplicationDecisionEmail", () => ({
  sendApplicationDecisionEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

const { approveApplication } = await import(
  "@/server/applications/mutations/approveApplication"
);

describe("approveApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: successful application fetch
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });
  });

  // ✅ HAPPY FLOW: Successfully approve application
  it("should approve application, call RPC, and send email", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        applicationId: "app-001",
        companyName: "Acme Technologies",
        emailAddress: "admin@acme.example.com",
        applicationType: "newMember",
        businessMemberId: null,
        sectorId: 1,
        ApplicationMember: [{ emailAddress: "john@acme.example.com" }],
      },
      error: null,
    });

    mockRpc.mockResolvedValueOnce({
      data: {
        business_member_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        message: "Application approved",
      },
      error: null,
    });

    mockSendEmail.mockResolvedValueOnce([null]);

    const result = await approveApplication({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "approve",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Application approved");
    expect(result.businessMemberId).toBe(
      "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    );
    expect(mockRpc).toHaveBeenCalledWith("approve_membership_application", {
      p_application_id: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@acme.example.com",
        decision: "approved",
      }),
    );
  });

  // ✅ HAPPY FLOW: Revalidates paths and updates cache tags after approval
  it("should revalidate application and members paths", async () => {
    const { revalidatePath, updateTag } = await import("next/cache");

    mockSingle.mockResolvedValueOnce({
      data: {
        applicationId: "app-001",
        companyName: "Acme",
        emailAddress: "admin@acme.example.com",
        applicationType: "newMember",
        businessMemberId: null,
        sectorId: 1,
        ApplicationMember: [],
      },
      error: null,
    });

    mockRpc.mockResolvedValueOnce({
      data: {
        business_member_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        message: "ok",
      },
      error: null,
    });

    mockSendEmail.mockResolvedValueOnce([null]);

    await approveApplication({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "approve",
    });

    expect(updateTag).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/admin/application");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/members");
  });

  // ❌ ERROR FLOW: Invalid action type for approve
  it("should throw when action is not 'approve'", async () => {
    await expect(
      approveApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "reject",
      }),
    ).rejects.toThrow("Invalid action for approval");
  });

  // ❌ ERROR FLOW: Application already approved (businessMemberId exists)
  it("should throw when application has already been approved", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        applicationId: "app-001",
        companyName: "Acme",
        emailAddress: "admin@acme.example.com",
        applicationType: "newMember",
        businessMemberId: "bm-existing-001", // Already approved
        sectorId: 1,
        ApplicationMember: [],
      },
      error: null,
    });

    await expect(
      approveApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "approve",
      }),
    ).rejects.toThrow("Application has already been approved");
  });

  // ❌ ERROR FLOW: Missing sectorId
  it("should throw when sectorId is missing from application", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        applicationId: "app-001",
        companyName: "Acme",
        emailAddress: "admin@acme.example.com",
        applicationType: "newMember",
        businessMemberId: null,
        sectorId: null, // Missing
        ApplicationMember: [],
      },
      error: null,
    });

    await expect(
      approveApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "approve",
      }),
    ).rejects.toThrow("Sector ID is required");
  });

  // ❌ ERROR FLOW: Application fetch fails
  it("should throw when application cannot be fetched", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Application not found" },
    });

    await expect(
      approveApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "approve",
      }),
    ).rejects.toThrow("Failed to fetch application");
  });

  // ❌ ERROR FLOW: RPC call fails
  it("should throw when RPC approve call fails", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        applicationId: "app-001",
        companyName: "Acme",
        emailAddress: "admin@acme.example.com",
        applicationType: "newMember",
        businessMemberId: null,
        sectorId: 1,
        ApplicationMember: [],
      },
      error: null,
    });

    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: "RPC function failed" },
    });

    await expect(
      approveApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "approve",
      }),
    ).rejects.toThrow("Failed to approve application");
  });

  // ❌ ERROR FLOW: Email sending fails
  it("should throw when email sending fails", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        applicationId: "app-001",
        companyName: "Acme",
        emailAddress: "admin@acme.example.com",
        applicationType: "newMember",
        businessMemberId: null,
        sectorId: 1,
        ApplicationMember: [],
      },
      error: null,
    });

    mockRpc.mockResolvedValueOnce({
      data: {
        business_member_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        message: "ok",
      },
      error: null,
    });

    mockSendEmail.mockResolvedValueOnce(["Failed to send email"]);

    await expect(
      approveApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "approve",
      }),
    ).rejects.toThrow("Failed to send email");
  });

  // ❌ ERROR FLOW: Missing email address
  it("should throw when applicant email is missing", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        applicationId: "app-001",
        companyName: "Acme",
        emailAddress: null,
        applicationType: "newMember",
        businessMemberId: null,
        sectorId: 1,
        ApplicationMember: [{ emailAddress: null }],
      },
      error: null,
    });

    await expect(
      approveApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "approve",
      }),
    ).rejects.toThrow("Applicant email is missing");
  });

  // ❌ ERROR FLOW: Invalid applicationId (not a UUID)
  it("should throw on invalid applicationId format", async () => {
    await expect(
      approveApplication({
        applicationId: "not-a-uuid",
        action: "approve",
      }),
    ).rejects.toThrow(); // Zod validation error
  });

  // ✅ HAPPY FLOW: Uses ApplicationMember email as fallback
  it("should use ApplicationMember email when primary email is null", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        applicationId: "app-001",
        companyName: "Acme",
        emailAddress: null,
        applicationType: "newMember",
        businessMemberId: null,
        sectorId: 1,
        ApplicationMember: [{ emailAddress: "fallback@acme.example.com" }],
      },
      error: null,
    });

    mockRpc.mockResolvedValueOnce({
      data: {
        business_member_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        message: "ok",
      },
      error: null,
    });

    mockSendEmail.mockResolvedValueOnce([null]);

    const result = await approveApplication({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "approve",
    });

    expect(result.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "fallback@acme.example.com",
      }),
    );
  });
});
