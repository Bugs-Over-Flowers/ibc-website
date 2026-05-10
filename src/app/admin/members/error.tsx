"use client";

import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function MembersErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Empty className="flex h-full items-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>Page Unavailable at the moment</EmptyTitle>
        <EmptyDescription>
          Please contact the developers for help.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex flex-row items-center justify-center gap-3">
        <Button onClick={() => reset()}>Try Again</Button>
      </EmptyContent>
    </Empty>
  );
}
