"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";

const PAYMENT_PROOFS_BUCKET = "paymentproofs";

const replacePaymentProofAndAcceptSchema = z.object({
  registrationId: z.string().min(1),
  imageDataUrl: z
    .string()
    .regex(/^data:image\/(jpeg|jpg|png);base64,[A-Za-z0-9+/=\n\r]+$/),
});

function extractPaymentProofPath(path: string): string {
  const trimmedPath = path.trim();

  if (trimmedPath === "") {
    throw new Error("Payment proof path is empty");
  }

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    const url = new URL(trimmedPath);
    const marker = `/${PAYMENT_PROOFS_BUCKET}/`;
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

function parseDataUrl(dataUrl: string): {
  contentType: string;
  buffer: Buffer;
} {
  const [meta, encoded] = dataUrl.split(",");

  if (!meta || !encoded) {
    throw new Error("Invalid image data format");
  }

  const contentTypeMatch = /^data:(image\/(?:jpeg|jpg|png));base64$/.exec(meta);

  if (!contentTypeMatch) {
    throw new Error("Unsupported image type");
  }

  const contentType =
    contentTypeMatch[1] === "image/jpg" ? "image/jpeg" : contentTypeMatch[1];

  return {
    contentType,
    buffer: Buffer.from(encoded, "base64"),
  };
}

export async function replacePaymentProofAndAccept(input: {
  registrationId: string;
  imageDataUrl: string;
}) {
  const { registrationId, imageDataUrl } =
    replacePaymentProofAndAcceptSchema.parse(input);

  const supabase = await createActionClient();

  const { data: registration, error: registrationError } = await supabase
    .from("Registration")
    .select("paymentMethod, ProofImage(proofImageId, path)")
    .eq("registrationId", registrationId)
    .single();

  if (registrationError || !registration) {
    throw new Error(registrationError?.message || "Registration not found");
  }

  if (registration.paymentMethod !== "BPI") {
    throw new Error(
      "Payment proof replacement is only allowed for BPI payments",
    );
  }

  const { contentType, buffer } = parseDataUrl(imageDataUrl);

  const existingProof = registration.ProofImage?.[0];
  const oldPath = existingProof?.path;

  if (oldPath) {
    const normalizedOldPath = normalizeLegacyPaymentProofPath(
      extractPaymentProofPath(oldPath),
    );

    const { error: removeOldImageError } = await supabase.storage
      .from(PAYMENT_PROOFS_BUCKET)
      .remove([normalizedOldPath]);

    if (removeOldImageError) {
      throw new Error(removeOldImageError.message);
    }
  }

  const uploadPathBase = `reg-${crypto.randomUUID()}`;
  const fileExtension = contentType === "image/png" ? "png" : "jpg";

  const { data: uploaded, error: uploadError } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(uploadPathBase, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError || !uploaded?.path) {
    throw new Error(uploadError?.message || "Failed to upload payment proof");
  }

  const nextProofPath = `${uploaded.path}.${fileExtension}`;

  if (existingProof?.proofImageId) {
    const { error: updateProofError } = await supabase
      .from("ProofImage")
      .update({ path: nextProofPath })
      .eq("proofImageId", existingProof.proofImageId);

    if (updateProofError) {
      throw new Error(updateProofError.message);
    }
  } else {
    const { error: insertProofError } = await supabase
      .from("ProofImage")
      .insert({
        path: nextProofPath,
        registrationId,
      });

    if (insertProofError) {
      throw new Error(insertProofError.message);
    }
  }

  const { error: statusUpdateError } = await supabase
    .from("Registration")
    .update({ paymentProofStatus: "accepted" })
    .eq("registrationId", registrationId);

  if (statusUpdateError) {
    throw new Error(statusUpdateError.message);
  }

  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);

  return {
    message: "Payment proof replaced and accepted",
    path: nextProofPath,
    status: "accepted" as const,
  };
}
