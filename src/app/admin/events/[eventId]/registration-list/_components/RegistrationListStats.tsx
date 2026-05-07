import type { AsyncResult } from "@/lib/server/types";
import type { RegistrationListStats as RegistrationListStatsData } from "@/lib/validation/registration-management";
import RegistrationStatsComponent from "./RegistrationStatsComponent";

export default function RegistrationListStats({
  statsResult,
}: {
  statsResult: AsyncResult<RegistrationListStatsData, string>;
}) {
  if (!statsResult.success) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        <p>
          Unable to load registration status. Please try refreshing the page.
        </p>
        <p className="mt-1 text-destructive/80 text-xs">{statsResult.error}</p>
      </div>
    );
  }

  return <RegistrationStatsComponent {...statsResult.data} />;
}
