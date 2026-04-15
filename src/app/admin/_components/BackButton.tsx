"use client";

import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

type BackButtonProps =
  | {
      eventId: string;
      href?: never;
      label?: string;
    }
  | {
      eventId?: never;
      href: Route;
      label?: string;
    };

export default function BackButton(props: BackButtonProps) {
  const router = useRouter();
  const label = props.label ?? "Back to Event";
  const href: Route =
    "eventId" in props
      ? (`/admin/events/${props.eventId}` as Route)
      : props.href;

  const handleClick = () => {
    router.push(href);
  };

  return (
    <button
      className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
      onClick={handleClick}
      type="button"
    >
      <ChevronLeft className="h-5 w-5" />
      {label}
    </button>
  );
}
