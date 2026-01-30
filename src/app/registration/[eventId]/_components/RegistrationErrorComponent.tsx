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

interface RegistrationErrorComponentProps {
  message: string;
}

export default function RegistrationErrorComponent({
  message,
}: RegistrationErrorComponentProps) {
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
