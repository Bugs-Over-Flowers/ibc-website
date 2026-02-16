import "server-only";

import { memberDetailCodec } from "@/lib/security/memberDetailsCodec";
import { decryptMemberDetailCompat } from "@/lib/security/memberDetailsCodecCompat";

type ApplicationMemberDetailFields = {
  companyDesignation: string;
  emailAddress: string;
  faxNumber: string;
  firstName: string;
  landline: string;
  lastName: string;
  mailingAddress: string;
  mobileNumber: string;
  nationality: string;
  sex: string;
};

export function encryptApplicationMemberDetails<
  T extends ApplicationMemberDetailFields,
>(member: T): T {
  return {
    ...member,
    firstName: memberDetailCodec.decode(member.firstName),
    lastName: memberDetailCodec.decode(member.lastName),
    mailingAddress: memberDetailCodec.decode(member.mailingAddress),
    sex: memberDetailCodec.decode(member.sex),
    nationality: memberDetailCodec.decode(member.nationality),
    companyDesignation: memberDetailCodec.decode(member.companyDesignation),
    landline: memberDetailCodec.decode(member.landline),
    faxNumber: memberDetailCodec.decode(member.faxNumber),
    mobileNumber: memberDetailCodec.decode(member.mobileNumber),
    emailAddress: memberDetailCodec.decode(member.emailAddress),
  };
}

export function decryptApplicationMemberDetailsCompat<
  T extends ApplicationMemberDetailFields,
>(member: T): T {
  return {
    ...member,
    firstName: decryptMemberDetailCompat(member.firstName),
    lastName: decryptMemberDetailCompat(member.lastName),
    mailingAddress: decryptMemberDetailCompat(member.mailingAddress),
    sex: decryptMemberDetailCompat(member.sex),
    nationality: decryptMemberDetailCompat(member.nationality),
    companyDesignation: decryptMemberDetailCompat(member.companyDesignation),
    landline: decryptMemberDetailCompat(member.landline),
    faxNumber: decryptMemberDetailCompat(member.faxNumber),
    mobileNumber: decryptMemberDetailCompat(member.mobileNumber),
    emailAddress: decryptMemberDetailCompat(member.emailAddress),
  };
}
