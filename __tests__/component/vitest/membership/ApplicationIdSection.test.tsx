import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApplicationIdSection } from "@/app/membership/application/success/_components/ApplicationIdSection";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ApplicationIdSection", () => {
  it("should render the application ID", () => {
    render(<ApplicationIdSection identifier="APP-001" />);

    expect(screen.getByText("APP-001")).toBeInTheDocument();
  });

  it("should render the section title", () => {
    render(<ApplicationIdSection identifier="APP-001" />);

    expect(screen.getByText("Your Application ID")).toBeInTheDocument();
  });

  it("should render the Copy button", () => {
    render(<ApplicationIdSection identifier="APP-001" />);

    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("should change button text to Copied on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const user = userEvent.setup();
    render(<ApplicationIdSection identifier="APP-001" />);

    await user.click(screen.getByRole("button", { name: /copy/i }));

    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("should render with empty identifier", () => {
    render(<ApplicationIdSection identifier="" />);

    expect(screen.getByText("Your Application ID")).toBeInTheDocument();
  });

  it("should show helper text", () => {
    render(<ApplicationIdSection identifier="APP-001" />);

    expect(
      screen.getByText("Use this ID to check your status anytime."),
    ).toBeInTheDocument();
  });
});
