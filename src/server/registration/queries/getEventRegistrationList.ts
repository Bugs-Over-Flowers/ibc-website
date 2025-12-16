import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import {
  type RegistrationItem,
  RegistrationListRPCSchema,
} from "@/lib/validation/registration/registration-list";
import { PaymentStatusEnum } from "@/lib/validation/utils";

interface GetRegistrationListParams {
  eventId: string;
  searchString?: string;
  paymentStatus?: string;
}

export const getEventRegistrationList = async (
  requestCookies: RequestCookie[],
  { eventId, searchString, paymentStatus }: GetRegistrationListParams,
): Promise<RegistrationItem[]> => {
  "use cache";
  cacheLife("seconds");
  cacheTag("registration-list");
  const supabase = await createClient(requestCookies);

  const query = await supabase
    .rpc("get_registration_list", {
      p_event_id: eventId,
      p_search_text: searchString,
      p_payment_status: paymentStatus
        ? PaymentStatusEnum.parse(paymentStatus)
        : undefined,
    })
    .throwOnError();

  console.log(query.data);

  return RegistrationListRPCSchema.array().parse(query.data);
};
