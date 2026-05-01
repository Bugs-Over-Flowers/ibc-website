import { render } from "react-email";
import { describe, expect, it } from "vitest";
import PaymentRejectedTemplate from "@/lib/resend/templates/PaymentRejectedTemplate";

describe("PaymentRejectedTemplate", () => {
  it("renders the expected payment rejection content", async () => {
    const html = await render(
      PaymentRejectedTemplate({
        eventTitle: "IBC Annual Summit",
        registrantName: "Jane Doe",
      }),
    );

    expect(html).toContain("Payment Proof Rejected");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("IBC Annual Summit");
    expect(html).toContain(
      "If you have any questions, please reply to this email.",
    );
  });

  it("includes the action required preview text", async () => {
    const html = await render(
      PaymentRejectedTemplate({
        eventTitle: "IBC Annual Summit",
        registrantName: "Jane Doe",
      }),
    );

    expect(html).toContain(
      "Action Required: Payment Rejected for IBC Annual Summit",
    );
  });
});
