import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptySectionProps {
  message: string;
}

export default function EmptySection({ message }: EmptySectionProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>Error</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>{message}</EmptyDescription>
        <Link href={"/events"}>
          <Button>Return To Events Page</Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
