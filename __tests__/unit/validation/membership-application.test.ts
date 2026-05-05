import { describe, expect, it } from "vitest";
import {
  MembershipApplicationSchema,
  MembershipApplicationStep1Schema,
  MembershipApplicationStep2Schema,
  MembershipApplicationStep3Schema,
  MembershipApplicationStep4Schema,
} from "@/lib/validation/membership/application";

const validUUID = "550e8400-e29b-41d4-a716-446655440000";
const validMobile = "09171234567";
const validRep = {
  companyMemberType: "principal",
  firstName: "Juan",
  lastName: "Dela Cruz",
  emailAddress: "juan@example.com",
  companyDesignation: "CEO",
  birthdate: new Date("1990-01-01"),
  sex: "male",
  nationality: "Filipino",
  mailingAddress: "123 Rizal St, Manila",
  mobileNumber: validMobile,
  landline: "(02) 1234-5678",
};

const validStep1 = {
  applicationType: "newMember",
};

const validStep2 = {
  companyName: "Acme Corp",
  sectorId: "1",
  companyProfileType: "website",
  companyAddress: "123 Business Rd",
  websiteURL: "https://acme.example.com",
  emailAddress: "info@acme.example.com",
  landline: "(02) 1234-5678",
  mobileNumber: validMobile,
  logoImageURL: "https://example.com/logo.png",
};

const validStep3 = {
  representatives: [validRep, { ...validRep, companyMemberType: "alternate" }],
};

const validStep4 = {
  applicationMemberType: "corporate",
  paymentMethod: "ONSITE",
};

const validFull = {
  ...validStep1,
  ...validStep2,
  ...validStep3,
  ...validStep4,
  sectorName: "Technology",
};

// ---------------------------------------------------------------------------
// MembershipApplicationStep1Schema
// ---------------------------------------------------------------------------
describe("MembershipApplicationStep1Schema", () => {
  it("should accept newMember without identifier", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "newMember",
    });
    expect(result.success).toBe(true);
  });

  it("should accept file type with companyProfileFile", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      companyProfileType: "file",
      companyProfileFile: new File(["fake"], "profile.pdf", {
        type: "application/pdf",
      }),
      websiteURL: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject website type without URL", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      companyProfileType: "website",
      websiteURL: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject file type without file", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      companyProfileType: "file",
      companyProfileFile: undefined,
      websiteURL: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing companyName", () => {
    const { companyName, ...rest } = validStep2;
    const result = MembershipApplicationStep2Schema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      emailAddress: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid mobile number", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      mobileNumber: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("should reject mobile without PH prefix", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      mobileNumber: "1234567890",
    });
    expect(result.success).toBe(false);
  });

  it("should reject when no logo is provided", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      logoImageURL: "",
      logoImage: undefined,
    });
    expect(result.success).toBe(false);
  });

  it("should accept sectorId with value '0' as valid text", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      sectorId: "0",
    });
    expect(result.success).toBe(true);
  });

  it("should accept free-text sectorId for custom sectors", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      sectorId: "Renewable Energy",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty sectorId", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      sectorId: "",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MembershipApplicationStep3Schema
// ---------------------------------------------------------------------------
describe("MembershipApplicationStep3Schema", () => {
  it("should accept two valid representatives", () => {
    const result = MembershipApplicationStep3Schema.safeParse(validStep3);
    expect(result.success).toBe(true);
  });

  it("should apply titleCase transforms", () => {
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [
        {
          ...validRep,
          firstName: "juan",
          lastName: "dela cruz",
          nationality: "filipino",
        },
        { ...validRep, companyMemberType: "alternate", firstName: "maria" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.representatives[0].firstName).toBe("Juan");
      expect(result.data.representatives[0].lastName).toBe("Dela Cruz");
      expect(result.data.representatives[0].nationality).toBe("Filipino");
    }
  });

  it("should accept single representative", () => {
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [validRep],
    });
    expect(result.success).toBe(true);
  });

  it("should reject three representatives", () => {
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [
        validRep,
        { ...validRep, companyMemberType: "alternate" },
        validRep,
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty representatives", () => {
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject rep without firstName", () => {
    const { firstName, ...rep } = validRep;
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [rep, { ...validRep, companyMemberType: "alternate" }],
    });
    expect(result.success).toBe(false);
  });

  it("should reject rep with invalid email", () => {
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [
        { ...validRep, emailAddress: "bad" },
        { ...validRep, companyMemberType: "alternate" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject rep with invalid mobile", () => {
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [
        { ...validRep, mobileNumber: "abc" },
        { ...validRep, companyMemberType: "alternate" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid sex value", () => {
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [
        { ...validRep, sex: "other" },
        { ...validRep, companyMemberType: "alternate" },
      ],
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MembershipApplicationStep4Schema
// ---------------------------------------------------------------------------
describe("MembershipApplicationStep4Schema", () => {
  it("should accept ONSITE payment without proof", () => {
    const result = MembershipApplicationStep4Schema.safeParse(validStep4);
    expect(result.success).toBe(true);
  });

  it("should accept BPI with proof URL", () => {
    const result = MembershipApplicationStep4Schema.safeParse({
      ...validStep4,
      paymentMethod: "BPI",
      paymentProofUrl: "https://example.com/proof.png",
    });
    expect(result.success).toBe(true);
  });

  it("should accept BPI with proof file", () => {
    const result = MembershipApplicationStep4Schema.safeParse({
      ...validStep4,
      paymentMethod: "BPI",
      paymentProof: new File(["fake"], "proof.png", { type: "image/png" }),
    });
    expect(result.success).toBe(true);
  });

  it("should reject BPI without any proof", () => {
    const result = MembershipApplicationStep4Schema.safeParse({
      ...validStep4,
      paymentMethod: "BPI",
    });
    expect(result.success).toBe(false);
  });

  it.each([
    "corporate",
    "personal",
  ] as const)("should accept %s member type", (type) => {
    const result = MembershipApplicationStep4Schema.safeParse({
      ...validStep4,
      applicationMemberType: type,
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid applicationMemberType", () => {
    const result = MembershipApplicationStep4Schema.safeParse({
      ...validStep4,
      applicationMemberType: "invalid",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MembershipApplicationSchema (full submission)
// ---------------------------------------------------------------------------
describe("MembershipApplicationSchema", () => {
  it("should accept complete valid submission", () => {
    const result = MembershipApplicationSchema.safeParse(validFull);
    expect(result.success).toBe(true);
  });

  it("should accept BPI with proof URL in full submission", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validFull,
      paymentMethod: "BPI",
      paymentProofUrl: "https://example.com/proof.png",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing companyName", () => {
    const { companyName, ...rest } = validFull;
    const result = MembershipApplicationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("should reject BPI without proof in full submission", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validFull,
      paymentMethod: "BPI",
    });
    expect(result.success).toBe(false);
  });

  it("should accept single representative", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validFull,
      representatives: [validRep],
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing sectorName", () => {
    const { sectorName, ...rest } = validFull;
    const result = MembershipApplicationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
