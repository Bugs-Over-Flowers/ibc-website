import { cookies } from "next/headers";
import { Suspense } from "react";
import { getSectors } from "@/server/membership/queries/getSectors";
import { MembershipApplicationForm } from "./_components/MembershipApplicationForm";

export default async function MembershipApplicationPage() {
  const cookieStore = await cookies();
  const sectors = await getSectors(cookieStore.getAll());

  return (
    <div className="container mx-auto py-25">
      <Suspense>
        <MembershipApplicationForm sectors={sectors} />
      </Suspense>
    </div>
  );
}
