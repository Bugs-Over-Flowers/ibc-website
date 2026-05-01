import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRender = vi.fn();
vi.mock("react-email", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-email")>();
  return {
    ...actual,
    render: (...args: unknown[]) => mockRender(...args),
  };
});

const mockSendEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

const { sendRejectProofOfPayment } = await import(
  "@/server/emails/mutations/sendRejectProofOfPayment"
);

describe("sendRejectProofOfPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the template and sends the rejection email", async () => {
    mockRender.mockResolvedValueOnce("<html><body>Rejected</body></html>");
    mockSendEmail.mockResolvedValueOnce(undefined);

    await sendRejectProofOfPayment({
      toEmail: "registrant@example.com",
      eventTitle: "IBC Annual Summit",
      registrantName: "Jane Doe",
    });

    expect(mockRender).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "registrant@example.com",
      subject: "Payment Rejected: IBC Annual Summit",
      html: "<html><body>Rejected</body></html>",
    });
  });

  it("throws when template rendering fails", async () => {
    mockRender.mockRejectedValueOnce(new Error("Template render failed"));

    await expect(
      sendRejectProofOfPayment({
        toEmail: "registrant@example.com",
        eventTitle: "IBC Annual Summit",
        registrantName: "Jane Doe",
      }),
    ).rejects.toThrow("Template render failed");

    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("throws when provider email send fails", async () => {
    mockRender.mockResolvedValueOnce("<html><body>Rejected</body></html>");
    mockSendEmail.mockRejectedValueOnce(new Error("SMTP unreachable"));

    await expect(
      sendRejectProofOfPayment({
        toEmail: "registrant@example.com",
        eventTitle: "IBC Annual Summit",
        registrantName: "Jane Doe",
      }),
    ).rejects.toThrow("SMTP unreachable");
  });
});
