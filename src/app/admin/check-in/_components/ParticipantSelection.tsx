"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ParticipantCheckInItem } from "@/lib/validation/checkin/checkin-list";

const columnDefs: ColumnDef<ParticipantCheckInItem>[] = [
  {
    accessorKey: "Actions",
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected() || row.original.checkedIn}
        disabled={row.original.checkedIn}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    header: "First Name",
    accessorKey: "firstName",
  },
  {
    header: "Last Name",
    accessorKey: "lastName",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "contactNumber",
    accessorKey: "contactNumber",
  },
  {
    header: "Remarks",
    accessorKey: "checkedIn",
    cell: ({ row }) => {},
  },
];

interface ParticipantSelectionProps {
  participantList: ParticipantCheckInItem[];
  handleCheckIn: (participantIds: string[]) => Promise<void>;
  isPending: boolean;
}

export default function ParticipantSelection({
  participantList,
  handleCheckIn,
  isPending,
}: ParticipantSelectionProps) {
  return (
    <DataTable columns={columnDefs} data={participantList}>
      {(table) => {
        const disabled =
          isPending ||
          table.getSelectedRowModel().rows.length === 0 ||
          participantList.every((participant) => participant.checkedIn);
        return (
          <Button
            disabled={disabled}
            onClick={async () => {
              await handleCheckIn(
                table
                  .getSelectedRowModel()
                  .rows.map((r) => r.original.participantId),
              );

              // uncheck all rows after check-in
              table.toggleAllPageRowsSelected(false);
            }}
          >
            {isPending ? "Loading..." : "Check In"}
          </Button>
        );
      }}
    </DataTable>
  );
}
