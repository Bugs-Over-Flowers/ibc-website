import type { Database } from "@/lib/supabase/db.types";

type ApplicationMember =
  Database["public"]["Tables"]["ApplicationMember"]["Row"];

export const mockApplicationMember: ApplicationMember = {
  applicationId: "123e4567-e89b-12d3-a456-426614174000",
  applicationMemberId: "member-001",
  birthdate: "1990-01-01",
  companyDesignation: "CEO",
  companyMemberType: "principal",
  emailAddress: "john.doe@example.com",
  faxNumber: "+632-123-4567",
  firstName: "John",
  landline: "+632-987-6543",
  lastName: "Doe",
  mailingAddress: "123 Main St, Manila",
  mobileNumber: "+639171234567",
  nationality: "Filipino",
  sex: "Male",
};

export const mockApplicationMembers: ApplicationMember[] = [
  mockApplicationMember,
  {
    applicationId: "123e4567-e89b-12d3-a456-426614174001",
    applicationMemberId: "member-002",
    birthdate: "1992-05-15",
    companyDesignation: "CTO",
    companyMemberType: "alternate",
    emailAddress: "jane.smith@example.com",
    faxNumber: "+632-123-4568",
    firstName: "Jane",
    landline: "+632-987-6544",
    lastName: "Smith",
    mailingAddress: "456 Oak Ave, Makati",
    mobileNumber: "+639181234567",
    nationality: "Filipino",
    sex: "Female",
  },
];
