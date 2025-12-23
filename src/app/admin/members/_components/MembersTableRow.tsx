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
      <TableCell className="py-2 font-medium md:py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {isValidImageUrl ? (
            <Image
              alt={member.businessName}
              className="h-8 w-8 flex-shrink-0 rounded object-cover sm:h-10 sm:w-10"
              height={40}
              src={member.logoImageURL as string}
              width={40}
            />
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 font-semibold text-gray-600 text-xs sm:h-10 sm:w-10 sm:text-sm">
              {member.businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="line-clamp-2">{member.businessName}</span>
        </div>
        <div className="mt-1 space-y-1 text-muted-foreground text-xs md:hidden">
          {member.Sector?.sectorName && (
            <div>
              <span className="font-semibold">Sector:</span>{" "}
              {member.Sector.sectorName}
            </div>
          )}
          {member.websiteURL && (
            <a
              className="block truncate text-blue-600 hover:underline"
              href={member.websiteURL}
              rel="noopener noreferrer"
              target="_blank"
            >
              {member.websiteURL}
            </a>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {member.Sector?.sectorName}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <a
          className="block truncate text-blue-600 hover:underline"
          href={member.websiteURL}
          rel="noopener noreferrer"
          target="_blank"
        >
          {member.websiteURL}
        </a>
      </TableCell>
      <TableCell className="hidden text-xs sm:table-cell md:text-sm">
        {new Date(member.joinDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-xs md:text-sm">
        <Badge className="text-xs" variant="default">
          Active
        </Badge>
      </TableCell>
    </TableRow>
  );
}
