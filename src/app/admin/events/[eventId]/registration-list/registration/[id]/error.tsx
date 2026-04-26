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
  reset,
}: {
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <Empty className="flex h-full items-center">
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>An unknown error occurred.</EmptyTitle>
        <EmptyDescription>
          This Registration could not be loaded.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex flex-row items-center justify-center gap-3">
        <Button onClick={() => reset()}>Reset</Button>
        <Button onClick={() => router.back()}>Go Back</Button>
      </EmptyContent>
    </Empty>
  );
}
