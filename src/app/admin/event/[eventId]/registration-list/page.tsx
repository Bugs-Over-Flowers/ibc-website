import type { Route } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import tryCatch from "@/lib/server/tryCatch";
import { parseStringParam } from "@/lib/utils";
import {
  getRegistrationList,
  getRegistrationListStats,
} from "@/server/events/queries/getRegistrationList";
import {
  RegistrationListStatsSkeleton,
  RegistrationListTableSkeleton,
} from "./_components/page-skeletons";
import RegistrationList from "./_components/RegistrationList";
import RegistrationSearchAndFilter from "./_components/RegistrationSearchAndFilter";
import RegistrationStatsComponent from "./_components/RegistrationStatsComponent";

type pageProps = PageProps<"/admin/event/[eventId]/registration-list">;
export default function RegistrationPageWrapper({
  params,
  searchParams,
}: pageProps) {
  return (
    <main className="flex flex-col gap-4 p-5 md:p-10">
      <Suspense
        fallback={
          <Link href={`/admin/events` as Route}>
            <Button variant="outline">Back to Event Page</Button>
          </Link>
        }
      >
        <BackButton params={params} />
      </Suspense>
      <Suspense fallback={<RegistrationListStatsSkeleton />}>
        <RegistrationListStats params={params} searchParams={searchParams} />
      </Suspense>
      <Suspense
        fallback={<Skeleton className="h-32 rounded-xl bg-neutral-200" />}
      >
        <RegistrationSearchAndFilter />
      </Suspense>

      <Suspense fallback={<RegistrationListTableSkeleton />}>
        <RegistrationListTable params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BackButton({ params }: { params: pageProps["params"] }) {
  const { eventId } = await params;
  return (
    <Link className="w-max" href={`/admin/event/${eventId}` as Route}>
      <Button>Back to Event Page</Button>
    </Link>
  );
}

async function RegistrationListStats({ params, searchParams }: pageProps) {
  const { eventId } = await params;
  const { affiliation, paymentStatus } = await searchParams;

  const cookieStore = await cookies();
  const registrationList = await tryCatch(
    getRegistrationListStats(cookieStore.getAll(), {
      eventId,
      affiliation: parseStringParam(affiliation),
      paymentStatus: parseStringParam(paymentStatus),
    }),
  );

  if (!registrationList.success) {
    return <div>Error: {registrationList.error}</div>;
  }

  const { total, verified, pending } = registrationList.data;

  return (
    <RegistrationStatsComponent
      pending={pending}
      total={total}
      verified={verified}
    />
  );
}

async function RegistrationListTable({ params, searchParams }: pageProps) {
  const { eventId } = await params;
  const { affiliation, paymentStatus } = await searchParams;
  const cookieStore = await cookies();

  const registrationList = await tryCatch(
    getRegistrationList(cookieStore.getAll(), {
      eventId,
      affiliation: parseStringParam(affiliation),
      paymentStatus: parseStringParam(paymentStatus),
    }),
  );

  if (!registrationList.success) {
    return <div>Error: {registrationList.error}</div>;
  }
  return <RegistrationList registrationList={registrationList.data} />;
}
