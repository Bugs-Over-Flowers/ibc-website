"use server";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationWithMembers } from "@/lib/types/application";

export async function getApplicationDetailsById(
  applicationId: string,
  requestCookies: RequestCookie[],
) {
  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Application")
    .select(
      `
      *,
      ApplicationMember(*),
      BusinessMember(identifier),
      Sector(sectorId, sectorName),
      ProofImage(proofImageId, path)
    `,
    )
    .eq("applicationId", applicationId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch application: ${error.message}`);
  }

  const signLogoUrl = async (path: string | null) => {
    if (!path) return null;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const { data: signed, error } = await supabase.storage
      .from("logoimage")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days

    if (!error && signed?.signedUrl) {
      return signed.signedUrl;
    }

    return null;
  };

  const signPaymentProofUrl = async (path: string | null) => {
    if (!path) return null;

    // If it's already a full URL, extract the file path
    if (path.startsWith("http://") || path.startsWith("https://")) {
      // Extract path from: https://xxx.supabase.co/storage/v1/object/public/paymentproofs/filename
      const urlPattern = /\/storage\/v1\/object\/public\/paymentproofs\/(.+)$/;
      const match = path.match(urlPattern);

      if (match?.[1]) {
        const filename = match[1];
        const { data: signed, error } = await supabase.storage
          .from("paymentproofs")
          .createSignedUrl(filename, 60 * 60 * 24 * 30); // 30 days

        if (!error && signed?.signedUrl) {
          return signed.signedUrl;
        }
      }

      // If extraction failed, return null to avoid invalid image src
      return null;
    }

    // Handle relative paths
    const { data: signed, error } = await supabase.storage
      .from("paymentproofs")
      .createSignedUrl(path, 60 * 60 * 24 * 30); // 30 days

    if (!error && signed?.signedUrl) {
      return signed.signedUrl;
    }

    return null;
  };

  const proofImage = data.ProofImage?.[0];
  const signedProofImage = proofImage
    ? {
        ...proofImage,
        path: (await signPaymentProofUrl(proofImage.path)) ?? proofImage.path,
      }
    : undefined;

  const applicationWithSignedLogo = {
    ...data,
    logoImageURL: await signLogoUrl(data.logoImageURL),
    ProofImage: signedProofImage ? [signedProofImage] : [],
  };

  return applicationWithSignedLogo as ApplicationWithMembers;
}
