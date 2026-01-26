import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getMembers } from "@/server/members/queries/getMembers";
import { MembersTableRow } from "./MembersTableRow";

interface MembersTableProps {
  members: Awaited<ReturnType<typeof getMembers>>;
}

export function MembersTable({ members }: MembersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Members List
          <span className="ml-2 font-normal text-muted-foreground text-sm">
            ({members.length} members)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <MembersTableRow key={member.businessMemberId} member={member} />
        ))}
      </CardContent>
    </Card>
  );
}
