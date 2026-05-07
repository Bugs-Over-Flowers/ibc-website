import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WhatsNextSection } from "@/app/membership/application/success/_components/WhatsNextSection";

describe("WhatsNextSection", () => {
  it("should render the heading", () => {
    render(<WhatsNextSection />);

    expect(screen.getByText("What Happens Next")).toBeInTheDocument();
  });

  it("should render review step", () => {
    render(<WhatsNextSection />);

    expect(screen.getByText("Review in Progress")).toBeInTheDocument();
    expect(
      screen.getByText("Our team is now validating your application details."),
    ).toBeInTheDocument();
  });

  it("should render email update step", () => {
    render(<WhatsNextSection />);

    expect(screen.getByText("Email Update")).toBeInTheDocument();
    expect(
      screen.getByText("You will receive the result and next steps by email."),
    ).toBeInTheDocument();
  });

  it("should render two timeline steps", () => {
    render(<WhatsNextSection />);

    const steps = ["Review in Progress", "Email Update"];
    for (const step of steps) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });
});
