import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface NotReadyEventProps {
  title: string;
}

export default function NotReadyEvent({ title }: NotReadyEventProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <CircleAlert />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          This event is not ready for registration yet. Please check back later.
        </EmptyDescription>
      </EmptyHeader>
      <Link href={"/events"}>
        <Button>Return To Events Page</Button>
      </Link>
    </Empty>
  );
}
