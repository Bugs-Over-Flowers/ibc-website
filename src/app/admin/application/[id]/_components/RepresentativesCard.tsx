import { Badge } from "@/components/ui/badge";
import type { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import { DetailRow } from "./DetailRow";

interface RepresentativesCardProps {
  members: Awaited<
    ReturnType<typeof getApplicationDetailsById>
  >["ApplicationMember"];
}

export function RepresentativesCard({ members }: RepresentativesCardProps) {
  if (!members || members.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h2 className="font-semibold leading-none tracking-tight">
          Company Representatives
        </h2>
      </div>
      <div className="space-y-6 p-6 pt-0">
        {members.map((member) => (
          <div
            className="border-b pb-4 last:border-0 last:pb-0"
            key={member.applicationMemberId}
          >
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-semibold">
                {member.firstName} {member.lastName}
              </h3>
              <Badge variant="secondary">{member.companyMemberType}</Badge>
            </div>
            <div className="grid gap-2 text-sm">
              <DetailRow
                label="Designation"
                value={member.companyDesignation}
              />
              <DetailRow label="Email" value={member.emailAddress} />
              <DetailRow label="Mobile" value={member.mobileNumber} />
              <DetailRow
                label="Birthdate"
                value={new Date(member.birthdate).toLocaleDateString()}
              />
              <DetailRow label="Nationality" value={member.nationality} />
              <DetailRow label="Sex" value={member.sex} />
              <DetailRow
                label="Mailing Address"
                value={member.mailingAddress}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
