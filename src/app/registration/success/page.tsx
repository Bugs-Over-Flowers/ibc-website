import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import CenterSpinner from "@/components/CenterSpinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EventDetails from "./_components/EventDetails";
import ResetRegistrationWrapper from "./_components/ResetRegistrationWrapper";

export default function SuccessPageWrapper() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<CenterSpinner className="size-10" />}>
        <SuccessPage />
      </Suspense>
    </main>
  );
}

async function SuccessPage() {
  const cookieStore = await cookies();
  const recentQRData = cookieStore.get("recentQRData")?.value;

  if (!recentQRData) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center space-y-5 text-center">
        <h1 className="font-semibold text-foreground text-xl">
          No registration yet
        </h1>
        <p className="max-w-xl text-muted-foreground">
          You have not registered recently (for the past 14 days). Please
          register first.
        </p>
        <Link href={"/events"}>
          <Button>Go to Events</Button>
        </Link>
      </section>
    );
  }
  return (
    <ResetRegistrationWrapper>
      <Suspense
        fallback={
          <Skeleton className="mx-auto h-[720px] w-full max-w-4xl rounded-2xl bg-neutral-200" />
        }
      >
        <EventDetails
          cookieStore={cookieStore.getAll()}
          registrationIdentifier={recentQRData}
        />
      </Suspense>
    </ResetRegistrationWrapper>
  );
}
