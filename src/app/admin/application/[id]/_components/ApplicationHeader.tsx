import { Badge } from "@/components/ui/badge";
import type { getApplicationById } from "@/server/applications/queries/getApplications";
import ApplicationActions from "../../_components/ApplicationActions";
import ExportPDFButton from "../../_components/ExportPDFButton";

interface ApplicationHeaderProps {
  application: Awaited<ReturnType<typeof getApplicationById>>;
}

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-bold text-3xl">{application.companyName}</h1>
          <p className="mt-1 text-muted-foreground">
            Application #{application.applicationId.slice(0, 8)}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportPDFButton application={application} />
          {!application.memberId && (
            <ApplicationActions applicationId={application.applicationId} />
          )}
        </div>
      </div>

      {application.memberId && (
        <div className="flex items-center gap-2">
          <Badge className="text-sm" variant="default">
            Approved
          </Badge>
          <span className="text-muted-foreground text-sm">
            Member ID: {application.memberId}
          </span>
        </div>
      )}
    </>
  );
}
