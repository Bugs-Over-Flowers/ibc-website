"use server";

import { cookies } from "next/headers";
import { z } from "zod";
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
  const supabase = await createClient(cookieStore.getAll());

  const { data: registration, error: registrationError } = await supabase
    .from("Registration")
    .select("paymentMethod, ProofImage(path, proofImageId, orderIndex)")
    .eq("registrationId", parsed.registrationId)
    .single();

  if (registrationError || !registration) {
    throw new Error(registrationError?.message || "Registration not found");
  }

  if (registration.paymentMethod !== "BPI") {
    throw new Error("Payment proof is only available for BPI payments");
  }

  const proofs = (registration.ProofImage ?? [])
    .filter((proof) => proof.path)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  if (proofs.length === 0) {
    throw new Error("No payment proof uploaded for this registration");
  }

  return {
    proofs: (
      await Promise.all(
        proofs.map(async (proof) => {
          const signedUrl = await signPaymentProofUrl(supabase, proof.path);

          if (!signedUrl) {
            return null;
          }

          return {
            proofImageId: proof.proofImageId,
            signedUrl,
            orderIndex: proof.orderIndex ?? 0,
            path: proof.path,
          };
        }),
      )
    ).filter(Boolean) as Array<{
      proofImageId: string;
      signedUrl: string;
      orderIndex: number;
      path: string;
    }>,
  };
}
