import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card>
        <CardContent>
          <p className="text-destructive">
            Unable to load participants. Please try refreshing the page.
          </p>
          <p className="text-muted-foreground text-sm">
            {registrationListStats.error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return <RegistrationStatsComponent {...registrationListStats.data} />;
}
