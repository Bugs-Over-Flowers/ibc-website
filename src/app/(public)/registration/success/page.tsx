import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import CenterSpinner from "@/components/CenterSpinner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import QRCodeItem from "./QRCodeItem";

export default function SuccessPageWrapper() {
  return (
    <Suspense fallback={<CenterSpinner className="size-10" />}>
      <SuccessPage />
    </Suspense>
  );
}

async function SuccessPage() {
  const cookieStore = (await cookies()).get("recentQRData");

  if (!cookieStore || !cookieStore.value) {
    return (
      <main className="p-5 flex items-center justify-center flex-col h-screen bg-gray-100 space-y-5">
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
    <main>
      <h1>Registration Successful!</h1>
      <div className="relative w-50 h-50">
        <Suspense fallback={<Skeleton />}>
          <QRCodeItem encodedRegistrationData={cookieStore.value} />
        </Suspense>
      </div>
    </main>
  );
}
