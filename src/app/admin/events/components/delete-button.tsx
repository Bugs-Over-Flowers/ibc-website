"use client";

import { useTransition } from "react";
import { deleteEvents } from "../actions/deleteEvent";

interface DeleteButtonProps {
  id: string;
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteEvents(id);
          location.reload();
        })
      }
      className="text-red-600 hover:underline"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
