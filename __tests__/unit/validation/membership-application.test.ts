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
  sectorId: 1,
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

  it("should accept renewal with identifier", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "renewal",
      businessMemberIdentifier: "ibc-mem-abc123",
    });
    expect(result.success).toBe(true);
  });

  it("should accept updating with identifier", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "updating",
      businessMemberIdentifier: "ibc-mem-abc123",
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid UUID for businessMemberId", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "renewal",
      businessMemberIdentifier: "ibc-mem-abc123",
      businessMemberId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it("should accept empty string UUID as undefined", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "newMember",
      businessMemberId: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject renewal without identifier", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "renewal",
    });
    expect(result.success).toBe(false);
    const issues = result.error?.issues.map((i) => i.path.join(".")) ?? [];
    expect(issues).toContain("businessMemberIdentifier");
  });

  it("should reject updating without identifier", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "updating",
    });
    expect(result.success).toBe(false);
  });

  it.each([
    "",
    "   ",
  ])("should reject renewal with blank identifier %j", (value) => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "renewal",
      businessMemberIdentifier: value,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid applicationType", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-UUID businessMemberId", () => {
    const result = MembershipApplicationStep1Schema.safeParse({
      applicationType: "renewal",
      businessMemberIdentifier: "ibc-mem-abc123",
      businessMemberId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MembershipApplicationStep2Schema
// ---------------------------------------------------------------------------
describe("MembershipApplicationStep2Schema", () => {
  it("should accept valid company data", () => {
    const result = MembershipApplicationStep2Schema.safeParse(validStep2);
    expect(result.success).toBe(true);
  });

  it("should titleCase companyName on parse", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      companyName: "acme corp",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.companyName).toBe("Acme Corp");
    }
  });

  it("should accept logo via URL without file", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      logoImage: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("should accept logo via file without URL", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      logoImageURL: "",
      logoImage: new File(["fake"], "logo.png", { type: "image/png" }),
    });
    expect(result.success).toBe(true);
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

  it("should reject invalid sectorId (zero)", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      sectorId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid sectorId (NaN string)", () => {
    const result = MembershipApplicationStep2Schema.safeParse({
      ...validStep2,
      sectorId: "abc",
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

  it("should reject single representative", () => {
    const result = MembershipApplicationStep3Schema.safeParse({
      representatives: [validRep],
    });
    expect(result.success).toBe(false);
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

  it("should reject single representative", () => {
    const result = MembershipApplicationSchema.safeParse({
      ...validFull,
      representatives: [validRep],
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing sectorName", () => {
    const { sectorName, ...rest } = validFull;
    const result = MembershipApplicationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
