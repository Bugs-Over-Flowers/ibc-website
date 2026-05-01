import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSelectEq = vi.fn();
const mockSingle = vi.fn();
const mockUpdateResult = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createActionClient: vi.fn(async () => ({
    from: vi.fn((table: string) => {
      if (table !== "Registration") {
        return {};
      }

      return {
        select: vi.fn(() => ({
          eq: (...args: unknown[]) => {
            mockSelectEq(...args);
            return {
              single: mockSingle,
            };
          },
        })),
        update: vi.fn(() => ({
          eq: (...args: unknown[]) => {
            mockSelectEq(...args);
            return mockUpdateResult();
          },
        })),
      };
    }),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockInvalidateRegistrationCaches = vi.fn();
vi.mock("@/server/actions.utils", () => ({
  invalidateRegistrationCaches: () => mockInvalidateRegistrationCaches(),
}));

const mockSendRejectProofOfPayment = vi.fn();
vi.mock("@/server/emails/mutations/sendRejectProofOfPayment", () => ({
  sendRejectProofOfPayment: (...args: unknown[]) =>
    mockSendRejectProofOfPayment(...args),
}));

const { rejectPayment } = await import(
  "@/server/registration/mutations/rejectPayment"
);

describe("rejectPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateResult.mockReturnValue({ error: null });
  });

  it("rejects payment, sends the rejection email, and revalidates related paths", async () => {
    const { revalidatePath } = await import("next/cache");

    mockSingle.mockResolvedValueOnce({
      data: {
        eventId: "event-123",
        sponsoredRegistrationId: "sponsor-456",
        event: {
          eventTitle: "IBC Annual Summit",
        },
        participants: [
          {
            email: "registrant@example.com",
            firstName: "Jane",
            lastName: "Doe",
            isPrincipal: true,
          },
        ],
      },
      error: null,
    });

    const result = await rejectPayment("registration-001");

    expect(result).toBe("Payment rejected and email sent.");
    expect(mockSendRejectProofOfPayment).toHaveBeenCalledWith({
      toEmail: "registrant@example.com",
      eventTitle: "IBC Annual Summit",
      registrantName: "Jane Doe",
    });
    expect(mockInvalidateRegistrationCaches).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/events/event-123/registration-list",
      "page",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/events/event-123/sponsored-registrations",
      "page",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/events/event-123/sponsored-registrations/sponsor-456",
      "page",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/sponsored-registration",
      "page",
    );
  });

  it("uses a fallback event title when the event relation is missing", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        eventId: "event-789",
        sponsoredRegistrationId: null,
        event: null,
        participants: {
          email: "principal@example.com",
          firstName: "Alex",
          lastName: "Reyes",
          isPrincipal: true,
        },
      },
      error: null,
    });

    await rejectPayment("registration-002");

    expect(mockSendRejectProofOfPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        eventTitle: "Event",
        registrantName: "Alex Reyes",
      }),
    );
  });

  it("throws when the registration cannot be fetched", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Registration not found" },
    });

    await expect(rejectPayment("registration-missing")).rejects.toThrow(
      "Registration not found",
    );
  });

  it("throws when the principal registrant email is missing", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        eventId: "event-123",
        sponsoredRegistrationId: null,
        event: {
          eventTitle: "IBC Annual Summit",
        },
        participants: [
          {
            email: null,
            firstName: "Jane",
            lastName: "Doe",
            isPrincipal: true,
          },
        ],
      },
      error: null,
    });

    await expect(rejectPayment("registration-no-email")).rejects.toThrow(
      "Principal registrant email not found",
    );
  });

  it("throws when updating the payment status fails", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        eventId: "event-123",
        sponsoredRegistrationId: null,
        event: {
          eventTitle: "IBC Annual Summit",
        },
        participants: [
          {
            email: "registrant@example.com",
            firstName: "Jane",
            lastName: "Doe",
            isPrincipal: true,
          },
        ],
      },
      error: null,
    });

    mockUpdateResult.mockReturnValueOnce({
      error: { message: "Update failed" },
    });

    await expect(rejectPayment("registration-update-fails")).rejects.toThrow(
      "Update failed",
    );
  });

  it("throws when the rejection email fails to send", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        eventId: "event-123",
        sponsoredRegistrationId: null,
        event: {
          eventTitle: "IBC Annual Summit",
        },
        participants: [
          {
            email: "registrant@example.com",
            firstName: "Jane",
            lastName: "Doe",
            isPrincipal: true,
          },
        ],
      },
      error: null,
    });

    mockSendRejectProofOfPayment.mockRejectedValueOnce(
      new Error("SMTP unavailable"),
    );

    await expect(rejectPayment("registration-email-fails")).rejects.toThrow(
      "Failed to process rejection email",
    );
  });
});
