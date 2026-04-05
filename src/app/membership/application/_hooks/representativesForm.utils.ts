import type { MembershipApplicationStep3Schema } from "@/lib/validation/membership/application";

type Representative =
  MembershipApplicationStep3Schema["representatives"][number];

const emptyPrincipalRepresentative: Representative = {
  companyMemberType: "principal",
  firstName: "",
  lastName: "",
  mailingAddress: "",
  sex: "male",
  nationality: "",
  birthdate: undefined as unknown as Date,
  companyDesignation: "",
  landline: "",
  mobileNumber: "",
  emailAddress: "",
};

const emptyAlternateRepresentative: Representative = {
  companyMemberType: "alternate",
  firstName: "",
  lastName: "",
  mailingAddress: "",
  sex: "male",
  nationality: "",
  birthdate: undefined as unknown as Date,
  companyDesignation: "",
  landline: "",
  mobileNumber: "",
  emailAddress: "",
};

export function getNormalizedRepresentatives(
  representatives?: Representative[],
): Representative[] {
  return [
    {
      ...emptyPrincipalRepresentative,
      ...(representatives?.[0] ?? {}),
      companyMemberType: "principal",
    },
    {
      ...emptyAlternateRepresentative,
      ...(representatives?.[1] ?? {}),
      companyMemberType: "alternate",
    },
  ];
}

export function enforceRepresentativeOrder(
  representatives: Representative[],
): Representative[] {
  return representatives.slice(0, 2).map((rep, index) => ({
    ...rep,
    companyMemberType: (index === 0 ? "principal" : "alternate") as
      | "principal"
      | "alternate",
  }));
}
