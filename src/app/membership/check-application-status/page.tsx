import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function CheckApplicationStatus() {
  return (
    <div className="flex items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="font-bold text-2xl">
            Check Application Status
          </EmptyTitle>
          <EmptyDescription>
            This page is still not available. Please check back later.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href={"/"}>
            <Button>Go Back Home</Button>
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
