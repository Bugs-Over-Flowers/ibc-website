"use client";

import { Button } from "@/components/ui/button";
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
    handleUpdateStatus,
    isPending,
    isUpdateDisabled,
  } = useMemberSelection();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="font-medium text-muted-foreground text-sm">
          {members.length} member{members.length !== 1 ? "s" : ""} found
          {selectedMembers.size > 0 && `, ${selectedMembers.size} selected`}
        </div>

        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => setSelectedStatus(value)}
            value={selectedStatus}
          >
            <SelectTrigger className="h-10 w-[180px] rounded-xl border-border/60 bg-card">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 bg-card">
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="h-10 rounded-xl"
            disabled={isUpdateDisabled}
            onClick={handleUpdateStatus}
            size="sm"
          >
            {isPending ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </div>
  );
}
