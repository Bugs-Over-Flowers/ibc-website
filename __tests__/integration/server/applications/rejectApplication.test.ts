import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * ============================================================================
 * INTEGRATION TESTS: rejectApplication Server Action
 * ============================================================================
 *
 * Tests the server action that rejects a membership application,
 * updates its status, and sends a rejection email.
 */

// --- Module Mocks ---

const mockEq = vi.fn();
const mockUpdateResult = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createActionClient: vi.fn(async () => ({
    from: vi.fn((table: string) => {
      if (table === "Application") {
        return {
          update: vi.fn(() => ({
            eq: (...args: unknown[]) => {
              mockEq(...args);
              return mockUpdateResult();
            },
          })),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: mockSingle,
            })),
          })),
        };
      }
      return {};
    }),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockSendEmail = vi.fn();
vi.mock("@/server/emails/mutations/sendApplicationDecisionEmail", () => ({
  sendApplicationDecisionEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

const { rejectApplication } = await import(
  "@/server/applications/mutations/rejectApplication"
);

describe("rejectApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ HAPPY FLOW: Successfully reject application
  it("should reject application and send rejection email", async () => {
    mockUpdateResult.mockReturnValueOnce({ error: null });
    mockSingle.mockResolvedValueOnce({
      data: {
        companyName: "Acme Technologies",
        emailAddress: "admin@acme.example.com",
        ApplicationMember: [],
      },
      error: null,
    });
    mockSendEmail.mockResolvedValueOnce([null]);

    const result = await rejectApplication({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "reject",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Application rejected");
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@acme.example.com",
        decision: "rejected",
      }),
    );
  });

  // ✅ HAPPY FLOW: Reject with optional notes
  it("should pass notes to email when provided", async () => {
    mockUpdateResult.mockReturnValueOnce({ error: null });
    mockSingle.mockResolvedValueOnce({
      data: {
        companyName: "Beta Corp",
        emailAddress: "info@beta.example.com",
        ApplicationMember: [],
      },
      error: null,
    });
    mockSendEmail.mockResolvedValueOnce([null]);

    await rejectApplication({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "reject",
      notes: "Incomplete documentation submitted.",
    });

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: "Incomplete documentation submitted.",
      }),
    );
  });

  // ✅ HAPPY FLOW: Revalidates application path
  it("should revalidate /admin/application path after rejection", async () => {
    const { revalidatePath } = await import("next/cache");

    mockUpdateResult.mockReturnValueOnce({ error: null });
    mockSingle.mockResolvedValueOnce({
      data: {
        companyName: "Acme",
        emailAddress: "admin@acme.example.com",
        ApplicationMember: [],
      },
      error: null,
    });
    mockSendEmail.mockResolvedValueOnce([null]);

    await rejectApplication({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "reject",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/admin/application");
  });

  // ❌ ERROR FLOW: Invalid action type ("approve" instead of "reject")
  it("should throw when action is not 'reject'", async () => {
    await expect(
      rejectApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "approve",
      }),
    ).rejects.toThrow("Invalid action for rejection");
  });

  // ❌ ERROR FLOW: Supabase update fails
  it("should throw when database update fails", async () => {
    mockUpdateResult.mockReturnValueOnce({
      error: { message: "Connection timeout" },
    });

    await expect(
      rejectApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "reject",
      }),
    ).rejects.toThrow("Failed to reject application");
  });

  // ❌ ERROR FLOW: Fetching application details fails after status update
  it("should throw when fetching application details fails after update", async () => {
    mockUpdateResult.mockReturnValueOnce({ error: null });
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Record not found" },
    });

    await expect(
      rejectApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "reject",
      }),
    ).rejects.toThrow("Failed to fetch application");
  });

  // ❌ ERROR FLOW: Missing applicant email
  it("should throw when no email address is available", async () => {
    mockUpdateResult.mockReturnValueOnce({ error: null });
    mockSingle.mockResolvedValueOnce({
      data: {
        companyName: "NoEmail Corp",
        emailAddress: null,
        ApplicationMember: [{ emailAddress: null }],
      },
      error: null,
    });

    await expect(
      rejectApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "reject",
      }),
    ).rejects.toThrow("Applicant email is missing");
  });

  // ❌ ERROR FLOW: Email sending fails
  it("should throw when rejection email fails to send", async () => {
    mockUpdateResult.mockReturnValueOnce({ error: null });
    mockSingle.mockResolvedValueOnce({
      data: {
        companyName: "Acme",
        emailAddress: "admin@acme.example.com",
        ApplicationMember: [],
      },
      error: null,
    });
    mockSendEmail.mockResolvedValueOnce(["SMTP server unreachable"]);

    await expect(
      rejectApplication({
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        action: "reject",
      }),
    ).rejects.toThrow("SMTP server unreachable");
  });

  // ❌ ERROR FLOW: Invalid applicationId format
  it("should throw on invalid applicationId format", async () => {
    await expect(
      rejectApplication({
        applicationId: "invalid-id",
        action: "reject",
      }),
    ).rejects.toThrow(); // Zod validation error
  });

  // ✅ HAPPY FLOW: Uses ApplicationMember email as fallback
  it("should use ApplicationMember email when primary is null", async () => {
    mockUpdateResult.mockReturnValueOnce({ error: null });
    mockSingle.mockResolvedValueOnce({
      data: {
        companyName: "Gamma Inc",
        emailAddress: null,
        ApplicationMember: [{ emailAddress: "contact@gamma.example.com" }],
      },
      error: null,
    });
    mockSendEmail.mockResolvedValueOnce([null]);

    const result = await rejectApplication({
      applicationId: "123e4567-e89b-12d3-a456-426614174000",
      action: "reject",
    });

    expect(result.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "contact@gamma.example.com",
      }),
    );
  });
});
