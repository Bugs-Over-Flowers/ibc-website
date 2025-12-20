import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type RegistrationListPageProps =
  PageProps<"/admin/events/[eventId]/registration-list">;
export default async function BackButton({
  params,
}: {
  params: RegistrationListPageProps["params"];
}) {
  const { eventId } = await params;
  return (
    <Link className="w-max" href={`/admin/events/${eventId}` as Route}>
      <Button>Back to Event Page</Button>
    </Link>
  );
}
