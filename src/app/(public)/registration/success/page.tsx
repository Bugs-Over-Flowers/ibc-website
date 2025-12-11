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
    <main className="h-screen">
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
      <main className="flex h-screen flex-col items-center justify-center space-y-5 bg-gray-100 p-5">
        <h1>No registration yet</h1>
        <div>
          You have not registered recently (for the past 7 days). Please
          register first.
        </div>
        <Link href={"/events"}>
          <Button>Go to Events</Button>
        </Link>
      </main>
    );
  }
  return (
    <ResetRegistrationWrapper>
      <main className="h-full p-5 md:p-10">
        <h1>Registration Successful!</h1>

        <Suspense
          fallback={
            <div className="h-full pt-5 pb-5 md:pb-10">
              <Skeleton className="min-h-full rounded-xl bg-neutral-300" />
            </div>
          }
        >
          <EventDetails
            cookieStore={cookieStore.getAll()}
            encodedRegistrationQRData={recentQRData}
          />
        </Suspense>
      </main>
    </ResetRegistrationWrapper>
  );
}
