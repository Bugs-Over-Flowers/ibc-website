"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { getMembers } from "@/server/members/queries/getMembers";

interface MembersTableRowProps {
  member: Awaited<ReturnType<typeof getMembers>>[number];
}

export function MembersTableRow({ member }: MembersTableRowProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = member.logoImageURL && !imageError;
  return (
    <TableRow key={member.businessMemberId}>
      <TableCell className="py-2 font-medium md:py-4">
        <div className="flex min-w-0 max-w-96 items-center gap-2">
          <div className="shrink-0">
            {showImage ? (
              <Image
                alt={member.businessName}
                className="h-12 w-12 shrink-0 rounded object-cover"
                height={40}
                onError={() => setImageError(true)}
                src={member.logoImageURL as string}
                unoptimized
                width={40}
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 font-semibold text-gray-600 text-xs sm:h-10 sm:w-10 sm:text-sm">
                {member.businessName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="line-clamp-1 text-ellipsis font-medium text-base">
              {member.businessName}
            </div>
            <div className="mt-1 space-y-1 text-muted-foreground text-xs md:hidden">
              {member.Sector?.sectorName && (
                <div className="line-clamp-1 text-ellipsis">
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
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden max-w-[120px] truncate md:table-cell">
        {member.Sector?.sectorName}
      </TableCell>
      <TableCell className="hidden max-w-[180px] lg:table-cell">
        <a
          className="block truncate text-blue-600 hover:underline"
          href={member.websiteURL}
          rel="noopener noreferrer"
          target="_blank"
        >
          {member.websiteURL}
        </a>
      </TableCell>
      <TableCell className="hidden whitespace-nowrap text-xs sm:table-cell md:text-sm">
        {new Date(member.joinDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs md:text-sm">
        <div className="flex justify-center">
          <Badge className="px-2 py-1 text-xs" variant="default">
            Active
          </Badge>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Button className="h-8 px-3 text-xs" size="sm" variant="outline">
          <Link
            href={
              `/admin/application/${member.primaryApplicationId}?source=members` as Route
            }
          >
            View Details
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
