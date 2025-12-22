import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import type { getMembers } from "@/server/applications/queries/getMembers";

interface MembersTableRowProps {
  member: Awaited<ReturnType<typeof getMembers>>[number];
}

export function MembersTableRow({ member }: MembersTableRowProps) {
  const isValidImageUrl =
    member.logoImageURL &&
    (member.logoImageURL.startsWith("http://") ||
      member.logoImageURL.startsWith("https://"));

  return (
    <TableRow key={member.businessMemberId}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          {isValidImageUrl ? (
            <Image
              alt={member.businessName}
              className="h-10 w-10 rounded object-cover"
              height={40}
              src={member.logoImageURL as string}
              width={40}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 font-semibold text-gray-600 text-sm">
              {member.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          {member.businessName}
        </div>
      </TableCell>
      <TableCell>{member.Sector?.sectorName}</TableCell>
      <TableCell>
        <a
          className="text-blue-600 hover:underline"
          href={member.websiteURL}
          rel="noopener noreferrer"
          target="_blank"
        >
          {member.websiteURL}
        </a>
      </TableCell>
      <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
      <TableCell>
        <Badge variant="default">Active</Badge>
      </TableCell>
    </TableRow>
  );
}
