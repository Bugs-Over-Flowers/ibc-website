import "server-only";

import {
  isEncryptedMemberDetail,
  memberDetailCodec,
} from "@/lib/security/memberDetailsCodec";

export function decryptMemberDetailCompat(value: string): string {
  if (!isEncryptedMemberDetail(value)) {
    return value;
  }

  try {
    return memberDetailCodec.encode(value);
  } catch {
    return value;
  }
}
