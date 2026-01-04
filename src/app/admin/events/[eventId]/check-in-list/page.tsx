import Link from "next/link";
import { Suspense } from "react";
import BackButton from "../_components/BackButton";
import CheckInPageComponent from "./_components/CheckInPageComponent";

export default function CheckInPage({
  params,
}: {
  params: PageProps<"/admin/events/[eventId]/check-in-list">["params"];
}) {
  return (
    <main className="space-y-4">
      <Suspense fallback={<Link href={"/admin/events"}>Back to Events</Link>}>
        <BackButton params={params} />
      </Suspense>
      <Suspense>
        <CheckInPageComponent params={params} />
      </Suspense>
    </main>
  );
}
