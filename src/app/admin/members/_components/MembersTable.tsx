import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getMembers } from "@/server/applications/queries/getMembers";
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
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <MembersTableRow key={member.businessMemberId} member={member} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
