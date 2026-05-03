import { describe, expect, it } from "vitest";
import { MembershipApplicationSchema } from "@/lib/validation/membership/application";

const validInput = {
  applicationType: "newMember" as const,
  applicationMemberType: "corporate" as const,
  companyName: "Integration Test Corp",
  sectorName: "Technology",
  companyAddress: "123 Test St",
  websiteURL: "https://test.example.com",
  emailAddress: "test@example.com",
  landline: "(02) 1234-5678",
  mobileNumber: "09171234567",
  logoImageURL: "https://example.com/logo.png",
  representatives: [
    {
      companyMemberType: "principal" as const,
      firstName: "Juan",
      lastName: "Dela Cruz",
      emailAddress: "juan@example.com",
      companyDesignation: "CEO",
      birthdate: new Date("1990-01-01"),
      sex: "male" as const,
      nationality: "Filipino",
      mailingAddress: "123 Rizal St",
      mobileNumber: "09171234567",
      landline: "(02) 1234-5678",
    },
    {
      companyMemberType: "alternate" as const,
      firstName: "Maria",
      lastName: "Santos",
      emailAddress: "maria@example.com",
      companyDesignation: "COO",
      birthdate: new Date("1992-06-15"),
      sex: "female" as const,
      nationality: "Filipino",
      mailingAddress: "456 Mabini St",
      mobileNumber: "09179876543",
      landline: "(02) 9876-5432",
    },
  ],
  paymentMethod: "ONSITE" as const,
};

// ---------------------------------------------------------------------------
// MembershipApplicationSchema validation (used by submitApplication server action)
// ---------------------------------------------------------------------------
describe("submitApplication - input validation", () => {
  it("should accept valid new member submission", () => {
    const result = MembershipApplicationSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it("should accept valid renewal submission with businessMemberId", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validInput,
      applicationType: "renewal",
      businessMemberId: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result.success).toBe(true);
  });

  it("should accept valid update info submission", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validInput,
      applicationType: "updating",
      businessMemberId: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result.success).toBe(true);
  });

  it("should accept BPI payment with proof URL", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validInput,
      paymentMethod: "BPI",
      paymentProofUrl: "https://example.com/proof.png",
    });

    expect(result.success).toBe(true);
  });

  it("should reject missing companyName", () => {
    const { companyName, ...rest } = validInput;
    const result = MembershipApplicationSchema.safeParse(rest);

    expect(result.success).toBe(false);
  });

  it("should reject BPI without proof", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validInput,
      paymentMethod: "BPI",
    });

    expect(result.success).toBe(false);
  });

  it("should reject single representative", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validInput,
      representatives: [validInput.representatives[0]],
    });

    expect(result.success).toBe(false);
  });

  it("should reject invalid mobile number", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validInput,
      mobileNumber: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("should reject missing sectorName", () => {
    const { sectorName, ...rest } = validInput;
    const result = MembershipApplicationSchema.safeParse(rest);

    expect(result.success).toBe(false);
  });
});
