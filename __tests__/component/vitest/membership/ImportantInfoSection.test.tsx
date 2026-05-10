import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImportantInfoSection } from "@/app/membership/application/success/_components/ImportantInfoSection";

describe("ImportantInfoSection", () => {
  it("should render the heading", () => {
    render(<ImportantInfoSection />);

    expect(screen.getByText("Important Notes")).toBeInTheDocument();
  });

  it("should render review time note", () => {
    render(<ImportantInfoSection />);

    expect(
      screen.getByText(/Typical review time: 5-7 business days/),
    ).toBeInTheDocument();
  });

  it("should render ID keeping note", () => {
    render(<ImportantInfoSection />);

    expect(
      screen.getByText(/Keep your Application ID for status checks/),
    ).toBeInTheDocument();
  });
});
