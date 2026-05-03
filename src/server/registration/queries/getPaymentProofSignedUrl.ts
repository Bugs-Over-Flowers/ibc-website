"use server";

import { cacheTag } from "next/cache";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { z } from "zod";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { signPaymentProofUrl } from "@/lib/storage/signedUrls";
import { createClient } from "@/lib/supabase/server";

const getPaymentProofSignedUrlInputSchema = z.object({
  registrationId: z.string().min(1),
});

export async function getPaymentProofSignedUrl(input: {
  registrationId: string;
}) {
  const parsed = getPaymentProofSignedUrlInputSchema.parse(input);
  const cookieStore = await cookies();

  return getCachedPaymentProofSignedUrl(
    cookieStore.getAll(),
    parsed.registrationId,
  );
}

async function getCachedPaymentProofSignedUrl(
  requestCookies: RequestCookie[],
  registrationId: string,
) {
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.registrations.details);

  const supabase = await createClient(requestCookies);

  const { data: registration, error: registrationError } = await supabase
    .from("Registration")
    .select("paymentMethod, ProofImage(path)")
    .eq("registrationId", registrationId)
    .single();

  if (registrationError || !registration) {
    throw new Error(registrationError?.message || "Registration not found");
  }

  if (registration.paymentMethod !== "BPI") {
    throw new Error("Payment proof is only available for BPI payments");
  }

  const rawProofPath = registration.ProofImage?.[0]?.path;

  if (!rawProofPath) {
    throw new Error("No payment proof uploaded for this registration");
  }

  const signedUrl = await signPaymentProofUrl(supabase, rawProofPath);

  if (!signedUrl) {
    throw new Error("Failed to generate payment proof URL");
  }

  return {
    signedUrl,
  };
}
