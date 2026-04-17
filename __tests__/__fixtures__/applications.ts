import type { ApplicationWithMembers } from "@/lib/types/application";

/**
 * Creates a mock application matching the shape returned by `getApplications()`.
 */
export function createMockApplication(
  overrides: Partial<ApplicationWithMembers> = {},
): ApplicationWithMembers {
  const application: ApplicationWithMembers = {
    applicationId: "app-001",
    applicationDate: "2025-06-01T10:00:00Z",
    applicationMemberType: "corporate",
    applicationStatus: "new",
    applicationType: "newMember",
    businessMemberId: null,
    companyAddress: "123 Tech St, Iloilo City",
    companyName: "Acme Technologies",
    emailAddress: "admin@acme.example.com",
    identifier: "IBC-2025-001",
    interviewId: null,
    landline: "(033) 123-4567",
    logoImageURL: "https://example.com/logo.png",
    mobileNumber: "+639171234567",
    paymentMethod: "ONSITE",
    paymentProofStatus: "pending",
    sectorId: 1,
    websiteURL: "https://acme.example.com",
    Sector: { sectorId: 1, sectorName: "Technology" },
    ApplicationMember: [
      {
        applicationId: "app-001",
        applicationMemberId: "am-001",
        birthdate: "1990-01-01",
        companyDesignation: "CEO",
        companyMemberType: "principal",
        emailAddress: "john@acme.example.com",
        firstName: "John",
        landline: "",
        lastName: "Doe",
        mailingAddress: "123 Tech St, Iloilo City",
        mobileNumber: "+639171234567",
        nationality: "Filipino",
        sex: "Male",
      },
    ],
    BusinessMember: null,
    ProofImage: [],
    Interview: null,
    ...overrides,
  };

  return application;
}

export const mockApplications: ApplicationWithMembers[] = [
  createMockApplication(),
  createMockApplication({
    applicationId: "app-002",
    companyName: "Beta Finance Corp",
    emailAddress: "info@beta.example.com",
    applicationStatus: "new",
    applicationType: "renewal",
    paymentMethod: "BPI",
    paymentProofStatus: "pending",
    sectorId: 2,
    Sector: { sectorId: 2, sectorName: "Finance" },
    applicationDate: "2025-06-02T10:00:00Z",
  }),
  createMockApplication({
    applicationId: "app-003",
    companyName: "Gamma Healthcare Inc",
    emailAddress: "contact@gamma.example.com",
    applicationStatus: "pending",
    applicationType: "newMember",
    sectorId: 3,
    Sector: { sectorId: 3, sectorName: "Healthcare" },
    applicationDate: "2025-05-20T10:00:00Z",
  }),
  createMockApplication({
    applicationId: "app-004",
    companyName: "Delta Manufacturing",
    emailAddress: "admin@delta.example.com",
    applicationStatus: "approved",
    applicationType: "updating",
    sectorId: 4,
    Sector: { sectorId: 4, sectorName: "Manufacturing" },
    applicationDate: "2025-04-15T10:00:00Z",
  }),
  createMockApplication({
    applicationId: "app-005",
    companyName: "Epsilon Logistics",
    emailAddress: "info@epsilon.example.com",
    applicationStatus: "rejected",
    applicationType: "newMember",
    sectorId: 1,
    Sector: { sectorId: 1, sectorName: "Technology" },
    applicationDate: "2025-04-10T10:00:00Z",
  }),
];
