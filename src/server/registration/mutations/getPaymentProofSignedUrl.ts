"use server";

import { cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { applyRealtime60sCache } from "@/lib/cache/profiles";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createClient } from "@/lib/supabase/server";

const PAYMENT_PROOFS_BUCKET = "paymentproofs";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function extractPaymentProofPath(path: string): string {
  const trimmedPath = path.trim();

  if (trimmedPath === "") {
    throw new Error("Payment proof path is empty");
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    const url = new URL(trimmedPath);
    const marker = `/paymentproofs/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex < 0) {
      throw new Error("Invalid payment proof URL");
    }

    const extractedPath = url.pathname.slice(markerIndex + marker.length);

    if (!extractedPath) {
      throw new Error("Invalid payment proof URL path");
    }

    return extractedPath;
  }

  return trimmedPath;
}

function normalizeLegacyPaymentProofPath(path: string): string {
  return path.replace(/\.[A-Za-z0-9]+$/, "");
}

export async function getPaymentProofSignedUrl(registrationId: string) {
  "use cache";
  applyRealtime60sCache();
  cacheTag(CACHE_TAGS.registrations.details);

  const cookieStore = await cookies();

  const supabase = await createClient(cookieStore.getAll());

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

  const extractedPath = extractPaymentProofPath(rawProofPath);
  const normalizedPath = normalizeLegacyPaymentProofPath(extractedPath);

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .createSignedUrl(normalizedPath, SIGNED_URL_TTL_SECONDS);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error(
      signedUrlError?.message || "Failed to generate payment proof URL",
    );
  }

  return {
    signedUrl: signedUrlData.signedUrl,
  };
}
