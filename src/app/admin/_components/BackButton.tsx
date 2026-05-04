"use client";

import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

type BackButtonProps =
  | {
      eventId: string;
      href?: never;
      label?: string;
      back?: never;
    }
  | {
      eventId?: never;
      href: Route;
      label?: string;
      back?: never;
    }
  | {
      eventId?: never;
      href?: never;
      label?: string;
      back: true;
    };

export default function BackButton(props: BackButtonProps) {
  const router = useRouter();
  const label = props.label ?? "Back to Event";

  const handleClick = () => {
    if ("back" in props) {
      router.back();
      return;
    }
    const href: Route =
      "eventId" in props
        ? (`/admin/events/${props.eventId}` as Route)
        : props.href;
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
