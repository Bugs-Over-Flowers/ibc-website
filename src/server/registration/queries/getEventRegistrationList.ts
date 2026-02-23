import "server-only";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";
import {
  type RegistrationItem,
  RegistrationListRPCSchema,
} from "@/lib/validation/registration-management";
import { PaymentProofStatusEnum } from "@/lib/validation/utils";

interface GetRegistrationListParams {
  eventId: string;
  searchString?: string;
  paymentProofStatus?: typeof PaymentProofStatusEnum;
  limit?: number;
}

export const getEventRegistrationList = async (
  requestCookies: RequestCookie[],
  {
    eventId,
    searchString,
    paymentProofStatus,
    limit,
  }: GetRegistrationListParams,
): Promise<RegistrationItem[]> => {
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.registrations.all);
  cacheTag(CACHE_TAGS.registrations.list);
  cacheTag(CACHE_TAGS.registrations.event);
  const supabase = await createClient(requestCookies);

  let query = supabase.rpc("get_registration_list", {
    p_event_id: eventId,
    p_search_text: searchString,
    p_payment_proof_status: paymentProofStatus
      ? PaymentProofStatusEnum.parse(paymentProofStatus)
      : undefined,
  });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch registration list");
  }

  return RegistrationListRPCSchema.array().parse(data);
};
