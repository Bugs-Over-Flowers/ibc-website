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
      <CardContent className="overflow-x-auto">
        <Table className="text-xs md:text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px] md:min-w-auto">
                Company Name
              </TableHead>
              <TableHead className="hidden md:table-cell">Sector</TableHead>
              <TableHead className="hidden lg:table-cell">Website</TableHead>
              <TableHead className="hidden sm:table-cell">Join Date</TableHead>
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
