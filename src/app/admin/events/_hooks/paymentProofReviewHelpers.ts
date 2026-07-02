import type { Enums } from "@/lib/supabase/db.types";

export type PaymentStatus = Enums<"PaymentStatus">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getNextStatus(
  result: unknown,
  fallback: PaymentStatus,
): PaymentStatus {
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
