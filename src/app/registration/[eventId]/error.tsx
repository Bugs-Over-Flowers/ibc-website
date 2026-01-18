"use client";

import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function RegistrationErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>An unknown error occurred.</EmptyTitle>
        <EmptyDescription>{error.message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => reset()}>Reset</Button>
        <Button onClick={() => router.push("/events")}>
          Return To Events Page
        </Button>
      </EmptyContent>
    </Empty>
  );
}
