import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Step4Review } from "@/app/membership/application/_components/forms/Step4Review";

const mockRep = {
  companyMemberType: "principal",
  firstName: "Juan",
  lastName: "Dela Cruz",
  emailAddress: "juan@example.com",
  companyDesignation: "CEO",
  birthdate: new Date("1990-01-01"),
  sex: "male",
  nationality: "Filipino",
  mailingAddress: "123 Rizal St, Manila",
  mobileNumber: "09171234567",
  landline: "(02) 1234-5678",
};

const mockApplicationData = {
  step1: {
    applicationType: "newMember",
    businessMemberIdentifier: "",
    businessMemberId: "",
  },
  step2: {
    companyName: "Acme Corp",
    companyAddress: "123 Business Rd",
    sectorId: "1",
    landline: "(02) 1234-5678",
    mobileNumber: "09171234567",
    emailAddress: "info@acme.example.com",
    websiteURL: "https://acme.example.com",
    logoImageURL: "https://example.com/logo.png",
    logoImage: undefined,
  },
  step3: {
    representatives: [
      mockRep,
      {
        ...mockRep,
        companyMemberType: "alternate",
        firstName: "Maria",
        lastName: "Santos",
        mobileNumber: "09179876543",
      },
    ],
  },
  step4: {
    applicationMemberType: "corporate",
    paymentMethod: "ONSITE",
    paymentProofUrl: "",
  },
};

const mockSectors = [{ sectorId: 1, sectorName: "Technology" }];

const mockForm = {
  state: {
    values: { applicationMemberType: "corporate", paymentMethod: "ONSITE" },
  },
  fields: {},
  handleSubmit: () => {},
  reset: () => {},
  store: { getState: () => ({ values: {} }) },
} as never;

describe("Step4Review", () => {
  it("should render company profile section", () => {
    render(
      <Step4Review
        applicationData={mockApplicationData}
        form={mockForm}
        sectors={mockSectors}
      />,
    );

    expect(screen.getByText("Company Profile")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("should render application type formatted from enum", () => {
    render(
      <Step4Review
        applicationData={mockApplicationData}
        form={mockForm}
        sectors={mockSectors}
      />,
    );

    expect(screen.getByText("New Member")).toBeInTheDocument();
  });

  it("should render industry sector", () => {
    render(
      <Step4Review
        applicationData={mockApplicationData}
        form={mockForm}
        sectors={mockSectors}
      />,
    );

    expect(screen.getByText("Technology")).toBeInTheDocument();
  });

  it("should render contact information section", () => {
    render(
      <Step4Review
        applicationData={mockApplicationData}
        form={mockForm}
        sectors={mockSectors}
      />,
    );

    expect(screen.getByText("Contact Information")).toBeInTheDocument();
    expect(screen.getByText("info@acme.example.com")).toBeInTheDocument();
    expect(screen.getAllByText("09171234567").length).toBeGreaterThan(0);
  });

  it("should render representatives section", () => {
    render(
      <Step4Review
        applicationData={mockApplicationData}
        form={mockForm}
        sectors={mockSectors}
      />,
    );

    expect(screen.getByText("Representatives")).toBeInTheDocument();
    expect(screen.getByText("Juan Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Principal")).toBeInTheDocument();
    expect(screen.getByText("Alternate")).toBeInTheDocument();
  });

  it("should render company logo", () => {
    render(
      <Step4Review
        applicationData={mockApplicationData}
        form={mockForm}
        sectors={mockSectors}
      />,
    );

    const image = screen.getByAltText("Company logo");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src");
  });

  it("should show 'No logo' when no logo provided", () => {
    const noLogoData = {
      ...mockApplicationData,
      step2: {
        ...mockApplicationData.step2,
        logoImageURL: "",
        logoImage: undefined,
      },
    };

    render(
      <Step4Review
        applicationData={noLogoData}
        form={mockForm}
        sectors={mockSectors}
      />,
    );

    expect(screen.getByText("No logo")).toBeInTheDocument();
  });
});
