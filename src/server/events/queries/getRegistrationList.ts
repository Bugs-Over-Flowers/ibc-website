import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  type RegistrationItem,
  RegistrationListRPCSchema,
  RegistrationListStatsSchema,
} from "@/lib/validation/registration/registration-list";
import { PaymentStatusEnum } from "@/lib/validation/utils";

interface GetRegistrationListParams {
  eventId: string;
  affiliation?: string;
  paymentStatus?: string;
}

export const getRegistrationList = async (
  requestCookies: RequestCookie[],
  { eventId, affiliation, paymentStatus }: GetRegistrationListParams,
): Promise<RegistrationItem[]> => {
  "use cache";
  cacheLife("seconds");
  cacheTag("registration-list-stats");
  const supabase = await createClient(requestCookies);

  const query = await supabase
    .rpc("get_registration_list", {
      p_event_id: eventId,
      p_search_text: affiliation,
      p_payment_status: paymentStatus
        ? PaymentStatusEnum.parse(paymentStatus)
        : undefined,
    })
    .throwOnError();

  return RegistrationListRPCSchema.array().parse(query.data);
};

export const getRegistrationListStats = async (
  requestCookies: RequestCookie[],
  { eventId, affiliation, paymentStatus }: GetRegistrationListParams,
): Promise<{
  total: number;
  verified: number;
  pending: number;
}> => {
  "use cache";
  cacheLife("seconds");
  cacheTag("registration-list-stats");
  const supabase = await createClient(requestCookies);

  const { data } = await supabase
    .rpc("get_registration_stats", {
      p_event_id: eventId,
      p_search_text: affiliation,
      p_payment_status: paymentStatus
        ? PaymentStatusEnum.parse(paymentStatus)
        : undefined,
    })
    .throwOnError();

  return RegistrationListStatsSchema.parse(data);
};
