"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteEvents } from "../actions/deleteEvents";

interface DeleteButtonProps {
  id: string;
}

async function tryCatch<T>(
  promise: Promise<T>,
): Promise<
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: unknown }
> {
  try {
    const data = await promise;
    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, data: null, error };
  }
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    startTransition(async () => {
      const result = await tryCatch(deleteEvents(id));

      if (result.success) {
        router.refresh();
        toast.success("Event deleted successfully");
      } else {
        console.error("Failed to delete event", result.error);

        let errorMessage = "Failed to delete event";

        if (result.error instanceof Error) {
          errorMessage = result.error.message;
        } else if (typeof result.error === "string") {
          errorMessage = result.error;
        } else if (
          result.error &&
          typeof result.error === "object" &&
          "message" in result.error
        ) {
          errorMessage = String(result.error.message);
        }

        toast.error(errorMessage);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={isPending ? "Deleting event..." : "Delete event"}
    >
      {isPending ? "Deleting..." : <Trash2 />}
    </button>
  );
}
