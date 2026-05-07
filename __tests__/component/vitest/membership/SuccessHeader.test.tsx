import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SuccessHeader } from "@/app/membership/application/success/_components/SuccessHeader";

describe("SuccessHeader", () => {
  it("should render the main heading", () => {
    render(<SuccessHeader />);

    expect(screen.getByText("Application Submitted!")).toBeInTheDocument();
  });

  it("should render the subtitle", () => {
    render(<SuccessHeader />);

    expect(
      screen.getByText(
        "Your membership application has been received and is under review",
      ),
    ).toBeInTheDocument();
  });

  it("should render the check circle icon", () => {
    const { container } = render(<SuccessHeader />);

    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
