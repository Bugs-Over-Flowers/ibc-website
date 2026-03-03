import type { Enums } from "@/lib/supabase/db.types";

export type PaymentProofStatus = Enums<"PaymentProofStatus">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getNextStatus(
  result: unknown,
  fallback: PaymentProofStatus,
): PaymentProofStatus {
  if (isRecord(result) && typeof result.status === "string") {
    if (
      result.status === "pending" ||
      result.status === "accepted" ||
      result.status === "rejected"
    ) {
      return result.status;
    }
  }

  return fallback;
}

export function getResultMessage(result: unknown, fallback: string): string {
  if (typeof result === "string" && result.trim()) {
    return result;
  }

  if (isRecord(result) && typeof result.message === "string") {
    return result.message;
  }

  return fallback;
}

export function getResultPath(result: unknown): string | null {
  if (isRecord(result) && typeof result.path === "string" && result.path) {
    return result.path;
  }

  return null;
}

export function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read image"));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image"));
    };

    reader.readAsDataURL(file);
  });
}
