import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSingle = vi.fn();
const mockUpdate = vi.fn();
const mockUpdateEq = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createActionClient: vi.fn(async () => ({
    from: vi.fn((table: string) => {
      if (table !== "Registration") {
        return {};
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockSingle,
          })),
        })),
        update: (...args: unknown[]) => {
          mockUpdate(...args);
          return {
            eq: (...eqArgs: unknown[]) => mockUpdateEq(...eqArgs),
          };
        },
      };
    }),
  })),
}));

const mockUpdateTag = vi.fn();
vi.mock("next/cache", () => ({
  updateTag: (...args: unknown[]) => mockUpdateTag(...args),
}));

const { updateRegistrationPaymentProofStatus } = await import(
  "@/server/registration/mutations/updateRegistrationPaymentProofStatus"
);

describe("updateRegistrationPaymentProofStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts pending proof for BPI registration", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        paymentMethod: "BPI",
        paymentProofStatus: "pending",
        ProofImage: [{ proofImageId: "proof-1" }],
      },
      error: null,
    });
    mockUpdateEq.mockResolvedValueOnce({ error: null });

    const result = await updateRegistrationPaymentProofStatus({
      registrationId: "reg-1",
      status: "accepted",
    });

    expect(result).toEqual({
      message: "Payment proof accepted",
      status: "accepted",
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      paymentProofStatus: "accepted",
    });
    expect(mockUpdateTag).toHaveBeenCalled();
  });

  it("rejects pending proof for BPI registration", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        paymentMethod: "BPI",
        paymentProofStatus: "pending",
        ProofImage: [],
      },
      error: null,
    });
    mockUpdateEq.mockResolvedValueOnce({ error: null });

    const result = await updateRegistrationPaymentProofStatus({
      registrationId: "reg-1",
      status: "rejected",
    });

    expect(result).toEqual({
      message: "Payment proof rejected",
      status: "rejected",
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      paymentProofStatus: "rejected",
    });
  });

  it("throws when payment method is not BPI", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        paymentMethod: "ONSITE",
        paymentProofStatus: "pending",
        ProofImage: [],
      },
      error: null,
    });

    await expect(
      updateRegistrationPaymentProofStatus({
        registrationId: "reg-1",
        status: "accepted",
      }),
    ).rejects.toThrow(
      "Payment proof updates are only allowed for BPI payments",
    );
  });

  it("throws when payment proof is not pending", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        paymentMethod: "BPI",
        paymentProofStatus: "accepted",
        ProofImage: [{ proofImageId: "proof-1" }],
      },
      error: null,
    });

    await expect(
      updateRegistrationPaymentProofStatus({
        registrationId: "reg-1",
        status: "rejected",
      }),
    ).rejects.toThrow("Payment proof can only be reviewed while pending");
  });

  it("throws when accepting without uploaded proof", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        paymentMethod: "BPI",
        paymentProofStatus: "pending",
        ProofImage: [],
      },
      error: null,
    });

    await expect(
      updateRegistrationPaymentProofStatus({
        registrationId: "reg-1",
        status: "accepted",
      }),
    ).rejects.toThrow("Cannot accept payment proof without an uploaded image");
  });

  it("throws when update query fails", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        paymentMethod: "BPI",
        paymentProofStatus: "pending",
        ProofImage: [{ proofImageId: "proof-1" }],
      },
      error: null,
    });
    mockUpdateEq.mockResolvedValueOnce({
      error: { message: "Failed to update" },
    });

    await expect(
      updateRegistrationPaymentProofStatus({
        registrationId: "reg-1",
        status: "accepted",
      }),
    ).rejects.toThrow("Failed to update");
  });
});
