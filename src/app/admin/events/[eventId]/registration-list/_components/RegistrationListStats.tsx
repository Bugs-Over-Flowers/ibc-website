import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationListPageProps } from "@/lib/types/route";
import { getRegistrationListStats } from "@/server/registration/queries/getRegistrationListStats";
import RegistrationStatsComponent from "./RegistrationStatsComponent";

export default async function RegistrationListStats({
  params,
}: {
  params: RegistrationListPageProps["params"];
}) {
  const { eventId } = await params;

  const cookieStore = await cookies();
  const registrationListStats = await tryCatch(
    getRegistrationListStats(cookieStore.getAll(), {
      eventId,
    }),
  );

  if (!registrationListStats.success) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        <p>
          Unable to load registration status. Please try refreshing the page.
        </p>
        <p className="mt-1 text-destructive/80 text-xs">
          {registrationListStats.error}
        </p>
      </div>
    );
  }

  return <RegistrationStatsComponent {...registrationListStats.data} />;
}
