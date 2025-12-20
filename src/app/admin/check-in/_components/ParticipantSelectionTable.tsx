"use client";

import type { ColumnDef, Row } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from "@/components/DataTable";
import { SelectableRowDataTable } from "@/components/SelectableRowDataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { areRecordsEqual } from "@/lib/utils";
import type { ParticipantCheckInItem } from "@/lib/validation/checkin/checkin-list";
import { useCheckInStore } from "../_hooks/useCheckInStore.store";
import RemarksDialog from "./RemarksDialog";

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
        onCheckedChange={(value) => row.toggleSelected(!value)}
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
    accessorKey: "remarks",
    cell: ({ row }) => {
      return (
        <RemarksDialog
          participantId={row.original.participantId}
          participantName={`${row.original.firstName} ${row.original.lastName}`}
          remarks={row.original.remarks}
        />
      );
    },
  },
];

interface ParticipantSelectionTableProps {
  participantList: ParticipantCheckInItem[];
  handleCheckIn: (participantIds: string[]) => Promise<void>;
  isPending: boolean;
}

export default function ParticipantSelectionTable({
  participantList,
  handleCheckIn,
  isPending,
}: ParticipantSelectionTableProps) {
  const newRemarks = useCheckInStore((state) => state.newRemarks);
  const remarks = useCheckInStore((state) => state.remarks);

  const [rowSelection, setRowSelection] = useState({});

  const onCheckIn = async (participantIds: string[]) => {
    console.log("Current remarks in store:", remarks);
    console.log("New remarks in store:", newRemarks);

    console.log("Participant IDs to check in:", participantIds);
    handleCheckIn(participantIds);
  };

  const onRowSelectionChange = (row: Row<ParticipantCheckInItem>) => {
    if (row.original.checkedIn) {
      console.log("CHECKED IN PARTICIPANT - CANNOT CHANGE SELECTION");
      return;
    }
    console.log(
      "Toggling selection for participant ID:",
      row.original.participantId,
    );

    row.toggleSelected();
  };
  return (
    <SelectableRowDataTable
      columns={columnDefs}
      customRowSelectHandler={onRowSelectionChange}
      data={participantList}
      onRowSelectionChange={setRowSelection}
      rowSelection={rowSelection}
    >
      {(table) => {
        const disabled =
          isPending ||
          table.getSelectedRowModel().rows.length === 0 ||
          participantList.every((participant) => participant.checkedIn);
        return (
          <Button
            disabled={disabled && areRecordsEqual(remarks, newRemarks)}
            onClick={() =>
              onCheckIn(
                table
                  .getSelectedRowModel()
                  .rows.map((row) => row.original.participantId),
              ).then(() => {
                table.toggleAllPageRowsSelected(false);
              })
            }
          >
            {isPending ? "Loading..." : "Check In"}
          </Button>
        );
      }}
    </SelectableRowDataTable>
  );
}
