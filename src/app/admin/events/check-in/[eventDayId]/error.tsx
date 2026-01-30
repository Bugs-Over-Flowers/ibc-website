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

interface CheckInErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CheckInErrorPage({
  error,
  reset,
}: CheckInErrorPageProps) {
  const router = useRouter();
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>Error</EmptyTitle>
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
