"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { getRegistrationIdentifierDetails } from "@/server/attendance/mutations/getRegistrationIdentifierDetails";
import { useCheckIn } from "../_hooks/useCheckIn";

type ParticipantListRow = Extract<
  Awaited<ReturnType<typeof getRegistrationIdentifierDetails>>,
  { status: "partial" }
>["data"]["participantList"][number];

const columnDefs: ColumnDef<ParticipantListRow>[] = [
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
        checked={row.getIsSelected() || row.original.checkIn}
        disabled={row.original.checkIn}
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
];

interface ParticipantSelectionProps {
  participantList: ParticipantListRow[];
  eventDayId: string;
}

export default function ParticipantSelection({
  participantList,
  eventDayId,
}: ParticipantSelectionProps) {
  const action = useCheckIn();

  const handleCheckIn = async (participantIds: string[]) => {
    if (!participantIds.length) {
      toast.error("Please select at least one participant");
      return;
    }
    await action.execute(participantIds, eventDayId);
  };

  return (
    <DataTable columns={columnDefs} data={participantList}>
      {(table) => (
        <>
          <Button
            onClick={() =>
              handleCheckIn(
                table
                  .getSelectedRowModel()
                  .rows.map((r) => r.original.participantId),
              )
            }
          >
            {action.isPending ? "Loading..." : "Check In"}
          </Button>
        </>
      )}
    </DataTable>
  );
}
