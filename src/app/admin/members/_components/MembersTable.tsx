"use client";

import { CheckSquare2, Square, Users, X } from "lucide-react";
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
    isSelectionMode,
    setSelectedStatus,
    handleSelectMember,
    handleSelectAll,
    clearSelection,
    enableSelectionMode,
    handleUpdateStatus,
    isPending,
    isUpdateDisabled,
  } = useMemberSelection();

  const allMemberIds = members.map((member) => member.businessMemberId);
  const isAllSelected =
    members.length > 0 && selectedMembers.size === allMemberIds.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-medium text-muted-foreground text-sm">
          {members.length} member{members.length !== 1 ? "s" : ""} found
          {selectedMembers.size > 0 && `, ${selectedMembers.size} selected`}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!isSelectionMode ? (
            <Button
              className="h-10 w-full rounded-xl border border-border bg-card/80 text-foreground transition-all hover:border-primary/30 hover:bg-background sm:w-auto"
              onClick={enableSelectionMode}
              size="sm"
              variant="outline"
            >
              <Users className="mr-2 h-4 w-4" />
              Select Members
            </Button>
          ) : (
            <>
              <Button
                className="h-10 w-full rounded-xl border border-border bg-card/80 text-foreground transition-all hover:border-primary/30 hover:bg-background sm:w-auto"
                onClick={() =>
                  isAllSelected
                    ? clearSelection()
                    : handleSelectAll(allMemberIds)
                }
                size="sm"
                variant="outline"
              >
                {isAllSelected ? (
                  <Square className="mr-2 h-4 w-4" />
                ) : (
                  <CheckSquare2 className="mr-2 h-4 w-4" />
                )}
                {isAllSelected ? "Unselect All" : "Select All"}
              </Button>

              <Button
                className="h-10 w-full rounded-xl border border-border bg-card/80 text-foreground transition-all hover:border-primary/30 hover:bg-background sm:w-auto"
                onClick={clearSelection}
                size="sm"
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {isSelectionMode ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-medium text-muted-foreground text-sm">
            Choose a status and apply it to selected members.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              onValueChange={(value) => setSelectedStatus(value)}
              value={selectedStatus}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border border-border bg-card/80 transition-all hover:border-primary/30 hover:bg-background sm:w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-card p-1 shadow-2xl">
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="h-10 w-full rounded-xl sm:w-auto"
              disabled={isUpdateDisabled}
              onClick={handleUpdateStatus}
              size="sm"
            >
              {isPending ? "Updating..." : "Apply Status"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member) => (
          <MembersTableRow
            isSelected={selectedMembers.has(member.businessMemberId)}
            key={member.businessMemberId}
            member={member}
            onSelectedChange={(selected) =>
              handleSelectMember(member.businessMemberId, selected)
            }
            showCheckbox={isSelectionMode}
          />
        ))}
      </div>
    </div>
  );
}
