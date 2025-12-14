import { cacheLife, cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import { ParticipantListRPCSchema } from "@/lib/validation/participant/participant-list";
import { PaymentStatusEnum } from "@/lib/validation/utils";

export const getEventParticipantList = async (
  requestCookies: RequestCookie[],
  {
    eventId,
    searchString,
    paymentStatus,
  }: { eventId: string; searchString?: string; paymentStatus?: string },
) => {
  "use cache";
  cacheLife("seconds");
  cacheTag("eventParticipantList");

  const supabase = await createClient(requestCookies);
  const { data } = await supabase
    .rpc("get_event_participant_list", {
      p_search_text: searchString,
      p_event_id: eventId,
      p_payment_status: paymentStatus
        ? PaymentStatusEnum.parse(paymentStatus)
        : undefined,
    })
    .throwOnError();

  return ParticipantListRPCSchema.array().parse(data);
};
