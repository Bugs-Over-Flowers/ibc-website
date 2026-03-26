import type { Tables } from "@/lib/supabase/db.types";

export type Application = Tables<"Application">;
export type ApplicationMember = Tables<"ApplicationMember">;

export type ApplicationStatus =
  | "pending"
  | "interview_scheduled"
  | "approved"
  | "rejected";

export type MembershipStatus = "paid" | "unpaid" | "cancelled";

export interface ApplicationWithMembers
  extends Omit<Application, "logoImageURL"> {
  ApplicationMember: ApplicationMember[];
  BusinessMember: {
    identifier: string;
    businessMemberId: string;
    businessName: string;
    websiteURL: string;
    joinDate: string;
    membershipStatus: MembershipStatus;
    membershipExpiryDate: string | null;
    sectorId: number;
  } | null;
  Sector: {
    sectorId: number;
    sectorName: string;
  };
  ProofImage: {
    proofImageId: string;
    path: string;
  }[];
  Interview: {
    interviewId: string;
    interviewDate: string;
    interviewVenue: string;
    status: "scheduled" | "completed" | "cancelled" | "rescheduled" | null;
  } | null;
  logoImageURL: string | null;
}

export interface ApplicationListItem {
  applicationId: string;
  companyName: string;
  emailAddress: string;
  mobileNumber: string;
  applicationDate: string;
  status: ApplicationStatus;
  interviewDate?: string;
  interviewVenue?: string;
  sectorName: string;
  applicationType: string;
}

export interface MemberListItem {
  businessMemberId: string;
  businessName: string;
  sectorName: string;
  websiteURL: string;
  logoImageURL: string | null;
  joinDate: string;
  membershipStatus: MembershipStatus;
  lastPaymentDate?: string;
}

export interface MeetingDetails {
  interviewDate: string;
  interviewVenue: string;
  applicationIds: string[];
}

export type InterviewDetails = {
  interviewId: string;
  interviewDate: string;
  interviewVenue: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  createdAt: string;
};

export type ApplicationStatusResponse = {
  applicationId: string;
  identifier: string;
  applicationStatus: "new" | "pending" | "approved" | "rejected";
  applicationDate: string;
  companyName: string;
  hasInterview: boolean;
  interview: InterviewDetails | null;
};
