"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { getMembers } from "@/server/members/queries/getMembers";
import { useMemberSelection } from "../_hooks/useMemberSelection";
import { MembersTableRow } from "./MembersTableRow";

interface MembersTableProps {
  members: Awaited<ReturnType<typeof getMembers>>;
}

export function MembersTable({ members }: MembersTableProps) {
  const {
    selectedMembers,
    selectedStatus,
    setSelectedStatus,
    handleSelectMember,
    handleClearSelection,
    handleUpdateStatus,
    isPending,
    isUpdateDisabled,
  } = useMemberSelection();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>
            Members List
            <span className="ml-2 font-normal text-muted-foreground text-sm">
              ({members.length} members
              {selectedMembers.size > 0 && `, ${selectedMembers.size} selected`}
              )
            </span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) => setSelectedStatus(value)}
              value={selectedStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {selectedMembers.size > 0 && (
              <Button
                onClick={handleClearSelection}
                size="sm"
                variant="outline"
              >
                Clear Selection
              </Button>
            )}

            <Button
              disabled={isUpdateDisabled}
              onClick={handleUpdateStatus}
              size="sm"
            >
              {isPending ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member) => (
          <MembersTableRow
            isSelected={selectedMembers.has(member.businessMemberId)}
            key={member.businessMemberId}
            member={member}
            onSelectedChange={(selected) =>
              handleSelectMember(member.businessMemberId, selected)
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}
