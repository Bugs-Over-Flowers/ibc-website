import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SuccessFooterActions } from "@/app/membership/application/success/_components/SuccessFooterActions";

describe("SuccessFooterActions", () => {
  it("should render Back to Home link", () => {
    render(<SuccessFooterActions />);

    const link = screen.getByRole("link", { name: /back to home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("should render Check Application Status link", () => {
    render(<SuccessFooterActions />);

    const link = screen.getByRole("link", {
      name: /check application status/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/membership/check-application-status",
    );
  });

  it("should render both buttons", () => {
    render(<SuccessFooterActions />);

    const buttons = screen.getAllByRole("link");
    expect(buttons).toHaveLength(2);
  });
});
