import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConfirmationSection } from "@/app/membership/application/success/_components/ConfirmationSection";

describe("ConfirmationSection", () => {
  it("should render the heading", () => {
    render(<ConfirmationSection />);

    expect(screen.getByText("Confirmation Email Sent")).toBeInTheDocument();
  });

  it("should render the description", () => {
    render(<ConfirmationSection />);

    expect(
      screen.getByText(
        "We sent your application summary and tracking details to your email.",
      ),
    ).toBeInTheDocument();
  });

  it("should render the mail icon", () => {
    const { container } = render(<ConfirmationSection />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
