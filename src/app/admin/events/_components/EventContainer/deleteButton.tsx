"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteEvents } from "../../../../../server/events/actions/deleteEvents";

interface DeleteButtonProps {
  id: string;
  onAction?: () => void;
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

export default function DeleteButton({ id, onAction }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async () => {
    if (onAction) onAction();
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
    <DropdownMenuItem
      aria-label={isPending ? "Deleting event..." : "Delete event"}
      className="flex flex-row items-center text-red-400 text-sm"
      onSelect={(e) => {
        e.preventDefault();
        handleDelete();
      }}
    >
      {isPending ? (
        <span className="flex items-center">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Deleting...
        </span>
      ) : (
        <>
          <Trash2 className="mr-2 hover:text-blue-400" color="red" size={16} />
          Delete
        </>
      )}
    </DropdownMenuItem>
  );
}
